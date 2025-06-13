const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController.js');
const authMiddleware = require('../middlewares/authMiddleware.js'); // Panggil middleware kita

router.use(authMiddleware.isLoggedIn);
router.use(authMiddleware.isAdmin);

// Rute untuk admin dashboard
router.get('/dashboard', adminController.renderAdminDashboard);

router.get('/users', adminController.listUsers);

router.get('/users/edit/:id', adminController.renderEditUserForm);
router.post('/users/update/:id', adminController.handleUpdateUser);

router.post('/users/delete/:id', adminController.handleDeleteUser);

router.get('/users/new', adminController.renderCreateUserForm); 
router.post('/users/create', adminController.handleAdminCreateUser);



module.exports = router;