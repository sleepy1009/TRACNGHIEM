const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const testResultSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
  semester: { type: Number, enum: [1, 2], required: true },
  setNumber: { type: Number, required: true },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  answers: { type: Object, required: true },
  timeSpent: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  questionSet: [{
    questionId: { type: Schema.Types.ObjectId, ref: 'Question' },
    questionText: String,
    options: [String],
    correctAnswer: Number,
    userAnswer: Number,
    semester: Number 
  }]
}, { timestamps: true });

const TestResult = mongoose.model('TestResult', testResultSchema);

module.exports = TestResult;