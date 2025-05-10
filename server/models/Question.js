const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const questionSchema = new Schema({
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },
  semester: { type: Number, enum: [1, 2], required: true }, 
  setNumber: { type: Number, required: true },
  level: { type: String, required: true},
  explain: { type: String, required: true},
}, { timestamps: true });
questionSchema.index({ subjectId: 1, semester: 1 });
const Question = mongoose.model('Question', questionSchema);

module.exports = Question;