const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express();
app.use(express.json());

// Inisialisasi WhatsApp Client hanya sekali
const client = new Client({
authStrategy: new LocalAuth({ clientId: "akun-wa-utama" }),
    puppeteer: {
        executablePath: '/snap/bin/chromium', // Atau sesuaikan dengan sistem kamu
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-extensions',
            '--disable-background-networking',
            '--disable-sync',
            '--disable-gpu',
            '--headless=new',
        ],
    },
});

let isReady = false;

// QR code untuk login pertama kali
client.on('qr', qr => {
    console.log('Scan QR Code berikut:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    isReady = true;
    console.log('✅ WhatsApp client is ready!');
});

client.on('auth_failure', (msg) => {
    console.error('❌ Auth failed:', msg);
});

client.on('disconnected', (reason) => {
    console.warn('⚠️ WhatsApp client disconnected:', reason);
    isReady = false;
});

client.initialize();

// Endpoint kirim OTP
app.post('/send-otp', async (req, res) => {
    const { number, message } = req.body;

    if (!isReady) {
        return res.status(503).send('WhatsApp client is not ready');
    }

    if (!number || !message) {
        return res.status(400).send('number and message are required');
    }

    const cleanNumber = number.replace(/[^0-9]/g, '');
    const chatId = `${cleanNumber}@c.us`;

    try {
        await client.sendMessage(chatId, message);
        res.send('✅ OTP sent successfully');
    } catch (err) {
        console.error('❌ Failed to send message:', err);
        res.status(500).send('Failed to send message');
    }
});

// Jalankan server
const PORT = 3005;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down...');
    await client.destroy();
    process.exit(0);
});
