const twilio = require('twilio');
const pool = require('../config/db');

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

async function enviarResumoWhatsApp() {
    try {
        const result = await pool.query(`
            SELECT 
                SUM(CASE WHEN tipo = 'saida' THEN valor ELSE 0 END) as total_saidas,
                SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE 0 END) as total_entradas,
                COUNT(*) as total_transacoes
            FROM transacoes
            WHERE data >= NOW() - INTERVAL '2 hours'
        `);

        const { total_saidas, total_entradas, total_transacoes } = result.rows[0];

        const mensagem = `💰 *Resumo Financeiro - Últimas 2h*\n\n` +
            `📊 Transações: ${total_transacoes}\n` +
            `🔴 Saídas: R$ ${Number(total_saidas || 0).toFixed(2)}\n` +
            `🟢 Entradas: R$ ${Number(total_entradas || 0).toFixed(2)}\n` +
            `💵 Saldo: R$ ${Number((total_entradas || 0) - (total_saidas || 0)).toFixed(2)}`;

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