const express = require('express');
const router = express.Router();
const adminReviewController = require('../controllers/adminReviewController.js');
const authMiddleware = require('../middlewares/authMiddleware.js');

router.use(authMiddleware.isLoggedIn);
router.use(authMiddleware.isAdmin);

router.get('/', adminReviewController.listAllReviews);

router.get('/edit/:id', adminReviewController.renderEditReviewForm);
router.post('/update/:id', adminReviewController.handleUpdateReview);

router.post('/delete/:id', adminReviewController.handleDeleteReview);

module.exports = router;