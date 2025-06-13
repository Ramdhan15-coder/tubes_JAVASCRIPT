const express = require('express');
const router = express.Router();
const adminOrderController = require('../controllers/adminOrderController.js'); // Import controller baru kita
const authMiddleware = require('../middlewares/authMiddleware.js');


router.use(authMiddleware.isAdmin);


router.get('/', adminOrderController.listAllOrders);

router.get('/view/:orderId', adminOrderController.showOrderDetail);

router.post('/status/:orderId', adminOrderController.handleUpdateOrderStatus);

router.post('/cancel/:orderId', adminOrderController.handleCancelOrder);

router.post('/delete/:orderId', adminOrderController.handleDeleteOrder);

module.exports = router;