const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const bcrypt = require('bcrypt');

// Cadastro
router.post('/cadastro', async (req, res) => {
    const { nome, email, senha } = req.body;
    try {
        const hash = await bcrypt.hash(senha, 10);
        const result = await pool.query(
            'INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3) RETURNING id, nome, email',
            [nome, email, hash]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(400).json({ erro: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    try {
        const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (result.rows.length === 0) return res.status(401).json({ erro: 'Usuário não encontrado' });
        
        const usuario = result.rows[0];
        const valido = await bcrypt.compare(senha, usuario.senha);
        if (!valido) return res.status(401).json({ erro: 'Senha incorreta' });

        res.json({ mensagem: 'Login bem sucedido', usuario_id: usuario.id });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

module.exports = router;