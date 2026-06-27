require('dotenv').config();
const app = require('./src/app');
const cron = require('node-cron');
const { enviarResumoWhatsApp } = require('./src/services/notificacao');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

// Envia notificação a cada 2 horas
cron.schedule('0 */2 * * *', () => {
    console.log('Enviando resumo financeiro...');
    enviarResumoWhatsApp();
});