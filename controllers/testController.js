const pool = require('../config/database.js'); 

const testDatabaseQuery = async (req, res) => {
  try {
    
    const [rows, fields] = await pool.promise().query("SELECT 'Koneksi DB & Query Berhasil!' AS message;");
    
    res.status(200).json({
      success: true,
      message: "Query berhasil dijalankan!",
      data: rows[0] 
    });
  } catch (error) {
   
    console.error("Error saat menjalankan query:", error);
    res.status(500).json({
      success: false,
      message: "Gagal menjalankan query database.",
      error: error.message
    });
  }
};


module.exports = {
  testDatabaseQuery
};