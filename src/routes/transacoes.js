const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Adicionar transação
router.post('/', async (req, res) => {
    const { usuario_id, categoria_id, descricao, valor, tipo } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO transacoes (usuario_id, categoria_id, descricao, valor, tipo) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [usuario_id, categoria_id, descricao, valor, tipo]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(400).json({ erro: err.message });
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

module.exports = router;