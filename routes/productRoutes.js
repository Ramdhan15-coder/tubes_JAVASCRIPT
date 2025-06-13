const express = require('express');
const router = express.Router();
const reviewRoutes = require('./reviewRoutes.js');
const productController = require('../controllers/productController.js');

router.get('/:id', productController.showProductDetail);

router.use('/:productId/reviews', reviewRoutes);

module.exports = router;