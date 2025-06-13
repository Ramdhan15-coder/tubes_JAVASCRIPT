const pool = require('../config/database.js');

const Review = {
  async findByProductId(productId) {
    try {
      const sql = `
        SELECT
          r.review_id, r.rating, r.comment, r.review_date,
          u.username AS reviewer_username
        FROM reviews r
        JOIN users u ON r.user_id = u.user_id
        WHERE r.product_id = ?
        ORDER BY r.review_date DESC
      `;
      const [reviews] = await pool.promise().query(sql, [productId]);
      return reviews;
    } catch (error) {
      console.error('Error di model Review.findByProductId:', error);
      throw error;
    }
  },

  async create(reviewData) {
    const { product_id, user_id, rating, comment } = reviewData;
    try {
      const sql = `
        INSERT INTO reviews (product_id, user_id, rating, comment, review_date)
        VALUES (?, ?, ?, ?, NOW())
      `;
      const [result] = await pool.promise().query(sql, [product_id, user_id, rating, comment]);
      if (result.insertId) {
        return { review_id: result.insertId, ...reviewData };
      } else {
        throw new Error('Gagal membuat review.');
      }
    } catch (error) {
      console.error('Error di model Review.create:', error);
      throw error;
    }
  },

  async getAllReviewsForAdmin(searchTerm = '') {
    try {
      let sql = `
        SELECT
          r.review_id, r.rating, r.comment, r.review_date,
          u.username AS reviewer_username,
          p.name AS product_name,
          p.product_id
        FROM reviews r
        JOIN users u ON r.user_id = u.user_id
        JOIN products p ON r.product_id = p.product_id
      `;
      const params = [];

      if (searchTerm) {
        sql += ` WHERE r.comment LIKE ? OR u.username LIKE ? OR p.name LIKE ?`;
        const searchTermLike = `%${searchTerm}%`;
        params.push(searchTermLike, searchTermLike, searchTermLike);
      }

      sql += ` ORDER BY r.review_date DESC`;

      const [reviews] = await pool.promise().query(sql, params);
      return reviews;
    } catch (error) {
      console.error('Error di model Review.getAllReviewsForAdmin:', error);
      throw error;
    }
  },

  async findReviewById(reviewId) {
    try {
      const sql = `
        SELECT
          r.review_id, r.rating, r.comment, r.review_date,
          u.username AS reviewer_username,
          p.name AS product_name,
          r.product_id, r.user_id
        FROM reviews r
        JOIN users u ON r.user_id = u.user_id
        JOIN products p ON r.product_id = p.product_id
        WHERE r.review_id = ?
      `;
      const [rows] = await pool.promise().query(sql, [reviewId]);
      return rows[0];
    } catch (error) {
      console.error('Error di model Review.findReviewById:', error);
      throw error;
    }
  },

  async updateReviewById(reviewId, reviewData) {
    const { rating, comment } = reviewData;
    try {
      const sql = 'UPDATE reviews SET rating = ?, comment = ?, review_date = NOW() WHERE review_id = ?';
      const [result] = await pool.promise().query(sql, [rating, comment, reviewId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error di model Review.updateReviewById:', error);
      throw error;
    }
  },

  async deleteReviewById(reviewId) {
    try {
      const sql = 'DELETE FROM reviews WHERE review_id = ?';
      const [result] = await pool.promise().query(sql, [reviewId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error di model Review.deleteReviewById:', error);
      throw error;
    }
  },

  async countAll() {
    try {
      const sql = 'SELECT COUNT(review_id) AS total FROM reviews';
      const [rows] = await pool.promise().query(sql);
      return rows[0].total;
    } catch (error) {
      console.error('Error di model Review.countAll:', error);
      throw error;
    }
  }
};

module.exports = Review;