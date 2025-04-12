const express = require('express');
const router = express.Router();
const Test = require('../models/TestResult');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');

router.get('/', async (req, res) => {
  try {
    const rankings = await Test.aggregate([
      {
        $group: {
          _id: '$userId',
          totalTests: { $sum: 1 },
          totalScore: {
            $sum: {
              $multiply: [
                {
                  $size: {
                    $filter: {
                      input: '$questionSet',
                      as: 'question',
                      cond: { $eq: ['$$question.userAnswer', '$$question.correctAnswer'] }
                    }
                  }
                },
                0.25 
              ]
            }
          }
        }
      },
      // Cal average score
      {
        $project: {
          totalTests: 1,
          averageScore: { $divide: ['$totalScore', '$totalTests'] }
        }
      },
      // Sort by average score (desc) and by total tests (desc)
      {
        $sort: {
          averageScore: -1,
          totalTests: -1
        }
      },
      //  top 10
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      { $unwind: '$userDetails' },
      {
        $project: {
          _id: '$userDetails._id',
          username: '$userDetails.username',
          averageScore: 1,
          totalTests: 1
        }
      }
    ]);

    res.json(rankings);
  } catch (error) {
    console.error('Error fetching rankings:', error);
    res.status(500).json({ message: 'Lỗi khi tải bảng xếp hạng' });
  }
});

module.exports = router;