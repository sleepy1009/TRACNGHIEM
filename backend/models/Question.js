const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const questionSchema = new Schema({
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  points: { type: Number, default: 1 }
}, { timestamps: true });

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;