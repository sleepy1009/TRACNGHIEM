const Question = require('../models/Question');
const TestResult = require('../models/TestResult');
const Subject = require('../models/Subject');

exports.getQuestionsBySemester = async (req, res) => {
  try {
    const { subjectId, semester } = req.params;
    const { setNumber } = req.query;

    const query = {
      subjectId,
      semester: parseInt(semester)
    };

    if (setNumber) {
      query.setNumber = parseInt(setNumber);
    }

    const questions = await Question.find(query)
      .select('questionText options correctAnswer setNumber level explain')
      .lean()
      .exec();

    const validatedQuestions = questions.map((question, index) => {
      const correctAnswer = parseInt(question.correctAnswer);
      
      if (isNaN(correctAnswer) || correctAnswer < 0 || correctAnswer >= question.options.length) {
        console.error(`Invalid correctAnswer for question ${index + 1}:`, question);
        throw new Error(`Invalid correctAnswer for question ${index + 1}`);
      }

      return {
        ...question,
        correctAnswer,
      };
    });

    res.status(200).json(validatedQuestions);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      message: error.message || 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

exports.submitAnswers = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      subjectId,
      answers,
      timeSpent,
      questionSet,
      semester,
      setNumber,
      level,
      explain
    } = req.body;

    if (!subjectId || !answers || !questionSet || !Array.isArray(questionSet)) {
      return res.status(400).json({
        message: 'Invalid submission data'
      });
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({
        message: 'Subject not found'
      });
    }

    let score = 0;
      const validatedQuestionSet = questionSet.map(question => {
      const correctAnswer = parseInt(question.correctAnswer);
      const userAnswer = parseInt(question.userAnswer); 
        console.log(`Backend - Question: ${question.questionText}, correctAnswer: ${correctAnswer}, userAnswer: ${userAnswer}`);


      if (isNaN(correctAnswer) || correctAnswer < 0 || correctAnswer >= question.options.length) {
        console.error(`Invalid correctAnswer on backend for question: ${question.questionText}`);
        return { ...question, isCorrect: false };
      }

      const isCorrect = !isNaN(userAnswer) && correctAnswer === userAnswer;
      if (isCorrect) {
        score++;
         console.log(`Backend - Question is correct. Current score: ${score}`);
      } else {
           console.log(`Backend - Question is incorrect.`);
      }

      return {
        ...question,
        correctAnswer, 
        userAnswer: isNaN(userAnswer) ? null : userAnswer, 
        isCorrect
      };
    });

    const newTestResult = new TestResult({
      userId,
      subjectId,
      classId: subject.classId,
      semester: parseInt(semester),
      setNumber: parseInt(setNumber),
      score,
      totalQuestions: questionSet.length,
      answers,
      timeSpent,
      questionSet: validatedQuestionSet,
      date: new Date()
    });

    await newTestResult.save();

    res.status(200).json({
      message: 'Test submitted successfully',
      score,
      totalQuestions: questionSet.length,
      questions: validatedQuestionSet,
      timeSpent,
      semester,
      setNumber
    });

  } catch (error) {
    console.error('Submit error:', error);
    res.status(500).json({ 
      message: 'Error submitting test',
      error: error.message 
    });
  }
};

exports.getQuestionsBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const questions = await Question.find({ subjectId })
      .select('-correctAnswer')
      .sort({ semester: 1 }); 

    const questionsBySemester = {
      1: questions.filter(q => q.semester === 1),
      2: questions.filter(q => q.semester === 2)
    };

    res.status(200).json(questionsBySemester);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};