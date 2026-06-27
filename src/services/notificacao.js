const twilio = require('twilio');
const pool = require('../config/db');

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

async function enviarResumoWhatsApp() {
    try {
        // Resumo das últimas 2h
        const result = await pool.query(`
            SELECT 
                SUM(CASE WHEN tipo = 'saida' THEN valor ELSE 0 END) as total_saidas,
                SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE 0 END) as total_entradas,
                COUNT(*) as total_transacoes
            FROM transacoes
            WHERE data >= NOW() - INTERVAL '2 hours'
        `);

        // Parcelas vencendo nos próximos 3 dias
        const parcelas = await pool.query(`
            SELECT p.*, t.descricao, t.total_parcelas
            FROM parcelas p
            JOIN transacoes t ON p.transacao_id = t.id
            WHERE p.pago = FALSE
            AND p.data_vencimento BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 days'
            ORDER BY p.data_vencimento ASC
        `);

        const { total_saidas, total_entradas, total_transacoes } = result.rows[0];

        let mensagem = `💰 *Resumo Financeiro - Últimas 2h*\n\n` +
            `📊 Transações: ${total_transacoes}\n` +
            `🔴 Saídas: R$ ${Number(total_saidas || 0).toFixed(2)}\n` +
            `🟢 Entradas: R$ ${Number(total_entradas || 0).toFixed(2)}\n` +
            `💵 Saldo: R$ ${Number((total_entradas || 0) - (total_saidas || 0)).toFixed(2)}`;

        if (parcelas.rows.length > 0) {
            mensagem += `\n\n⚠️ *Parcelas vencendo em breve:*\n`;
            for (const p of parcelas.rows) {
                const data = new Date(p.data_vencimento).toLocaleDateString('pt-BR');
                mensagem += `📌 ${p.descricao} — Parcela ${p.numero_parcela}/${p.total_parcelas} — R$ ${Number(p.valor).toFixed(2)} — Vence: ${data}\n`;
            }
        }

        const numeros = process.env.TWILIO_WHATSAPP_TO.split(',');
        for (const numero of numeros) {
            await client.messages.create({
                from: process.env.TWILIO_WHATSAPP_FROM,
                to: numero.trim(),
                body: mensagem
            });
        }

        console.log('Notificação enviada com sucesso!');
    } catch (err) {
        console.error('Erro ao enviar notificação:', err.message);
    }
}

module.exports = { enviarResumoWhatsApp };