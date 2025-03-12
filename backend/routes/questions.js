const express = require('express');
const router = express.Router();
const questionsController = require('../controllers/questionsController');
const authMiddleware = require('../middleware/authMiddleware'); 

router.get('/bySubject/:subjectId', authMiddleware, questionsController.getQuestionsBySubject);

router.post('/submit', authMiddleware, questionsController.submitAnswers); 

module.exports = router;