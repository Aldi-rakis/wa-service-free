# WA Message Service

Layanan API sederhana untuk mengirimkan pesan ke nomor WhatsApp melalui endpoint. Cocok untuk notifikasi otomatis, pengingat, dan sistem pengiriman pesan WhatsApp dari aplikasi apa pun.

## 📝 Deskripsi

Proyek ini menyediakan endpoint API untuk mengirim pesan ke WhatsApp. Sistem backend akan meneruskan pesan ke WhatsApp Gateway (seperti Baileys, Chat API, atau lainnya) yang terhubung.

## 🚀 Fitur

- Kirim pesan WhatsApp ke nomor tujuan
- API endpoint sederhana
- Dukungan format pesan dinamis
- Mudah diintegrasikan ke aplikasi lain

## 🛠️ Teknologi

- Backend: Node.js / Express 
- WhatsApp Gateway: Baileys 

## 📦 Instalasi

```bash
git clone https://github.com/yourusername/wa-message-service.git
cd wa-service-free 

# pastikan anda sudah berada di folder root project
npm install
npm run dev, tunggu sampai qr code muncul di terminal
buka aplikasi whatsapp anda, lalu add device
scan qr code yang ada di terminal tadi
