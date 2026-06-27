# 💰 Financeiro SaaS

Sistema de notificação financeira automática via WhatsApp, com integração Open Finance (Pluggy) e suporte a múltiplos usuários.

## 🚀 Funcionalidades

- Cadastro e login de usuários
- Registro de transações com categorias (entrada/saída)
- Integração com Open Finance via Pluggy
- Notificação automática no WhatsApp a cada 2 horas com resumo financeiro
- Suporte a múltiplos números de WhatsApp

## 🛠️ Tecnologias

- Node.js + Express
- PostgreSQL
- Pluggy API (Open Finance)
- Twilio (WhatsApp)
- node-cron

## ⚙️ Como configurar

1. Clone o repositório
2. Instale as dependências:
```bash
   npm install
```
3. Copie o `.env.example` e preencha com suas credenciais:
```bash
   cp .env.example .env
```
4. Execute o schema do banco no PostgreSQL
5. Rode o servidor:
```bash
   node index.js
```

## 🔐 Variáveis de ambiente

Veja o arquivo `.env.example` para as variáveis necessárias.

## 📱 Testando as notificações

Use o Thunder Client ou Postman para fazer POST em: http://localhost:3000/api/testar-notificacao

## 👩‍💻 Autora

Lilian Santana — estudante de Engenharia de Software