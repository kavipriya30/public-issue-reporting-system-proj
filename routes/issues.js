const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { 
  createIssue, 
  getUserIssues, 
  getAllIssues, 
  updateIssueStatus, 
  getIssueStats,
  deleteIssue,
  toggleUpvote,
  addComment
} = require('../controllers/issueController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/issueImages/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Create issue
router.post('/', authMiddleware, upload.single('image'), createIssue);

// Get user's issues
router.get('/my-issues', authMiddleware, getUserIssues);

// Get all issues (admin only)
router.get('/all', authMiddleware, adminMiddleware, getAllIssues);

// Update issue status (admin only)
router.put('/:issueId/status', authMiddleware, adminMiddleware, updateIssueStatus);

// Get issue statistics (admin only)
router.get('/stats', authMiddleware, adminMiddleware, getIssueStats);

// Delete issue
router.delete('/:issueId', authMiddleware, deleteIssue);

// Toggle upvote
router.post('/:issueId/upvote', authMiddleware, toggleUpvote);

// Add comment
router.post('/:issueId/comment', authMiddleware, addComment);

module.exports = router;