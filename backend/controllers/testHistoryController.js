const TestResult = require('../models/TestResult');
const Question = require('../models/Question');

exports.getTestHistory = async (req, res) => {
  try {
    const userId = req.userId;

    const testResults = await TestResult.find({ userId })
      .populate('subjectId', 'name')
      .populate('classId', 'name')
      .sort({ date: -1 });

    res.status(200).json(testResults);
  } catch (error) {
    console.error('Error in getTestHistory:', error);
    res.status(500).json({ message: 'Server error fetching test history.' });
  }
};

exports.getTestDetail = async (req, res) => {
  try {
    const { testId } = req.params;
    const userId = req.userId;

    const testResult = await TestResult.findOne({ _id: testId, userId })
      .populate('subjectId', 'name')
      .populate('classId', 'name');

    if (!testResult) {
      return res.status(404).json({ message: 'Test result not found.' });
    }

    res.status(200).json(testResult);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching test detail.' });
  }
};

exports.downloadTestReport = async (req, res) => {
  try {
    const { testId } = req.params;
    const userId = req.userId;

    const testResult = await TestResult.findOne({ _id: testId, userId })
      .populate('subjectId', 'name')
      .populate('classId', 'name');

    if (!testResult) {
      return res.status(404).json({ message: 'Test result not found.' });
    }

    let reportContent = `Kết quả kiểm tra\n`;
    reportContent += `===========\n\n`;
    reportContent += `Môn: ${testResult.subjectId.name}\n`;
    reportContent += `Lớp: ${testResult.classId.name}\n`;
    reportContent += `Ngày: ${new Date(testResult.date).toLocaleString()}\n`;
    reportContent += `Score: ${testResult.score} / ${testResult.totalQuestions}\n`;
    reportContent += `Thời gian làm bài: ${Math.floor(testResult.timeSpent / 60)}:${(testResult.timeSpent % 60).toString().padStart(2, '0')}\n\n`;
    reportContent += `Đáp án và câu hỏi:\n\n`;

    testResult.questionSet.forEach((question, index) => {
      reportContent += `Câu ${index + 1}: ${question.questionText}\n`;
      question.options.forEach((option, optionIndex) => {
        const prefix = question.userAnswer === optionIndex ? '[X]' : '[ ]';
        const correct = question.correctAnswer === optionIndex ? ' [Đáp án đúng]' : '';
        reportContent += `${prefix} ${String.fromCharCode(65 + optionIndex)}. ${option}${correct}\n`;
      });
      reportContent += '\n';
    });

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename=test-report-${testId}.txt`);
    res.send(reportContent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error generating test report.' });
  }
};