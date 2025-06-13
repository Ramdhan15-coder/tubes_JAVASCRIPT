const User = require('../models/User.js');
const Product = require('../models/Product.js');
const Order = require('../models/Order.js');
const Review = require('../models/Review.js');
const Role = require('../models/Role.js');  

const adminController = {
   renderAdminDashboard: async (req, res) => {
    try {
      const adminUsername = req.session.user ? req.session.user.username : 'Admin';
      const [
        totalUsers,
        totalProducts,
        pendingOrders,
        totalReviews
      ] = await Promise.all([
        User.countAll(),
        Product.countAll(),
        Order.countPendingOrders(),
        Review.countAll()
      ]);
      
      const stats = {
        totalUsers: totalUsers,
        totalProducts: totalProducts,
        pendingOrders: pendingOrders,
        totalReviews: totalReviews
      };

      res.render('admin/dashboard', { 
        title: 'Admin Jaketku',
        username: adminUsername,
        stats: stats 
      });

    } catch (error) {
      console.error("Error saat mengambil data untuk dashboard admin:", error);
      req.session.errorMessage = 'Gagal memuat data dashboard.';
      
      res.render('admin/dashboard', { 
        title: 'Admin Jaketku',
        username: req.session.user ? req.session.user.username : 'Admin',
        stats: null, 
        error: 'Gagal memuat data statistik.'
      });
    }
  }, 
  listUsers: async (req, res) => {
    try {
      
      const searchTerm = req.query.search || ''; 
      const users = await User.getAllUsers(searchTerm); 
      const adminUsername = req.session.user ? req.session.user.username : 'Admin';

      res.render('admin/users_list', {
        title: 'Kelola Pengguna',
        users: users,
        username: adminUsername,
        searchTerm: searchTerm 
      });
    } catch (error) {
      console.error("Error saat mengambil daftar user:", error);
      req.session.errorMessage = 'Gagal mengambil data pengguna.';
      res.redirect('/admin/dashboard');
    }
  }, 

  renderEditUserForm: async (req, res) => {
    try {
      const userId = req.params.id; 
      const userToEdit = await User.findById(userId); 
      const allRoles = await Role.getAll();       
      const adminUsername = req.session.user ? req.session.user.username : 'Admin';

      if (!userToEdit) {
        return res.status(404).send('User tidak ditemukan.');
      }

      res.render('admin/user_edit_form', {
        title: 'Edit Pengguna',
        user: userToEdit,    
        roles: allRoles,     
        username: adminUsername,
       
      });

    } catch (error) {
      console.error("Error saat menampilkan form edit user:", error);
      res.status(500).send('Gagal menampilkan form edit pengguna.');
    }
  },

  handleUpdateUser: async (req, res) => {
    const userId = req.params.id; 
    const { username, email, role_id } = req.body; 

    try {
  
      if (!username || !email || !role_id) {
        const userToEdit = await User.findById(userId);
        const allRoles = await Role.getAll();
        const adminUsername = req.session.user ? req.session.user.username : 'Admin';

        return res.status(400).render('admin/user_edit_form', {
          title: 'Edit Pengguna',
          user: userToEdit,
          roles: allRoles,
          username: adminUsername,
          formError: 'Semua field (Username, Email, Role) wajib diisi!', 
          
        });
      }
     
      const success = await User.updateUserById(userId, { username, email, role_id });
      if (success) {
   
        req.session.successMessage = `Data user ${username} berhasil diupdate!`;
        res.redirect('/admin/users'); 
      } else {
       
        const userToEdit = await User.findById(userId);
        const allRoles = await Role.getAll();
        const adminUsername = req.session.user ? req.session.user.username : 'Admin';
        res.status(500).render('admin/user_edit_form', {
          title: 'Edit Pengguna',
          user: userToEdit,
          roles: allRoles,
          username: adminUsername,
          formError: 'Gagal mengupdate user, tidak ada data yang berubah atau user tidak ditemukan.',
          
        });
      }
    } catch (error) {
      console.error("Error saat update user:", error);
      const userToEdit = await User.findById(userId);
      const allRoles = await Role.getAll();
      const adminUsername = req.session.user ? req.session.user.username : 'Admin';
      let errorMessage = 'Terjadi kesalahan saat mengupdate data.';
      if (error.isDuplicate) { 
        errorMessage = error.message;
      }

      res.status(500).render('admin/user_edit_form', {
        title: 'Edit Pengguna',
        user: userToEdit,
        roles: allRoles,
        username: adminUsername,
        formError: errorMessage, 
     
      });
    }
  },
  handleDeleteUser: async (req, res) => {
    const userId = req.params.id;

    try {
      const success = await User.deleteById(userId);

      if (success) {
        req.session.successMessage = `User dengan ID ${userId} berhasil dihapus!`;
      } else {
        
        req.session.errorMessage = `User dengan ID ${userId} tidak ditemukan atau gagal dihapus.`;
      }
    } catch (error) {
      console.error("Error saat menghapus user:", error);
    
      if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.message.includes('foreign key constraint fails')) {
         req.session.errorMessage = `Gagal menghapus user ID ${userId}. User ini mungkin masih memiliki data terkait (misalnya pesanan).`;
      } else {
         req.session.errorMessage = `Terjadi kesalahan saat menghapus user ID ${userId}.`;
      }
    }
    res.redirect('/admin/users'); 
  },

  renderCreateUserForm: async (req, res) => {
    try {
      const allRoles = await Role.getAll(); 
      const adminUsername = req.session.user ? req.session.user.username : 'Admin';
      res.render('admin/user_create_form', {
        title: 'Tambah Pengguna Baru',
        roles: allRoles,
        username: adminUsername,
        formData: {}, 
        formError: null  
       
      });
    } catch (error) {
      console.error("Error saat menampilkan form tambah user:", error);
      res.status(500).send('Gagal menampilkan form tambah pengguna.');
    }
  }, 

  handleAdminCreateUser: async (req, res) => {
    const { username, email, password, role_id } = req.body;
    const adminUsername = req.session.user ? req.session.user.username : 'Admin'; 

    try {
     
      if (!username || !email || !password || !role_id) {
        const allRoles = await Role.getAll();
        return res.status(400).render('admin/user_create_form', {
          title: 'Tambah Pengguna Baru',
          roles: allRoles,
          username: adminUsername,
          formData: { username, email, password, role_id }, 
          formError: 'Semua field wajib diisi!',
       
        });
      }

      await User.create({ username, email, password, role_id });

      req.session.successMessage = `User baru "${username}" berhasil ditambahkan!`;
      res.redirect('/admin/users');

    } catch (error) {
      console.error("Error saat membuat user baru oleh admin:", error);
      const allRoles = await Role.getAll();
      let errorMessage = 'Gagal menambahkan pengguna baru.';
      if (error.code === 'ER_DUP_ENTRY') {
        errorMessage = 'Username atau Email sudah terdaftar.';
      }

      res.status(500).render('admin/user_create_form', {
        title: 'Tambah Pengguna Baru',
        roles: allRoles,
        username: adminUsername,
        formData: { username, email, password, role_id }, 
        formError: errorMessage,
       
      });
    }
  }
 
};

module.exports = adminController;