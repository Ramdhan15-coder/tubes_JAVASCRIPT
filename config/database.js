const mysql = require('mysql2');
const dbConfig = require('./db.config.js'); 

const pool = mysql.createPool({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB,
  waitForConnections: true,
  connectionLimit: dbConfig.pool.max, 
  queueLimit: 0
});


pool.promise().getConnection()
  .then(connection => {
    console.log('Berhasil terhubung ke database MySQL!');
    connection.release(); 
  })
  .catch(err => {
    console.error('Gagal terhubung ke database:', err);

  });

module.exports = pool;