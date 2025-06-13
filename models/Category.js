const pool = require('../config/database.js');

const Category = {
  async getAll(searchTerm = '') {
    try {
      let sql = 'SELECT category_id, category_name, description FROM product_categories';
      const params = [];

      if (searchTerm) {
        sql += ` WHERE category_name LIKE ? OR description LIKE ?`;
        const searchTermLike = `%${searchTerm}%`;
        params.push(searchTermLike, searchTermLike);
      }

      sql += ` ORDER BY category_id ASC`;

      const [categories] = await pool.promise().query(sql, params);
      return categories;
    } catch (error) {
      console.error('Error di model Category.getAll:', error);
      throw error;
    }
  },

  async create(categoryData) {
    const { category_name, description = null } = categoryData;
    try {
      const sql = 'INSERT INTO product_categories (category_name, description) VALUES (?, ?)';
      const [result] = await pool.promise().query(sql, [category_name, description]);
      if (result.insertId) {
        return { category_id: result.insertId, category_name, description };
      } else {
        throw new Error('Gagal membuat kategori baru.');
      }
    } catch (error) {
      console.error('Error di model Category.create:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Nama kategori sudah ada.');
      }
      throw error;
    }
  },

  async findById(categoryId) {
    try {
      const sql = 'SELECT category_id, category_name, description FROM product_categories WHERE category_id = ?';
      const [rows] = await pool.promise().query(sql, [categoryId]);
      return rows[0];
    } catch (error) {
      console.error('Error di model Category.findById:', error);
      throw error;
    }
  },

  async updateById(categoryId, categoryData) {
    const { category_name, description = null } = categoryData;
    try {
      const sql = 'UPDATE product_categories SET category_name = ?, description = ? WHERE category_id = ?';
      const [result] = await pool.promise().query(sql, [category_name, description, categoryId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error di model Category.updateById:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Nama kategori sudah digunakan oleh kategori lain.');
      }
      throw error;
    }
  },

  async deleteById(categoryId) {
    try {
      const sql = 'DELETE FROM product_categories WHERE category_id = ?';
      const [result] = await pool.promise().query(sql, [categoryId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error di model Category.deleteById:', error);
      if (error.code === 'ER_ROW_IS_REFERENCED_2' || (error.message && error.message.includes('foreign key constraint fails'))) {
        throw new Error('Gagal menghapus kategori. Kategori ini mungkin masih digunakan oleh produk.');
      }
      throw error;
    }
  }
};

module.exports = Category;