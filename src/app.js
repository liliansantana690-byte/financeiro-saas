const express = require('express');
const app = express();
const { enviarResumoWhatsApp } = require('./services/notificacao');
const { gerarConnectToken } = require('./services/pluggy');

app.use(express.json());

const authRoutes = require('./routes/auth');
const transacoesRoutes = require('./routes/transacoes');

app.use('/api/auth', authRoutes);
app.use('/api/transacoes', transacoesRoutes);

app.post('/api/testar-notificacao', async (req, res) => {
    await enviarResumoWhatsApp();
    res.json({ mensagem: 'Notificação enviada!' });
});

app.post('/api/pluggy/connect-token', async (req, res) => {
    const { usuario_id } = req.body;
    try {
        const token = await gerarConnectToken(usuario_id);
        res.json({ token });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

module.exports = app;