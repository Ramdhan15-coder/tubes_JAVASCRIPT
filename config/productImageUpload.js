// File: config/productImageUpload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Tentukan direktori penyimpanan untuk gambar produk
const storageDir = path.join(__dirname, '../public/uploads/products');

// Buat direktori jika belum ada
if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
}

// Konfigurasi penyimpanan disk
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, storageDir); // Folder tempat nyimpen file
  },
  filename: function (req, file, cb) {
    // Buat nama file yang unik: product-timestamp-originalname.extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filter file biar cuma gambar yang bisa diupload
const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Upload gagal! Hanya file gambar (JPG, PNG, dll.) yang diperbolehkan.'), false);
  }
};

// Inisialisasi upload middleware untuk satu file gambar produk
const uploadProductImage = multer({ 
  storage: storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Batas ukuran file 5MB
  }
});

module.exports = uploadProductImage;