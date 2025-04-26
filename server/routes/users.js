const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const authMiddleware = require('../middleware/authMiddleware');
const testHistoryController = require('../controllers/testHistoryController');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '../uploads/avatars');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Chỉ chấp nhận file ảnh định dạng JPEG, PNG hoặc GIF.'));
        }
    }
});

router.post('/avatar', authMiddleware, upload.single('avatar'), async (req, res) => {
    try {
        console.log('Current user:', req.user); 

        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'Không có file nào được tải lên' });
        }

        const avatarUrl = `/uploads/avatars/${req.file.filename}`;

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { avatarUrl: avatarUrl },
            { new: true }
        );

        if (!updatedUser) {
            const fs = require('fs');
            const filePath = path.join(__dirname, '..', avatarUrl);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        res.json({
            message: 'Tải lên ảnh đại diện thành công',
            avatarUrl: avatarUrl
        });
    } catch (error) {
        console.error('Error uploading avatar:', error);
        if (req.file) {
            const fs = require('fs');
            const filePath = path.join(__dirname, '..', `/uploads/avatars/${req.file.filename}`);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        res.status(500).json({ message: 'Lỗi khi tải lên ảnh đại diện' });
    }
});

router.post('/register', usersController.register);
router.post('/login', usersController.login);
router.get('/me', authMiddleware, usersController.getUser);
router.put('/me', authMiddleware, usersController.updateUser);
router.get('/test-history', authMiddleware, testHistoryController.getTestHistory);
router.get('/test-history/:testId', authMiddleware, testHistoryController.getTestDetail);
router.get('/test-history/:testId/download', authMiddleware, testHistoryController.downloadTestReport);

module.exports = router;