const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Adicionar transação (com suporte a parcelamento)
router.post('/', async (req, res) => {
    const { usuario_id, categoria_id, descricao, valor, tipo, parcelado, total_parcelas, data_vencimento } = req.body;
    
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const result = await client.query(
            `INSERT INTO transacoes 
            (usuario_id, categoria_id, descricao, valor, tipo, parcelado, total_parcelas, data_vencimento) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [usuario_id, categoria_id, descricao, valor, tipo, parcelado || false, total_parcelas || 1, data_vencimento]
        );

        const transacao = result.rows[0];

        // Se for parcelado, cria as parcelas automaticamente
        if (parcelado && total_parcelas > 1) {
            const valorParcela = (valor / total_parcelas).toFixed(2);
            const dataBase = new Date(data_vencimento);

            for (let i = 0; i < total_parcelas; i++) {
                const dataVenc = new Date(dataBase);
                dataVenc.setMonth(dataVenc.getMonth() + i);

                await client.query(
                    `INSERT INTO parcelas (transacao_id, numero_parcela, valor, data_vencimento)
                     VALUES ($1, $2, $3, $4)`,
                    [transacao.id, i + 1, valorParcela, dataVenc]
                );
            }
        }

        await client.query('COMMIT');
        res.status(201).json(transacao);
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(400).json({ erro: err.message });
    } finally {
        client.release();
    }
});

// Listar transações do usuário
router.get('/:usuario_id', async (req, res) => {
    const { usuario_id } = req.params;
    try {
        const result = await pool.query(
            `SELECT t.*, c.nome as categoria FROM transacoes t
             LEFT JOIN categorias c ON t.categoria_id = c.id
             WHERE t.usuario_id = $1 ORDER BY t.data DESC`,
            [usuario_id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// Listar parcelas pendentes do usuário
router.get('/:usuario_id/parcelas/pendentes', async (req, res) => {
    const { usuario_id } = req.params;
    try {
        const result = await pool.query(
            `SELECT p.*, t.descricao, t.total_parcelas FROM parcelas p
             JOIN transacoes t ON p.transacao_id = t.id
             WHERE t.usuario_id = $1 AND p.pago = FALSE
             ORDER BY p.data_vencimento ASC`,
            [usuario_id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

module.exports = router;