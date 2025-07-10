const express = require('express');
const { makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const fs = require('fs');

// Init Express
const app = express();
app.use(express.json());

let sock; // simpan instance WhatsApp

// Inisialisasi WhatsApp Socket
async function startSock() {
    const { state, saveCreds } = await useMultiFileAuthState('auth'); // folder simpan sesi

    sock = makeWASocket({
        auth: state,
        printQRInTerminal: true, // tampilkan QR di terminal
    });

    sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
    if (qr) {
        const qrcode = require('qrcode-terminal');
        qrcode.generate(qr, { small: true });
    }

    if (connection === 'open') {
        console.log('✅ WhatsApp connected!');
    } else if (connection === 'close') {
        console.log('❌ Disconnected. Trying to reconnect...');
        startSock(); // Reconnect
    }
});
}

// Endpoint kirim OTP
app.post('/send-otp', async (req, res) => {
    const { number, message } = req.body;

    if (!number || !message) {
        return res.status(400).json({ error: 'number and message are required' });
    }

    if (!sock) {
        return res.status(503).json({ error: 'WhatsApp not connected' });
    }

    try {
        const chatId = number.replace(/\D/g, '') + '@s.whatsapp.net';
        await sock.sendMessage(chatId, { text: message });

        res.json({ success: true, message: 'OTP sent successfully' });
    } catch (err) {
        console.error('Error sending message:', err);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// Jalankan server dan socket
const PORT = 3005;
app.listen(PORT, async () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    await startSock();
});
