const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const authMiddleware = require('../middleware/authMiddleware'); 
const testHistoryController = require('../controllers/testHistoryController');

router.post('/register', usersController.register);

router.post('/login', usersController.login);

router.get('/me', authMiddleware, usersController.getUser);

router.put('/me', authMiddleware, usersController.updateUser); 

router.get('/test-history', authMiddleware, testHistoryController.getTestHistory);
router.get('/test-history/:testId', authMiddleware, testHistoryController.getTestDetail);
router.get('/test-history/:testId/download', authMiddleware, testHistoryController.downloadTestReport);

module.exports = router;