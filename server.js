const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'zeno-store-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

// Simple JSON "database"
const DB_PATH = path.join(__dirname, 'data');

function readDB(file) {
  const filePath = path.join(DB_PATH, file);
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeDB(file, data) {
  fs.writeFileSync(path.join(DB_PATH, file), JSON.stringify(data, null, 2));
}

// Seed initial data
function initDB() {
  if (!fs.existsSync(path.join(DB_PATH, 'users.json'))) {
    writeDB('users.json', [
      {
        id: 1,
        username: 'admin',
        email: 'admin@zenostore.id',
        password: bcrypt.hashSync('admin123', 10),
        role: 'admin',
        createdAt: new Date().toISOString()
      }
    ]);
  }
  if (!fs.existsSync(path.join(DB_PATH, 'orders.json'))) {
    writeDB('orders.json', []);
  }
  if (!fs.existsSync(path.join(DB_PATH, 'products.json'))) {
    writeDB('products.json', [
      { id: 1, name: 'EssentialsX Premium', category: 'plugin', price: 25000, desc: 'Plugin essential terlengkap untuk server Minecraft kamu.', badge: 'Best Seller', stock: 999 },
      { id: 2, name: 'LuckPerms Pro', category: 'plugin', price: 35000, desc: 'Manajemen permission terbaik untuk server Minecraft.', badge: 'Popular', stock: 999 },
      { id: 3, name: 'Vault Economy', category: 'plugin', price: 20000, desc: 'Plugin ekonomi server Minecraft premium lengkap.', badge: null, stock: 999 },
      { id: 4, name: 'WorldGuard Extended', category: 'plugin', price: 45000, desc: 'Proteksi wilayah server Minecraft tingkat lanjut.', badge: 'New', stock: 999 },
      { id: 5, name: 'AutoRank Premium', category: 'plugin', price: 30000, desc: 'Sistem rank otomatis berbasis waktu & achievement.', badge: null, stock: 999 },
      { id: 6, name: 'Backup Server 7 Hari', category: 'backup', price: 50000, desc: 'Backup otomatis server Minecraft selama 7 hari.', badge: 'Hemat', stock: 999 },
      { id: 7, name: 'Backup Server 30 Hari', category: 'backup', price: 150000, desc: 'Backup otomatis server Minecraft selama 30 hari.', badge: 'Best Value', stock: 999 },
      { id: 8, name: 'Jasa Buat Website Basic', category: 'website', price: 200000, desc: 'Website landing page profesional untuk bisnis kamu.', badge: null, stock: 999 },
      { id: 9, name: 'Jasa Buat Website Premium', category: 'website', price: 500000, desc: 'Website full fitur dengan backend, database, dan admin panel.', badge: 'Premium', stock: 999 },
      { id: 10, name: 'Setup Server Minecraft', category: 'other', price: 75000, desc: 'Jasa setup server Minecraft dari awal hingga siap pakai.', badge: null, stock: 999 }
    ]);
  }
}

initDB();

// Auth middleware
function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
}
function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/dashboard');
  next();
}

// ==================== ROUTES ====================

// Home
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Login page
app.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Register page
app.get('/register', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Dashboard
app.get('/dashboard', requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Shop
app.get('/shop', requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'shop.html'));
});

// Payment page
app.get('/payment/:orderId', requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'payment.html'));
});

// Orders history
app.get('/orders', requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'orders.html'));
});

// Admin panel
app.get('/admin', requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// ==================== API ====================

// Get session user
app.get('/api/me', (req, res) => {
  if (!req.session.user) return res.json({ user: null });
  res.json({ user: req.session.user });
});

// Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const users = readDB('users.json');
  const user = users.find(u => u.email === email);
  if (!user) return res.json({ success: false, message: 'Email tidak ditemukan.' });
  if (!bcrypt.compareSync(password, user.password)) return res.json({ success: false, message: 'Password salah.' });
  req.session.user = { id: user.id, username: user.username, email: user.email, role: user.role };
  res.json({ success: true, role: user.role });
});

