const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController.js');

router.get('/db-test', testController.testDatabaseQuery);

module.exports = router;