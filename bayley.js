const express = require('express');
const { makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal'); // pindahkan ke atas
const fs = require('fs');

// Init Express
const app = express();
app.use(express.json());

// Inisialisasi Swagger
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');

// Swagger docs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));



let sock; // simpan instance WhatsApp

// Inisialisasi WhatsApp Socket
async function startSock() {
    const { state, saveCreds } = await useMultiFileAuthState('auth'); // folder simpan sesi

    sock = makeWASocket({
        auth: state,
    });

    // Simpan sesi baru jika diperbarui
    sock.ev.on('creds.update', saveCreds);

    // Tangani koneksi dan QR
    sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
        if (qr) {
            console.log('📱 Scan QR Code ini untuk login WhatsApp:');
            qrcode.generate(qr, { small: true }); // tampilkan QR manual
        }

        if (connection === 'open') {
            console.log('✅ WhatsApp connected!');
        } else if (connection === 'close') {
            console.log('❌ WhatsApp disconnected. Trying to reconnect...');
            startSock(); // reconnect otomatis
        }
    });
}

// Endpoint kirim OTP via WhatsApp
app.post('/send-message', async (req, res) => {
    const { phone, message } = req.body;
    console.log('📧 Sending OTP to:', phone);

    if (!phone || !message) {
        return res.status(400).json({ error: 'phone and message are required' });
    }

    if (!sock) {
        return res.status(503).json({ error: 'WhatsApp not connected' });
    }

    try {
        const chatId = phone.replace(/\D/g, '') + '@s.whatsapp.net';
        await sock.sendMessage(chatId, { text: message });

        res.json({ success: true, message: 'Message sent successfully' });
    } catch (err) {
        console.error('❌ Error sending message:', err);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// Jalankan server dan WhatsApp Socket
const PORT = 3005;
app.listen(PORT, async () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    await startSock();
});