// Register
app.post('/api/register', (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.json({ success: false, message: 'Semua field harus diisi.' });
  if (password.length < 6) return res.json({ success: false, message: 'Password minimal 6 karakter.' });
  const users = readDB('users.json');
  if (users.find(u => u.email === email)) return res.json({ success: false, message: 'Email sudah terdaftar.' });
  if (users.find(u => u.username === username)) return res.json({ success: false, message: 'Username sudah digunakan.' });
  const newUser = {
    id: Date.now(),
    username,
    email,
    password: bcrypt.hashSync(password, 10),
    role: 'user',
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  writeDB('users.json', users);
  req.session.user = { id: newUser.id, username, email, role: 'user' };
  res.json({ success: true });
});

// Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// Get products
app.get('/api/products', (req, res) => {
  const products = readDB('products.json');
  const { category } = req.query;
  if (category && category !== 'all') return res.json(products.filter(p => p.category === category));
  res.json(products);
});

// Create order
app.post('/api/orders', requireLogin, (req, res) => {
  const { productId, paymentMethod, quantity } = req.body;
  const products = readDB('products.json');
  const product = products.find(p => p.id == productId);
  if (!product) return res.json({ success: false, message: 'Produk tidak ditemukan.' });
  const orders = readDB('orders.json');
  const order = {
    id: 'ZNO-' + Date.now(),
    userId: req.session.user.id,
    username: req.session.user.username,
    productId: product.id,
    productName: product.name,
    category: product.category,
    quantity: quantity || 1,
    price: product.price,
    total: product.price * (quantity || 1),
    paymentMethod,
    status: 'pending',
    createdAt: new Date().toISOString(),
    confirmedAt: null
  };
  orders.push(order);
  writeDB('orders.json', orders);
  res.json({ success: true, orderId: order.id });
});

// Get my orders
app.get('/api/orders/my', requireLogin, (req, res) => {
  const orders = readDB('orders.json');
  const myOrders = orders.filter(o => o.userId === req.session.user.id).reverse();
  res.json(myOrders);
});

// Get single order
app.get('/api/orders/:id', requireLogin, (req, res) => {
  const orders = readDB('orders.json');
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.json({ success: false, message: 'Order tidak ditemukan.' });
  if (order.userId !== req.session.user.id && req.session.user.role !== 'admin') {
    return res.json({ success: false, message: 'Akses ditolak.' });
  }
  res.json(order);
});

// Admin: get all orders
app.get('/api/admin/orders', requireAdmin, (req, res) => {
  const orders = readDB('orders.json').reverse();
  res.json(orders);
});

// Admin: confirm order
app.post('/api/admin/orders/:id/confirm', requireAdmin, (req, res) => {
  const orders = readDB('orders.json');
  const idx = orders.findIndex(o => o.id === req.params.id);
  if (idx === -1) return res.json({ success: false, message: 'Order tidak ditemukan.' });
  orders[idx].status = 'confirmed';
  orders[idx].confirmedAt = new Date().toISOString();
  writeDB('orders.json', orders);
  res.json({ success: true });
});

// Admin: reject order
app.post('/api/admin/orders/:id/reject', requireAdmin, (req, res) => {
  const orders = readDB('orders.json');
  const idx = orders.findIndex(o => o.id === req.params.id);
  if (idx === -1) return res.json({ success: false, message: 'Order tidak ditemukan.' });
  orders[idx].status = 'rejected';
  writeDB('orders.json', orders);
  res.json({ success: true });
});

// Admin: get all users
app.get('/api/admin/users', requireAdmin, (req, res) => {
  const users = readDB('users.json').map(u => ({ ...u, password: undefined }));
  res.json(users);
});

// Stats
app.get('/api/admin/stats', requireAdmin, (req, res) => {
  const orders = readDB('orders.json');
  const users = readDB('users.json');
  const confirmed = orders.filter(o => o.status === 'confirmed');
  res.json({
    totalOrders: orders.length,
    totalUsers: users.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    revenue: confirmed.reduce((sum, o) => sum + o.total, 0)
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Zeno Store running at http://localhost:${PORT}\n`);
  console.log('📧 Admin: admin@zenostore.id | 🔑 Password: admin123\n');
});
