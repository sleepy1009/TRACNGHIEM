const express = require('express');
const router = express.Router();
const Question = require('../models/Question'); 
const questionsController = require('../controllers/questionsController');
const TestResult = require('../models/TestResult');
const Subject = require('../models/Subject');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/bySubject/:subjectId', authMiddleware, questionsController.getQuestionsBySubject);

router.get('/bySubject/:subjectId/:semester', authMiddleware, async (req, res) => {
    try {
        const { subjectId, semester } = req.params;
        const { setNumber } = req.query; // Get setNumber from query params

        console.log('Fetching questions with params:', { 
            subjectId, 
            semester,
            setNumber,
            userId: req.userId 
        });

        if (!subjectId || !semester) {
            return res.status(400).json({
                message: 'Missing required parameters: subjectId or semester'
            });
        }

        const parsedSemester = parseInt(semester);
        if (parsedSemester !== 1 && parsedSemester !== 2) {
            return res.status(400).json({
                message: 'Invalid semester value. Must be 1 or 2'
            });
        }

        const query = { 
            subjectId: subjectId,
            semester: parsedSemester
        };

        if (setNumber) {
            query.setNumber = parseInt(setNumber);
        }

        const questions = await Question.find(query)
            .select('questionText options correctAnswer setNumber') 
            .lean()
            .exec();

        console.log(`Found ${questions.length} questions`);

        if (questions.length > 0) {
            console.log('Sample question:', {
                ...questions[0],
                correctAnswer: questions[0].correctAnswer
            });
        }

        if (!questions || questions.length === 0) {
            return res.status(404).json({ 
                message: 'No questions found for this subject and semester' 
            });
        }

        res.json(questions);

    } catch (error) {
        console.error('Error in /bySubject/:subjectId/:semester:', error);
        res.status(500).json({ 
            message: 'Server error while fetching questions',
            error: error.message 
        });
    }
});
router.post('/submit', authMiddleware, questionsController.submitAnswers);

module.exports = router;