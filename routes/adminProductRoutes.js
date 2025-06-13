const express = require('express');
const router = express.Router();
const adminProductController = require('../controllers/adminProductController.js'); // PASTIKAN INI DI-IMPORT
const authMiddleware = require('../middlewares/authMiddleware.js');

router.use(authMiddleware.isLoggedIn);
router.use(authMiddleware.isAdmin);


router.get('/', adminProductController.listProducts);


router.get('/new', adminProductController.renderNewProductForm); 

router.post('/create', adminProductController.handleCreateProduct);

router.get('/edit/:id', adminProductController.renderEditProductForm); 

router.post('/update/:id', adminProductController.handleUpdateProduct);

router.post('/delete/:id', adminProductController.handleDeleteProduct);


module.exports = router;