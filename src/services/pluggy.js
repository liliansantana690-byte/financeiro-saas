process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const axios = require('axios');

async function gerarConnectToken(usuarioId) {
    const auth = await axios.post('https://api.pluggy.ai/auth', {
        clientId: process.env.PLUGGY_CLIENT_ID,
        clientSecret: process.env.PLUGGY_CLIENT_SECRET,
    });

    const apiKey = auth.data.apiKey;

    const response = await axios.post('https://api.pluggy.ai/connect_token', 
        { clientUserId: String(usuarioId) },
        { headers: { 'X-API-KEY': apiKey } }
    );

    return response.data.accessToken;
}

module.exports = { gerarConnectToken };