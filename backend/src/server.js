require('dotenv').config();// connect to mongodb
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const userRoutes = require('../routes/users'); // get 
const authRoutes = require('../routes/auth');
const classRoutes = require('../routes/classes'); 
const subjectRoutes = require('../routes/subjects'); 
const questionRoutes = require('../routes/questions'); 

const app = express();
const port = 5000;

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/my-testing-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB', err));

mongoose.connection.on('error', (error) => {
  console.error('MongoDB error:', error);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/classes', classRoutes); 
app.use('/api/subjects', subjectRoutes); 
app.use('/api/questions', questionRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});