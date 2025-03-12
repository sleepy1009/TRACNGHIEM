const Question = require('../models/Question');
const TestResult = require('../models/TestResult'); 
const Subject = require('../models/Subject');

exports.getQuestionsBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const questions = await Question.find({ subjectId }).select('-correctAnswer'); 
    res.status(200).json(questions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.submitAnswers = async (req, res) => {
  try {
    const { subjectId, answers, timeSpent, questionSet } = req.body;
    const userId = req.userId;

    if (!subjectId || !answers || typeof answers !== 'object') {
      return res.status(400).json({ message: 'Invalid request data.' });
    }

    const questions = await Question.find({ subjectId });

    if (!questions || questions.length === 0) {
      return res.status(404).json({ message: 'No questions found for this subject.' });
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found.' });
    }
    const classId = subject.classId;

    let correctCount = 0;
    const totalQuestions = questions.length;

    const processedQuestionSet = questions.map(question => {
      const userAnswer = answers[question._id.toString()];
      const isCorrect = userAnswer === question.correctAnswer;
      if (isCorrect) correctCount++;

      return {
        questionId: question._id,
        questionText: question.questionText,
        options: question.options,
        correctAnswer: question.correctAnswer,
        userAnswer 
      };
    });

    const newTestResult = new TestResult({
      userId,
      subjectId,
      classId,
      score: correctCount,
      totalQuestions,
      answers, 
      timeSpent: timeSpent || 0,
      questionSet: processedQuestionSet,
    });

    await newTestResult.save();

    res.status(200).json({
      message: 'Answers submitted successfully.',
      score: correctCount,
      totalQuestions,
      questions: processedQuestionSet, 
      selectedAnswers: answers,
      timeSpent
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during answer submission.' });
  }
};