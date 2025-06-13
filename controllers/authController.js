const User = require('../models/User.js');
const bcrypt = require('bcryptjs');
const Product = require('../models/Product.js');

const authController = {
  renderRegisterPage: (req, res) => {
    res.render('register', { error: req.query.error || req.session.registerError || null });
    delete req.session.registerError;
  },

  handleUserRegistration: async (req, res) => {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res.status(400).render('register', {
          error: 'Semua field wajib diisi, Bro!'
        });
      }

      await User.create({ username, email, password });

      req.session.successMessage = 'Pendaftaran berhasil! Silakan masuk.';
      res.redirect('/login');

    } catch (error) {
      console.error("Error saat registrasi user:", error.message);
      let errorMessage = 'Gagal melakukan pendaftaran. Coba lagi nanti.';
      if (error.code === 'ER_DUP_ENTRY') {
        errorMessage = 'Username atau Email sudah terdaftar, Bro!';
      }
      res.status(500).render('register', {
        error: errorMessage
      });
    }
  },

  renderLoginPage: (req, res) => {
    const successMessage = req.session.successMessage;
    delete req.session.successMessage;

    const loginError = req.session.loginError;
    delete req.session.loginError;

    res.render('login', {
      successMessage: successMessage,
      loginError: loginError
    });
  },

  handleUserLogin: async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        req.session.loginError = 'Username dan Password wajib diisi, Bro!';
        return res.redirect('/login');
      }

      const user = await User.findByUsername(username);
      if (!user) {
        req.session.loginError = 'Username tidak ditemukan atau salah.';
        return res.redirect('/login');
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        req.session.loginError = 'Password salah, Bro!';
        return res.redirect('/login');
      }

      req.session.user = {
        userId: user.user_id,
        username: user.username,
        roleId: user.role_id
      };

      delete req.session.loginError;

      if (user.role_id === 1) {
        res.redirect('/admin/dashboard');
      } else {
        res.redirect('/dashboard_user');
      }

    } catch (error) {
      console.error("Error saat login:", error.message);
      req.session.loginError = 'Terjadi kesalahan pada server. Coba lagi nanti.';
      res.redirect('/login');
    }
  },

  renderDashboardUser: async (req, res) => {
    try {
      if (req.session.user) {
        const username = req.session.user.username;
        const products = await Product.getAllProducts();

        res.render('dashboard_user', {
          username: username,
          products: products
        });
      } else {
        res.redirect('/login');
      }
    } catch (error) {
      console.error("Error saat mengambil data untuk dashboard user:", error);
      res.redirect('/login');
    }
  },

  handleLogout: (req, res) => {
    req.session.destroy(err => {
      if (err) {
        console.error("Error saat menghancurkan session:", err.message);
        return res.status(500).send('Gagal melakukan logout. Coba lagi.');
      }
      res.redirect('/');
    });
  }
};

module.exports = authController;