const pool = require('../config/database.js');

const Product = {
  async getAllProducts(searchTerm = '') {
    try {
      let sql = `
        SELECT
          p.product_id,
          p.name AS product_name,
          p.price,
          p.stock_quantity,
          pc.category_name,
          p.image_url,
          p.created_at
        FROM products p
        LEFT JOIN product_categories pc ON p.category_id = pc.category_id
      `;
      const params = [];

      if (searchTerm) {
        sql += ` WHERE p.name LIKE ? OR p.description LIKE ? OR pc.category_name LIKE ?`;
        const searchTermLike = `%${searchTerm}%`;
        params.push(searchTermLike, searchTermLike, searchTermLike);
      }

      sql += ` ORDER BY p.product_id ASC`;

      const [products] = await pool.promise().query(sql, params);
      return products;
    } catch (error) {
      console.error('Error di model Product.getAllProducts:', error);
      throw error;
    }
  },
  async create(productData) {
    const {
      name,
      description,
      price,
      stock_quantity,
      category_id,
      image_url = null,
      available_sizes = null,
      available_colors = null
    } = productData;

    try {
      const sql = `
        INSERT INTO products
        (name, description, price, stock_quantity, category_id, image_url, available_sizes, available_colors, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;
      const [result] = await pool.promise().query(sql, [
        name,
        description,
        price,
        stock_quantity,
        category_id,
        image_url,
        available_sizes,
        available_colors
      ]);

      if (result.insertId) {
        return { id: result.insertId, ...productData };
      } else {
        throw new Error('Gagal membuat produk, tidak ada ID yang dikembalikan.');
      }
    } catch (error) {
      console.error('Error di model Product.create:', error);
      throw error;
    }
  },

  async findById(productId) {
    try {
      const sql = `
        SELECT
          p.product_id, p.name, p.description, p.price,
          p.stock_quantity, p.category_id, p.image_url,
          p.available_sizes, p.available_colors,
          pc.category_name
        FROM products p
        LEFT JOIN product_categories pc ON p.category_id = pc.category_id
        WHERE p.product_id = ?
      `;
      const [rows] = await pool.promise().query(sql, [productId]);
      return rows[0];
    } catch (error) {
      console.error('Error di model Product.findById:', error);
      throw error;
    }
  },

  async updateById(productId, productData) {
    const {
      name,
      description,
      price,
      stock_quantity,
      category_id,
      image_url,
      available_sizes,
      available_colors
    } = productData;

    try {
      const sql = `
        UPDATE products SET
          name = ?,
          description = ?,
          price = ?,
          stock_quantity = ?,
          category_id = ?,
          image_url = ?,
          available_sizes = ?,
          available_colors = ?,
          updated_at = NOW()
        WHERE product_id = ?
      `;
      const [result] = await pool.promise().query(sql, [
        name,
        description,
        price,
        stock_quantity,
        category_id,
        image_url,
        available_sizes,
        available_colors,
        productId
      ]);

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error di model Product.updateById:', error);
      throw error;
    }
  },

  async deleteById(productId) {
    try {
      const sql = 'DELETE FROM products WHERE product_id = ?';
      const [result] = await pool.promise().query(sql, [productId]);

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error di model Product.deleteById:', error);
      throw error;
    }
  },

  async decreaseStock(productId, quantityToDecrease) {
    try {
      const [currentProduct] = await pool.promise().query('SELECT stock_quantity FROM products WHERE product_id = ?', [productId]);

      if (!currentProduct || currentProduct.length === 0) {
        throw new Error(`Produk dengan ID ${productId} tidak ditemukan untuk update stok.`);
      }

      const currentStock = currentProduct[0].stock_quantity;

      if (currentStock < quantityToDecrease) {
        const err = new Error(`Stok produk tidak mencukupi. Sisa stok: ${currentStock}, diminta: ${quantityToDecrease}.`);
        err.insufficientStock = true;
        err.currentStock = currentStock;
        err.productName = (await this.findById(productId)).name;
        throw err;
      }

      const newStock = currentStock - quantityToDecrease;
      const sql = 'UPDATE products SET stock_quantity = ? WHERE product_id = ?';
      const [result] = await pool.promise().query(sql, [newStock, productId]);

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error di model Product.decreaseStock:', error);
      throw error;
    }
  },

  async countAll() {
    try {
      const sql = 'SELECT COUNT(product_id) AS total FROM products';
      const [rows] = await pool.promise().query(sql);
      return rows[0].total;
    } catch (error) {
      console.error('Error di model Product.countAll:', error);
      throw error;
    }
  }
};

module.exports = Product;