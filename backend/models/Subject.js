const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subjectSchema = new Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String }, 
  classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true }, 
}, { timestamps: true });

const Subject = mongoose.model('Subject', subjectSchema);

module.exports = Subject;