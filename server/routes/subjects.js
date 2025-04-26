const express = require('express');
const router = express.Router();
const subjectsController = require('../controllers/subjectsController');

router.get('/byClass/:classId', subjectsController.getSubjectsByClass);
router.get('/:id', subjectsController.getSubject);

module.exports = router;