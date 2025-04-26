const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique:true,
    trim:true

  },
  description: {
    type: String,
    required: true
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  semesters: [{
    semesterNumber: {
      type: Number,
      required: true,
      enum: [1, 2] 
    },
    description: {
      type: String
    }
  }]
});

module.exports = mongoose.model('Subject', subjectSchema);