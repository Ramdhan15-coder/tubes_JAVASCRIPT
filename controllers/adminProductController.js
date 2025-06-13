const Product = require('../models/Product.js');
const Category = require('../models/Category.js');

const adminProductController = {
  listProducts: async (req, res) => {
    try {
      const searchTerm = req.query.search || '';

      const products = await Product.getAllProducts(searchTerm);

      const adminUsername = req.session.user ? req.session.user.username : 'Admin';

      res.render('admin/products/list_products', {
        title: 'Kelola Produk Jaket',
        products: products,
        username: adminUsername,
        searchTerm: searchTerm,
      });
    } catch (error) {
      console.error("Error saat mengambil daftar produk:", error);
      req.session.errorMessage = 'Gagal mengambil data produk.';
      res.redirect('/admin/dashboard');
    }
  },

  renderNewProductForm: async (req, res) => {
    try {
      const categories = await Category.getAll();
      const adminUsername = req.session.user ? req.session.user.username : 'Admin';

      res.render('admin/products/new_form', {
        title: 'Tambah Produk Jaket Baru',
        categories: categories,
        username: adminUsername,
        formData: {},
        formError: null,
      });
    } catch (error) {
      console.error("Error saat menampilkan form tambah produk:", error);
      req.session.errorMessage = 'Gagal menampilkan form tambah produk.';
      res.redirect('/admin/products');
    }
  },

  handleCreateProduct: async (req, res) => {
    const { name, description, price, stock_quantity, category_id, image_url, available_sizes, available_colors } = req.body;
    const adminUsername = req.session.user ? req.session.user.username : 'Admin';

    try {
      if (!name || !description || !price || !stock_quantity || !category_id) {
        const categories = await Category.getAll();
        return res.status(400).render('admin/products/new_form', {
          title: 'Tambah Produk Jaket Baru',
          categories: categories,
          username: adminUsername,
          formData: req.body,
          formError: 'Field yang wajib (Nama, Deskripsi, Harga, Stok, Kategori) harus diisi!',
        });
      }

      const productData = { name, description, price: parseFloat(price), stock_quantity: parseInt(stock_quantity), category_id: parseInt(category_id), image_url, available_sizes, available_colors };

      await Product.create(productData);

      req.session.successMessage = `Produk baru "${name}" berhasil ditambahkan!`;
      res.redirect('/admin/products');

    } catch (error) {
      console.error("Error saat membuat produk baru:", error);
      const categories = await Category.getAll();
      let errorMessage = 'Gagal menambahkan produk baru. Terjadi kesalahan server.';

      res.status(500).render('admin/products/new_form', {
        title: 'Tambah Produk Jaket Baru',
        categories: categories,
        username: adminUsername,
        formData: req.body,
        formError: errorMessage,
      });
    }
  },

  renderEditProductForm: async (req, res) => {
    try {
      const productId = req.params.id;
      const productToEdit = await Product.findById(productId);
      const categories = await Category.getAll();
      const adminUsername = req.session.user ? req.session.user.username : 'Admin';

      if (!productToEdit) {
        req.session.errorMessage = `Produk dengan ID ${productId} tidak ditemukan.`;
        return res.redirect('/admin/products');
      }

      res.render('admin/products/edit_form', {
        title: `Edit Produk: ${productToEdit.name}`,
        product: productToEdit,
        categories: categories,
        username: adminUsername,
        formError: null,
      });
    } catch (error) {
      console.error("Error saat menampilkan form edit produk:", error);
      req.session.errorMessage = 'Gagal menampilkan form edit produk.';
      res.redirect('/admin/products');
    }
  },

  handleUpdateProduct: async (req, res) => {
    const productId = req.params.id;
    const { name, description, price, stock_quantity, category_id, image_url, available_sizes, available_colors } = req.body;
    const adminUsername = req.session.user ? req.session.user.username : 'Admin';

    try {
      if (!name || !description || !price || !stock_quantity || !category_id) {
        const productToEdit = await Product.findById(productId);
        const categories = await Category.getAll();
        return res.status(400).render('admin/products/edit_form', {
          title: `Edit Produk: ${productToEdit.name}`,
          product: productToEdit,
          categories: categories,
          username: adminUsername,
          formError: 'Field yang wajib (Nama, Deskripsi, Harga, Stok, Kategori) harus diisi!',
        });
      }

      const productData = { name, description, price: parseFloat(price), stock_quantity: parseInt(stock_quantity), category_id: parseInt(category_id), image_url, available_sizes, available_colors };

      const success = await Product.updateById(productId, productData);

      if (success) {
        req.session.successMessage = `Produk "${name}" berhasil diupdate!`;
      } else {
        req.session.errorMessage = `Gagal mengupdate produk "${name}". Tidak ada data yang berubah atau produk tidak ditemukan.`;
      }
      res.redirect('/admin/products');

    } catch (error) {
      console.error("Error saat mengupdate produk:", error);
      const productToEdit = await Product.findById(productId);
      const categories = await Category.getAll();
      let errorMessage = 'Terjadi kesalahan saat mengupdate data produk.';

      res.status(500).render('admin/products/edit_form', {
        title: `Edit Produk: ${productToEdit ? productToEdit.name : 'Error'}`,
        product: productToEdit,
        categories: categories,
        username: adminUsername,
        formError: errorMessage,
      });
    }
  },

  handleDeleteProduct: async (req, res) => {
    const productId = req.params.id;

    try {
      const success = await Product.deleteById(productId);

      if (success) {
        req.session.successMessage = `Produk dengan ID ${productId} berhasil dihapus!`;
      } else {
        req.session.errorMessage = `Produk dengan ID ${productId} tidak ditemukan atau gagal dihapus.`;
      }
    } catch (error) {
      console.error("Error saat menghapus produk:", error);
      if (error.code === 'ER_ROW_IS_REFERENCED_2' || (error.message && error.message.includes('foreign key constraint fails'))) {
          req.session.errorMessage = `Gagal menghapus produk ID ${productId}. Produk ini mungkin masih ada di data pesanan.`;
      } else {
          req.session.errorMessage = `Terjadi kesalahan saat menghapus produk ID ${productId}.`;
      }
    }
    res.redirect('/admin/products');
  }
};
module.exports = adminProductController;