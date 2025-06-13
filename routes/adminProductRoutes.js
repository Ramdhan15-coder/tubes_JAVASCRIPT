// File: routes/adminProductRoutes.js

const express = require('express');
const router = express.Router();

// 1. IMPORT SEMUA YANG DIBUTUHKAN DI SINI (PALING ATAS)
const adminProductController = require('../controllers/adminProductController.js');
const authMiddleware = require('../middlewares/authMiddleware.js');
const uploadProductImage = require('../config/productImageUpload.js'); // <-- PASTIKAN INI ADA DI ATAS

// 2. TERAPKAN MIDDLEWARE GLOBAL UNTUK ROUTER INI
router.use(authMiddleware.isLoggedIn);
router.use(authMiddleware.isAdmin);

// 3. BARU DEFINISIKAN RUTE-RUTENYA
router.get('/', adminProductController.listProducts);

// Rute untuk menampilkan form tambah produk
router.get('/new', adminProductController.renderNewProductForm);

// Rute untuk memproses data form tambah produk (dengan middleware multer)
router.post(
  '/create', 
  uploadProductImage.single('productImage'), // Sekarang 'uploadProductImage' sudah dikenal
  adminProductController.handleCreateProduct
);

// Rute untuk edit dan update produk
router.get('/edit/:id', adminProductController.renderEditProductForm);
router.post('/update/:id', adminProductController.handleUpdateProduct);

// Rute untuk delete produk
router.post('/delete/:id', adminProductController.handleDeleteProduct);

module.exports = router;