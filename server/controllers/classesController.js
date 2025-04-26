const Class = require('../models/Class');

exports.getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find();
    res.status(200).json(classes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
exports.getClass = async (req, res) => { 
  try {
      const { id } = req.params;
      const classItem = await Class.findById(id);
      if(!classItem){
          return res.status(404).json({ message: 'Class not found' });
      }
      res.status(200).json(classItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};