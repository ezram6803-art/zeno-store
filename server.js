const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Simple file-based "database" untuk user (tanpa install database dulu)
const USERS_FILE = path.join(__dirname, 'users.json');

// Buat file users.json kalau belum ada
if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([]));
}

function getUsers() {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
}

function saveUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// API Register
app.post('/api/register', (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.json({ success: false, message: 'Semua field harus diisi!' });
    }

    const users = getUsers();

    // Cek email sudah terdaftar
    const existing = users.find(u => u.email === email);
    if (existing) {
        return res.json({ success: false, message: 'Email sudah terdaftar!' });
    }

    // Simpan user baru
    users.push({
        id: Date.now(),
        username,
        email,
        password, // Di production pakai bcrypt untuk hash password!
        createdAt: new Date().toISOString()
    });

    saveUsers(users);
    res.json({ success: true, message: 'Registrasi berhasil! Silakan login.' });
});

// API Login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({ success: false, message: 'Email dan password harus diisi!' });
    }

    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        return res.json({ success: false, message: 'Email atau password salah!' });
    }

    res.json({ success: true, message: 'Login berhasil!', username: user.username });
});

app.listen(PORT, () => {
    console.log(`✅ Zeno Store berjalan di http://localhost:${PORT}`);
});
