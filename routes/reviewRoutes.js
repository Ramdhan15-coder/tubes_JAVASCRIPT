const express = require('express');
const router = express.Router({ mergeParams: true });
const reviewController = require('../controllers/reviewController.js');
const authMiddleware = require('../middlewares/authMiddleware.js');

router.post('/create', authMiddleware.isLoggedIn, reviewController.handleAddReview);

module.exports = router;