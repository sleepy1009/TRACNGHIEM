const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: [true, 'Username is required'], 
    unique: true, 
    trim: true,    
    minlength: [3, 'Username must be at least 3 characters long'] 
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true, 
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'] 
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  displayName: { 
    type: String,
    required: [true, 'Display name is required'],
    trim: true,
    minlength: [3, 'Display name must be at least 3 characters long']
  },
  level: {
    type: String, 
  },
  avatarUrl: {
    type: String,
    default: ''
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;