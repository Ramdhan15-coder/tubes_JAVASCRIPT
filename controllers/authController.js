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
    const queryMessage = req.query.message;
    let successMessage = req.session.successMessage;

    if (queryMessage === 'Password_berhasil_diubah') {
        successMessage = 'Password berhasil diubah! Silakan login dengan password baru Anda.';
    }

    delete req.session.successMessage; 

    res.render('login', { 
      successMessage, 
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
  },

  renderUserProfile: async (req, res) => {
        try {
            // Ambil userId dari session
            const userId = req.session.user.userId;
            // Cari data user lengkap pake model
            const user = await User.findById(userId);

            if (!user) {
                req.session.errorMessage = 'Gagal memuat data profil.';
                return res.redirect('/dashboard_user');
            }

            res.render('user/profil', {
                title: 'Profil Saya',
                user: user, // Kirim data user ke EJS
                username: user.username // Untuk navbar
            });

        } catch (error) {
            console.error("Error saat menampilkan halaman profil:", error);
            req.session.errorMessage = 'Terjadi kesalahan saat memuat profil.';
            res.redirect('/dashboard_user');
        }
    },

    renderEditProfileForm: async (req, res) => {
        try {
            const userId = req.session.user.userId;
            const user = await User.findById(userId);
            res.render('user/edit_profil', {
                title: 'Edit Profil',
                user: user,
                username: user.username
            });
        } catch (error) {
            console.error("Error saat menampilkan form edit profil:", error);
            req.session.errorMessage = 'Gagal memuat halaman edit profil.';
            res.redirect('/profil');
        }
    },

    // Fungsi untuk memproses update profil
    handleUpdateProfile: async (req, res) => {
        try {
            const userId = req.session.user.userId;
            const { full_name, default_address, phone_number } = req.body;

            // Siapkan data untuk diupdate
            const profileData = { full_name, default_address, phone_number };

            const success = await User.updateProfileById(userId, profileData);

            if (success) {
                req.session.successMessage = 'Profil berhasil diupdate!';
            } else {
                req.session.errorMessage = 'Gagal mengupdate profil, tidak ada data yang berubah.';
            }
            res.redirect('/profil');
        } catch (error) {
            console.error("Error saat mengupdate profil:", error);
            req.session.errorMessage = 'Terjadi kesalahan saat mengupdate profil.';
            res.redirect('/profil/edit');
        }
    },

    renderChangePasswordForm: (req, res) => {
        res.render('user/ubah_password', {
            title: 'Ubah Password',
            username: req.session.user.username,
            formError: null
        });
    },

    // Fungsi untuk memproses ubah password
    handleChangePassword: async (req, res) => {
        try {
            const userId = req.session.user.userId;
            const { currentPassword, newPassword, confirmPassword } = req.body;

            // 1. Validasi input dasar
            if (!currentPassword || !newPassword || !confirmPassword) {
                return res.render('user/ubah_password', { title: 'Ubah Password', username: req.session.user.username, formError: 'Semua field wajib diisi.' });
            }
            if (newPassword.length < 6) { // Contoh: minimal 6 karakter
                return res.render('user/ubah_password', { title: 'Ubah Password', username: req.session.user.username, formError: 'Password baru minimal harus 6 karakter.' });
            }
            if (newPassword !== confirmPassword) {
                return res.render('user/ubah_password', { title: 'Ubah Password', username: req.session.user.username, formError: 'Password baru dan konfirmasi password tidak cocok.' });
            }

            // 2. Verifikasi password saat ini
            const user = await User.findById(userId);
            const isMatch = await bcrypt.compare(currentPassword, user.password);

            if (!isMatch) {
                return res.render('user/ubah_password', { title: 'Ubah Password', username: req.session.user.username, formError: 'Password Anda saat ini salah.' });
            }

            // 3. Hash password baru dan update ke database
            const salt = await bcrypt.genSalt(10);
            const hashedNewPassword = await bcrypt.hash(newPassword, salt);
            await User.updatePasswordById(userId, hashedNewPassword);

            // 4. Hancurkan session lama dan paksa login ulang (praktik keamanan yang baik)
            req.session.destroy(err => {
                if (err) {
                    console.error("Gagal menghancurkan session setelah ubah password:", err);
                    return res.redirect('/'); // Redirect ke home jika ada error
                }
                // Redirect ke halaman login dengan pesan sukses
                res.redirect('/login?message=Password_berhasil_diubah');
            });

        } catch (error) {
            console.error("Error saat mengubah password:", error);
            res.render('user/ubah_password', { title: 'Ubah Password', username: req.session.user.username, formError: 'Terjadi kesalahan, silakan coba lagi.' });
        }
    }
};

module.exports = authController;