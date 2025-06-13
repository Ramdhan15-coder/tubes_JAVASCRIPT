const Order = require('../models/Order.js');
const User = require('../models/User.js');

const orderController = {
  renderCheckoutPage: async (req, res) => { // Tambahkan async
    try {
      const cart = req.session.cart || [];

      if (cart.length === 0) {
        req.session.errorMessage = 'Keranjang belanja Anda kosong. Silakan belanja dulu, Bro!';
        return res.redirect('/keranjang');
      }

      // Ambil data user LENGKAP dari database pake ID dari session
      const user = await User.findById(req.session.user.userId);

      let totalBelanja = 0;
      cart.forEach(item => {
        totalBelanja += item.price * item.quantity;
      });

      res.render('checkout/index', {
        title: 'Checkout Pesanan',
        cartItems: cart,
        totalBelanja: totalBelanja,
        user: user, // Kirim objek user LENGKAP ke EJS
        username: user.username // Untuk navbar
      });
    } catch (error) {
      console.error("Error saat menampilkan halaman checkout:", error);
      req.session.errorMessage = 'Gagal memuat halaman checkout.';
      res.redirect('/keranjang');
    }
  },

  placeOrder: async (req, res) => {
    try {
      if (!req.session.user || !req.session.user.userId) {
        req.session.errorMessage = 'Sesi Anda berakhir, silakan login kembali untuk melanjutkan.';
        return res.redirect('/login');
      }
      const userId = req.session.user.userId;

      const cart = req.session.cart || [];
      if (cart.length === 0) {
        req.session.errorMessage = 'Keranjang belanja Anda kosong. Tidak ada pesanan yang bisa diproses.';
        return res.redirect('/keranjang');
      }

      const { shippingFullName, shippingAddress, shippingPhoneNumber, orderNotes } = req.body;

      if (!shippingFullName || !shippingAddress || !shippingPhoneNumber) {
        req.session.errorMessage = 'Informasi pengiriman (Nama, Alamat, No. Telepon) wajib diisi.';
        return res.redirect('/checkout');
      }

      let totalAmount = 0;
      cart.forEach(item => {
        totalAmount += item.price * item.quantity;
      });

      const orderData = {
        userId: userId,
        cartItems: cart,
        totalAmount: totalAmount,
        shippingDetails: {
          shippingFullName,
          shippingAddress,
          shippingPhoneNumber
        },
        orderNotes: orderNotes || null
      };

      const newOrder = await Order.create(orderData);

      if (newOrder && newOrder.orderId) {
          req.session.cart = [];
          req.session.successMessage = `Pesanan Anda dengan ID #${newOrder.orderId} berhasil dibuat! Segera lakukan pembayaran.`;
          return res.redirect(`/checkout/sukses/${newOrder.orderId}`);
        } else {
          throw new Error('Gagal memproses pesanan setelah pembuatan order.');
        }

    } catch (error) {
      console.error("Error saat memproses pesanan (placeOrder):", error);
      req.session.errorMessage = error.message || 'Gagal memproses pesanan Anda. Silakan coba lagi.';
      res.redirect('/checkout');
    }
  },

  renderOrderSuccessPage: async (req, res) => {
    try {
      const orderId = req.params.orderId;
      const orderDetails = await Order.findDetailsForSuccessPage(orderId);

      if (!orderDetails) {
        req.session.errorMessage = 'Detail pesanan tidak ditemukan.';
        return res.redirect('/dashboard_user');
      }

      const loggedInUser = req.session.user ? req.session.user.username : null;

      res.render('order/success', {
        title: 'Pesanan Berhasil Dibuat!',
        order: orderDetails,
        username: loggedInUser
      });
    } catch (error) {
      console.error("Error saat menampilkan halaman sukses order:", error);
      req.session.errorMessage = 'Gagal menampilkan halaman konfirmasi pesanan.';
      res.redirect('/dashboard_user');
    }
  },

  handleUploadPaymentProof: async (req, res) => {
    const orderId = req.params.orderId;

    try {
      if (!req.file) {
        req.session.errorMessage = 'Upload bukti pembayaran gagal, tidak ada file yang dipilih atau format file salah.';
        return res.redirect(`/checkout/sukses/${orderId}`);
      }

      const paymentProofUrl = `/uploads/payment_proofs/${req.file.filename}`;
      const newStatus = 'menunggu_konfirmasi';

      const success = await Order.updatePaymentProof(orderId, paymentProofUrl, newStatus);

      if (success) {
        req.session.successMessage = 'Bukti pembayaran berhasil diupload! Menunggu konfirmasi admin.';
      } else {
        req.session.errorMessage = 'Gagal menyimpan informasi bukti pembayaran ke database.';
      }
      res.redirect(`/checkout/sukses/${orderId}`);

    } catch (error) {
      console.error(`Error saat upload bukti pembayaran untuk order ID ${orderId}:`, error);
      req.session.errorMessage = error.message || 'Terjadi kesalahan saat mengupload bukti pembayaran.';
      res.redirect(`/checkout/sukses/${orderId}`);
    }
  },

  renderOrderHistory: async (req, res) => {
    try {
      if (!req.session.user || !req.session.user.userId) {
        req.session.errorMessage = 'Anda harus login untuk melihat riwayat pesanan.';
        return res.redirect('/login');
      }
      const userId = req.session.user.userId;
      const orders = await Order.findByUserId(userId);

      const loggedInUser = req.session.user.username;

      res.render('order/history', {
        title: 'Riwayat Pesanan Anda',
        orders: orders,
        username: loggedInUser
      });
    } catch (error) {
      console.error("Error saat mengambil riwayat pesanan:", error);
      req.session.errorMessage = 'Gagal mengambil riwayat pesanan Anda.';
      res.redirect('/dashboard_user');
    }
  }
};

module.exports = orderController;