const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController.js'); 
const authMiddleware = require('../middlewares/authMiddleware.js'); 


router.post('/add/:productId', cartController.addToCart);

router.get('/', cartController.viewCart); 

router.post('/update/:productId', cartController.updateCartItem);


router.post('/remove/:productId', cartController.removeCartItem);

module.exports = router;