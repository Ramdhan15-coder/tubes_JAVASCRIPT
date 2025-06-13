const pool = require('../config/database.js');
const bcrypt = require('bcryptjs');

const User = {
  async create(userData) {
    const { username, email, password, role_id = 2 } = userData;

    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const sql = 'INSERT INTO users (username, email, password, role_id) VALUES (?, ?, ?, ?)';
      const [result] = await pool.promise().query(sql, [username, email, hashedPassword, role_id]);

      if (result.insertId) {
        return { id: result.insertId, username, email, role_id };
      } else {
        throw new Error('Gagal membuat user, tidak ada ID yang dikembalikan.');
      }
    } catch (error) {
      console.error('Error di model User.create:', error);
      throw error;
    }
  },

  async findByUsername(username) {
    try {
      const sql = 'SELECT user_id, username, password, role_id, email FROM users WHERE username = ?';
      const [rows] = await pool.promise().query(sql, [username]);

      return rows[0];
    } catch (error) {
      console.error('Error di model User.findByUsername:', error);
      throw error;
    }
  },

  async getAllUsers(searchTerm = '') {
    try {
      let sql = `
        SELECT u.user_id, u.username, u.email, u.created_at, r.role_name
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
      `;
      const params = [];

      if (searchTerm) {
        sql += ` WHERE u.username LIKE ? OR u.email LIKE ? OR r.role_name LIKE ?`;
        const searchTermLike = `%${searchTerm}%`;
        params.push(searchTermLike, searchTermLike, searchTermLike);
      }

      sql += ` ORDER BY u.user_id ASC`;

      const [users] = await pool.promise().query(sql, params);
      return users;
    } catch (error) {
      console.error('Error di model User.getAllUsers:', error);
      throw error;
    }
  },

  async findById(userId) {
    try {
      // TAMBAHKAN 'password' DI SINI BIAR BISA DIPAKE BUAT UBAH PASSWORD
      const sql = 'SELECT user_id, username, email, password, role_id, full_name, default_address, phone_number FROM users WHERE user_id = ?';
      const [rows] = await pool.promise().query(sql, [userId]);
      return rows[0]; // Kembalikan user pertama (atau undefined jika tidak ditemukan)
    } catch (error) {
      console.error('Error di model User.findById:', error);
      throw error;
    }
  },

  async updateUserById(userId, userData) {
    const { username, email, role_id } = userData;
    try {
      const sql = 'UPDATE users SET username = ?, email = ?, role_id = ? WHERE user_id = ?';
      const [result] = await pool.promise().query(sql, [username, email, role_id, userId]);

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error di model User.updateUserById:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        const dupError = new Error('Username atau Email sudah digunakan oleh user lain.');
        dupError.isDuplicate = true;
        throw dupError;
      }
      throw error;
    }
  },

  async deleteById(userId) {
    try {
      const sql = 'DELETE FROM users WHERE user_id = ?';
      const [result] = await pool.promise().query(sql, [userId]);

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error di model User.deleteById:', error);
      throw error;
    }
  },

  async countAll() {
    try {
      const sql = 'SELECT COUNT(user_id) AS total FROM users';
      const [rows] = await pool.promise().query(sql);
      return rows[0].total;
    } catch (error) {
      console.error('Error di model User.countAll:', error);
      throw error;
    }
  },

  async updateProfileById(userId, profileData) {
        const { full_name, default_address, phone_number } = profileData;
        try {
            const sql = 'UPDATE users SET full_name = ?, default_address = ?, phone_number = ?, updated_at = NOW() WHERE user_id = ?';
            const [result] = await pool.promise().query(sql, [full_name, default_address, phone_number, userId]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error di model User.updateProfileById:', error);
            throw error;
        }
    },

     async updatePasswordById(userId, newHashedPassword) {
        try {
            const sql = 'UPDATE users SET password = ?, updated_at = NOW() WHERE user_id = ?';
            const [result] = await pool.promise().query(sql, [newHashedPassword, userId]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error di model User.updatePasswordById:', error);
            throw error;
        }
    }
};

module.exports = User;