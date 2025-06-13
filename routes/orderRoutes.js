const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController.js');
const authMiddleware = require('../middlewares/authMiddleware.js');
const uploadPaymentProof = require('../config/multer.config.js');

// Rute untuk menampilkan halaman checkout
router.get('/', authMiddleware.isLoggedIn, orderController.renderCheckoutPage);
// Rute untuk memproses pesanan
router.post('/place_order', authMiddleware.isLoggedIn, orderController.placeOrder);
// Rute untuk halaman sukses order
router.get('/sukses/:orderId', authMiddleware.isLoggedIn, orderController.renderOrderSuccessPage);
// Rute untuk proses upload bukti pembayaran
router.post('/upload-bukti/:orderId', authMiddleware.isLoggedIn, uploadPaymentProof.single('buktiPembayaran'), orderController.handleUploadPaymentProof);

router.get('/history', authMiddleware.isLoggedIn, orderController.renderOrderHistory);

module.exports = router;