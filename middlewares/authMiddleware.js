const authMiddleware = {
  
  isLoggedIn: (req, res, next) => {
    if (req.session && req.session.user) {
     
      return next();
    } else {
    
      req.session.loginError = 'Anda harus login dulu untuk mengakses halaman ini.';
      return res.redirect('/login');
    }
  },

 
  isAdmin: (req, res, next) => {
  
    if (req.session.user && req.session.user.roleId === 1) { 
      
      return next();
    } else {

      console.log('Akses ditolak: User bukan admin. Role ID:', req.session.user ? req.session.user.roleId : 'Tidak ada session');
      res.status(403).send('<h1>403 Forbidden</h1><p>Anda tidak memiliki hak akses ke halaman ini.</p><a href="/">Kembali ke Home</a>');
      
    }
  }
};

module.exports = authMiddleware;