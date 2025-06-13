const express = require('express');
const router = express.Router();


const authController = require('../controllers/authController.js');
const authMiddleware = require('../middlewares/authMiddleware.js');


router.get('/register', authController.renderRegisterPage);

router.post('/register', authController.handleUserRegistration);

// GET /login - Buat nampilin halaman login
router.get('/login', authController.renderLoginPage);

// POST /login - Buat ngirim data login
router.post('/login', authController.handleUserLogin);

// get('/dashboard'));
router.get('/dashboard_user', authController.renderDashboardUser);

// GET /logout - Buat logout
router.get('/logout', authController.handleLogout);

router.get('/profil', authMiddleware.isLoggedIn, authController.renderUserProfile);

router.get('/profil/edit', authMiddleware.isLoggedIn, authController.renderEditProfileForm);
router.post('/profil/edit', authMiddleware.isLoggedIn, authController.handleUpdateProfile);

router.get('/profil/ubah-password', authMiddleware.isLoggedIn, authController.renderChangePasswordForm);
router.post('/profil/ubah-password', authMiddleware.isLoggedIn, authController.handleChangePassword);


module.exports = router;