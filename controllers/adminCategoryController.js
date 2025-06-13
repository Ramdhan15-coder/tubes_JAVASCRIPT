const Category = require('../models/Category.js');

const adminCategoryController = {
  listCategories: async (req, res) => {
    try {
      const searchTerm = req.query.search || '';

      const categories = await Category.getAll(searchTerm);

      const adminUsername = req.session.user ? req.session.user.username : 'Admin';

      res.render('admin/categories/list_categories', {
        title: 'Kelola Kategori Produk',
        categories: categories,
        username: adminUsername,
        searchTerm: searchTerm
      });
    } catch (error) {
      console.error("Error saat mengambil daftar kategori:", error);
      req.session.errorMessage = 'Gagal mengambil data kategori.';
      res.redirect('/admin/dashboard');
    }
  },

  renderNewCategoryForm: (req, res) => {
    const adminUsername = req.session.user ? req.session.user.username : 'Admin';

    res.render('admin/categories/new_category_form', {
      title: 'Tambah Kategori Produk Baru',
      username: adminUsername,
      formData: {},
      formError: null
    });
  },

  handleCreateCategory: async (req, res) => {
    const { category_name, description } = req.body;
    const adminUsername = req.session.user ? req.session.user.username : 'Admin';

    try {
      if (!category_name || category_name.trim() === '') {
        return res.status(400).render('admin/categories/new_category_form', {
          title: 'Tambah Kategori Produk Baru',
          username: adminUsername,
          formData: { category_name, description },
          formError: 'Nama Kategori wajib diisi!',
        });
      }

      await Category.create({ category_name, description });

      req.session.successMessage = `Kategori baru "${category_name}" berhasil ditambahkan!`;
      res.redirect('/admin/categories');

    } catch (error) {
      console.error("Error saat membuat kategori baru:", error);
      let errorMessage = 'Gagal menambahkan kategori baru.';
      if (error.message === 'Nama kategori sudah ada.') {
        errorMessage = error.message;
      }

      res.status(500).render('admin/categories/new_category_form', {
        title: 'Tambah Kategori Produk Baru',
        username: adminUsername,
        formData: { category_name, description },
        formError: errorMessage,
      });
    }
  },

  renderEditCategoryForm: async (req, res) => {
    try {
      const categoryId = req.params.id;
      const categoryToEdit = await Category.findById(categoryId);
      const adminUsername = req.session.user ? req.session.user.username : 'Admin';

      if (!categoryToEdit) {
        req.session.errorMessage = `Kategori dengan ID ${categoryId} tidak ditemukan.`;
        return res.redirect('/admin/categories');
      }

      res.render('admin/categories/edit_category_form', {
        title: `Edit Kategori: ${categoryToEdit.category_name}`,
        category: categoryToEdit,
        username: adminUsername,
        formError: null
      });
    } catch (error) {
      console.error("Error saat menampilkan form edit kategori:", error);
      req.session.errorMessage = 'Gagal menampilkan form edit kategori.';
      res.redirect('/admin/categories');
    }
  },

  handleUpdateCategory: async (req, res) => {
    const categoryId = req.params.id;
    const { category_name, description } = req.body;
    const adminUsername = req.session.user ? req.session.user.username : 'Admin';

    try {
      if (!category_name || category_name.trim() === '') {
        const categoryToEdit = await Category.findById(categoryId);
        return res.status(400).render('admin/categories/edit_category_form', {
          title: `Edit Kategori: ${categoryToEdit.category_name}`,
          category: categoryToEdit,
          username: adminUsername,
          formError: 'Nama Kategori wajib diisi!',
        });
      }

      const success = await Category.updateById(categoryId, { category_name, description });

      if (success) {
        req.session.successMessage = `Kategori "${category_name}" berhasil diupdate!`;
      } else {
        req.session.errorMessage = `Gagal mengupdate kategori "${category_name}". Tidak ada data yang berubah atau kategori tidak ditemukan.`;
      }
      res.redirect('/admin/categories');

    } catch (error) {
      console.error("Error saat mengupdate kategori:", error);
      const categoryToEdit = await Category.findById(categoryId);
      let errorMessage = 'Terjadi kesalahan saat mengupdate data kategori.';
      if (error.message === 'Nama kategori sudah digunakan oleh kategori lain.') {
        errorMessage = error.message;
      }

      res.status(500).render('admin/categories/edit_category_form', {
        title: `Edit Kategori: ${categoryToEdit ? categoryToEdit.category_name : 'Error'}`,
        category: categoryToEdit,
        username: adminUsername,
        formError: errorMessage,
      });
    }
  },

  handleDeleteCategory: async (req, res) => {
    const categoryId = req.params.id;

    try {
      const success = await Category.deleteById(categoryId);

      if (success) {
        req.session.successMessage = `Kategori dengan ID ${categoryId} berhasil dihapus!`;
      } else {
        req.session.errorMessage = `Kategori dengan ID ${categoryId} tidak ditemukan atau gagal dihapus.`;
      }
    } catch (error) {
      console.error("Error saat menghapus kategori:", error);
      req.session.errorMessage = error.message || `Terjadi kesalahan saat menghapus kategori ID ${categoryId}.`;
    }
    res.redirect('/admin/categories');
  }
};

module.exports = adminCategoryController;