# ⚡ Zeno Store

> Platform penjualan Plugin Premium Minecraft, Backup Server, dan Jasa Website.

---

## 🚀 Cara Menjalankan

### 1. Install Dependencies
```bash
npm install
```

### 2. Jalankan Server
```bash
node server.js
```

atau dengan auto-reload (install dulu: `npm install -g nodemon`):
```bash
nodemon server.js
```

### 3. Buka di Browser
```
http://localhost:3000
```

---

## 🔑 Akun Default Admin
- **Email:** admin@zenostore.id
- **Password:** admin123
- **Akses Admin Panel:** http://localhost:3000/admin

---

## 📄 Halaman yang Tersedia

| Halaman | URL | Akses |
|---|---|---|
| Landing Page | `/` | Public |
| Login | `/login` | Public |
| Register | `/register` | Public |
| Dashboard | `/dashboard` | Login |
| Toko | `/shop` | Login |
| Pembayaran | `/payment/:id` | Login |
| Pesanan Saya | `/orders` | Login |
| Admin Panel | `/admin` | Admin Only |

---

## ⚙️ Konfigurasi yang Perlu Diubah

### 1. Nomor Pembayaran (payment.html)
Cari dan ganti di `public/payment.html`:
```
+62 812-3456-7890  → nomor GoPay kamu
+62 813-9876-5432  → nomor DANA kamu
```

### 2. QR Code (payment.html)
Ganti `src` pada elemen `<img id="qrImage">` dengan path QR code asli kamu:
```html
<img class="qr-img" id="qrImage" src="/images/qr-gopay.png" ...>
```

Taruh file QR di folder: `public/images/`

### 3. Link WhatsApp (payment.html)
Ganti `62xxxxxxxxxx` dengan nomor WhatsApp bisnis kamu:
```
https://wa.me/6281234567890
```

### 4. Produk (server.js)
Edit array produk di fungsi `initDB()` dalam `server.js` sesuai produk yang kamu jual.

---

## 📁 Struktur Folder

```
zeno-store/
├── server.js          ← Server utama (Node.js + Express)
├── package.json
├── data/              ← Database JSON (auto-generated)
│   ├── users.json
│   ├── orders.json
│   └── products.json
└── public/
    ├── index.html     ← Landing page
    ├── login.html
    ├── register.html
    ├── dashboard.html
    ├── shop.html
    ├── payment.html
    ├── orders.html
    ├── admin.html
    ├── css/
    │   └── style.css
    ├── js/
    │   └── utils.js
    └── images/        ← Taruh QR code di sini
```

---

## 💳 Alur Transaksi

1. User daftar/login
2. Pilih produk di Toko
3. Pilih metode: GoPay atau DANA
4. Sistem buat Order dengan ID unik
5. User diarahkan ke halaman Pembayaran
6. User transfer + kirim bukti ke WhatsApp
7. Admin konfirmasi di `/admin`
8. Status pesanan berubah jadi ✅ Selesai

---

## 🔧 Tech Stack

- **Backend:** Node.js + Express
- **Auth:** express-session + bcryptjs
- **Database:** JSON file (simple, no setup needed)
- **Frontend:** Vanilla HTML/CSS/JS
- **Font:** Syne + DM Sans (Google Fonts)

---

Made with ❤️ for Zeno Store
