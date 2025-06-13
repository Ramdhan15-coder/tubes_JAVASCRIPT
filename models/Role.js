const pool = require('../config/database.js');

const Role = {
  async getAll() {
    try {
      const sql = 'SELECT role_id, role_name FROM roles ORDER BY role_name ASC';
      const [roles] = await pool.promise().query(sql);
      return roles;
    } catch (error) {
      console.error('Error di model Role.getAll:', error);
      throw error;
    }
  }
};

module.exports = Role;