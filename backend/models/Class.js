const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const classSchema = new Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String }, 
}, { timestamps: true });

const Class = mongoose.model('Class', classSchema);

module.exports = Class;