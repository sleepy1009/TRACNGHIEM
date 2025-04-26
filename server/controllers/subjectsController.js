const Subject = require('../models/Subject');

exports.getSubjectsByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    
    if (!classId) {
      return res.status(400).json({ message: 'Class ID is required' });
    }

    const subjects = await Subject.find({ classId });
    
    if (!subjects || subjects.length === 0) {
      return res.status(404).json({ 
        message: 'No subjects found for this class',
        classId 
      });
    }

    res.status(200).json(subjects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};


exports.getSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await Subject.findById(id).populate('classId'); 

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    res.status(200).json(subject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};