const Product = require('../models/Product.js');

const cartController = {
  addToCart: async (req, res) => {
    try {
      const productId = req.params.productId;
      const quantity = 1;

      const product = await Product.findById(productId);

      if (!product) {
        req.session.errorMessage = 'Produk tidak ditemukan!';
        return res.redirect(req.headers.referer || '/dashboard_user');
      }

      if (!req.session.cart) {
        req.session.cart = [];
      }

      const itemIndex = req.session.cart.findIndex(item => item.id === productId);

      if (itemIndex > -1) {
        req.session.cart[itemIndex].quantity += quantity;
      } else {
        req.session.cart.push({
          id: product.product_id,
          name: product.name,
          price: product.price,
          quantity: quantity,
          image_url: product.image_url
        });
      }

      req.session.successMessage = `"${product.name}" berhasil ditambahkan ke keranjang!`;
      res.redirect(req.headers.referer || '/dashboard_user');

    } catch (error) {
      console.error("Error saat menambah ke keranjang:", error);
      req.session.errorMessage = 'Gagal menambahkan produk ke keranjang.';
      res.redirect(req.headers.referer || '/dashboard_user');
    }
  },

  viewCart: (req, res) => {
    const cart = req.session.cart || [];
    let totalBelanja = 0;

    cart.forEach(item => {
      totalBelanja += item.price * item.quantity;
    });

    const loggedInUser = req.session.user ? req.session.user.username : null;

    res.render('cart/index', {
      title: 'Keranjang Belanja Anda',
      cartItems: cart,
      totalBelanja: totalBelanja,
      username: loggedInUser

    });
  },

  updateCartItem: (req, res) => {
    try {
      const productId = parseInt(req.params.productId, 10);
      const newQuantity = parseInt(req.body.quantity, 10);

      if (isNaN(productId)) {
        req.session.errorMessage = 'ID Produk tidak valid.';
        return res.redirect('/keranjang');
      }

      if (isNaN(newQuantity) || newQuantity < 1) {
        req.session.errorMessage = 'Kuantitas tidak valid.';
        return res.redirect('/keranjang');
      }

      if (req.session.cart) {
        const itemIndex = req.session.cart.findIndex(item => item.id === productId);

        if (itemIndex > -1) {
          req.session.cart[itemIndex].quantity = newQuantity;
          req.session.successMessage = `Kuantitas untuk "${req.session.cart[itemIndex].name}" berhasil diupdate!`;
        } else {
          req.session.errorMessage = 'Produk tidak ditemukan di keranjang.';
        }
      } else {
        req.session.errorMessage = 'Keranjang Anda kosong.';
      }
    } catch (error) {
      console.error("Error saat update item keranjang:", error);
      req.session.errorMessage = 'Gagal mengupdate item di keranjang.';
    }
    res.redirect('/keranjang');
  },

  removeCartItem: (req, res) => {
    try {
      const productId = parseInt(req.params.productId, 10);

      if (isNaN(productId)) {
        req.session.errorMessage = 'ID Produk tidak valid untuk dihapus.';
        return res.redirect('/keranjang');
      }

      if (req.session.cart) {
        const initialLength = req.session.cart.length;
        req.session.cart = req.session.cart.filter(item => item.id !== productId);

        if (req.session.cart.length < initialLength) {
          req.session.successMessage = `Produk berhasil dihapus dari keranjang!`;
        } else {
          req.session.errorMessage = 'Produk tidak ditemukan di keranjang untuk dihapus.';
        }
      } else {
        req.session.errorMessage = 'Keranjang Anda kosong.';
      }
    } catch (error) {
      console.error("Error saat hapus item keranjang:", error);
      req.session.errorMessage = 'Gagal menghapus item dari keranjang.';
    }
    res.redirect('/keranjang');
  }
};

module.exports = cartController;