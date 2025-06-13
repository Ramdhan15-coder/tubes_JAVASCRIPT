const express = require('express');
const router = express.Router();
const adminCategoryController = require('../controllers/adminCategoryController.js');
const authMiddleware = require('../middlewares/authMiddleware.js');

router.use(authMiddleware.isLoggedIn);
router.use(authMiddleware.isAdmin);

router.get('/', adminCategoryController.listCategories);

router.get('/new', adminCategoryController.renderNewCategoryForm);
router.post('/create', adminCategoryController.handleCreateCategory);

router.get('/edit/:id', adminCategoryController.renderEditCategoryForm);
router.post('/update/:id', adminCategoryController.handleUpdateCategory);

router.post('/delete/:id', adminCategoryController.handleDeleteCategory);

module.exports = router;