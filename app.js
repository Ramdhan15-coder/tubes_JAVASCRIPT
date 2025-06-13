const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();

// Inisialisasi koneksi database
require('./config/database.js');

// Middleware bawaan Express untuk parsing body request
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 


app.use(session({
  secret: 'dedengoden0951', 
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 3600000 } 
}));

app.use((req, res, next) => {
  // Pastikan req.session ada sebelum diakses
  if (req.session) { 
    // Urus Flash Messages
    if (req.session.successMessage) {
      res.locals.successMessage = req.session.successMessage;
      delete req.session.successMessage;
    }
    if (req.session.errorMessage) {
      res.locals.errorMessage = req.session.errorMessage;
      delete req.session.errorMessage;
    }
    // Oper data keranjang ke res.locals biar bisa diakses di semua EJS (misal buat navbar)
    res.locals.cartForNavbar = req.session.cart || []; 
  } else {
    // Kalau session belum ada, kasih nilai default buat cartForNavbar
    res.locals.cartForNavbar = [];
    // Pastikan successMessage dan errorMessage juga ada defaultnya jika session belum ada
    res.locals.successMessage = null;
    res.locals.errorMessage = null;
  }
  next();
});

// Middleware untuk menyajikan file statis (CSS, JS frontend, gambar)
app.use(express.static(path.join(__dirname, 'public')));

// Setup View Engine (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Import Rute-Rute Aplikasi
const testRoutes = require('./routes/testRoutes.js');
const authRoutes = require('./routes/authRoutes.js'); 
const adminRoutes = require('./routes/adminRoutes.js');
const adminProductRoutes = require('./routes/adminProductRoutes.js');
const productRoutes = require('./routes/productRoutes.js');
const adminReviewRoutes = require('./routes/adminReviewRoutes.js');
const adminCategoryRoutes = require('./routes/adminCategoryRoutes.js');
const cartRoutes = require('./routes/cartRoutes.js');
const orderRoutes = require('./routes/orderRoutes.js');
const adminOrderRoutes = require('./routes/adminOrderRoutes.js');

// Gunakan Rute-Rute Aplikasi
app.use('/api', testRoutes); 
app.use('/', authRoutes);
app.use('/admin', adminRoutes);
app.use('/admin/products', adminProductRoutes);
app.use('/produk', productRoutes);
app.use('/admin/reviews', adminReviewRoutes);    
app.use('/admin/categories', adminCategoryRoutes);
app.use('/keranjang', cartRoutes);
app.use('/checkout', orderRoutes);
app.use('/admin/orders', adminOrderRoutes);

app.get('/', (req, res) => {
  
  res.render('home'); 
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server Tubes_JS lagi jalan di http://localhost:${PORT}`);
  console.log('Tekan Ctrl+C buat matiin server.');
});