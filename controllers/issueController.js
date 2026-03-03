const Issue = require('../models/Issue');
const User = require('../models/User');
const mongoose = require('mongoose');

// In-memory storage
let issues = [
  {
    _id: '1',
    userId: '2',
    issueType: 'road',
    description: 'Large pothole on Main Street causing damage to vehicles. The hole is approximately 3 feet wide and 1 foot deep.',
    location: 'Main Street, near City Hall',
    status: 'resolved',
    priority: 'high',
    upvotes: [],
    tags: ['urgent', 'safety'],
    comments: [],
    image: null,
    resolution: {
      solution: 'Road repair crew dispatched and pothole filled',
      resolvedDate: new Date('2024-01-18')
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-18')
  },
  {
    _id: '2',
    userId: '2',
    issueType: 'water',
    description: 'Water pipe burst causing flooding on the sidewalk. Water is continuously flowing and creating a safety hazard.',
    location: 'Park Avenue, Block 5',
    status: 'in-progress',
    priority: 'critical',
    upvotes: [],
    tags: ['emergency'],
    comments: [],
    image: null,
    resolution: {
      solution: 'Plumbing team working on pipe replacement',
      estimatedDate: new Date('2024-02-01')
    },
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-14')
  },
  {
    _id: '3',
    userId: '3',
    issueType: 'streetlight',
    description: 'Street light not working for over a week. The area is very dark at night creating safety concerns.',
    location: 'Oak Street and 2nd Avenue intersection',
    status: 'pending',
    priority: 'medium',
    upvotes: [],
    tags: ['lighting'],
    comments: [],
    image: null,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-16')
  },
  {
    _id: '4',
    userId: '3',
    issueType: 'garbage',
    description: 'Garbage bins overflowing for several days. Attracting pests and creating unpleasant odors.',
    location: 'Residential Area, Maple Drive',
    status: 'in-progress',
    priority: 'high',
    upvotes: [],
    tags: ['sanitation'],
    comments: [],
    image: null,
    resolution: {
      solution: 'Extra collection scheduled',
      estimatedDate: new Date('2024-01-25')
    },
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-14')
  },
  {
    _id: '5',
    userId: '2',
    issueType: 'other',
    description: 'Broken playground equipment in the park. The swing set is damaged and unsafe for children.',
    location: 'Central Park, Children Area',
    status: 'resolved',
    priority: 'medium',
    upvotes: [],
    tags: ['park', 'children'],
    comments: [],
    image: null,
    resolution: {
      solution: 'Swing set repaired and safety inspected',
      resolvedDate: new Date('2024-01-15')
    },
    createdAt: new Date('2024-01-13'),
    updatedAt: new Date('2024-01-15')
  }
];

let nextIssueId = 6;

// Create Issue
const createIssue = async (req, res) => {
  try {
    const { issueType, description, location, priority, tags } = req.body;
    const userId = req.userId;

    const issue = {
      _id: (nextIssueId++).toString(),
      userId,
      issueType,
      description,
      location,
      image: req.file ? req.file.filename : null,
      status: 'pending',
      priority: priority || 'medium',
      upvotes: [],
      tags: tags ? JSON.parse(tags) : [],
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    issues.push(issue);
    res.status(201).json({ success: true, message: 'Issue reported successfully', issue });
  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({ success: false, message: 'Server error while creating issue' });
  }
};

// Get User Issues
const getUserIssues = async (req, res) => {
  try {
    const userId = req.userId;
    // For demo purposes, show all issues to any logged-in user
    const userIssues = issues.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, issues: userIssues });
  } catch (error) {
    console.error('Get user issues error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching issues' });
  }
};

// Get All Issues (Admin)
const getAllIssues = async (req, res) => {
  try {
    const sampleUsers = {
      '2': { email: 'john@cityreport.com', name: 'John Citizen' },
      '3': { email: 'jane@cityreport.com', name: 'Jane Smith' },
      '4': { email: 'mike@cityreport.com', name: 'Mike Johnson' },
      '5': { email: 'sarah@cityreport.com', name: 'Sarah Wilson' }
    };

    const allIssues = issues.map(issue => ({
      ...issue,
      userId: sampleUsers[issue.userId] || { email: 'unknown@demo.com', name: 'Unknown User' }
    })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, issues: allIssues });
  } catch (error) {
    console.error('Get all issues error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching issues' });
  }
};

// Update Issue Status (Admin)
const updateIssueStatus = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { status, solution, estimatedDate } = req.body;

    const issueIndex = issues.findIndex(i => i._id === issueId);
    if (issueIndex !== -1) {
      issues[issueIndex].status = status;
      issues[issueIndex].updatedAt = new Date();
      
      if (!issues[issueIndex].resolution) {
        issues[issueIndex].resolution = {};
      }
      
      if (solution) {
        issues[issueIndex].resolution.solution = solution;
      }
      if (estimatedDate) {
        issues[issueIndex].resolution.estimatedDate = new Date(estimatedDate);
      }
      if (status === 'resolved') {
        issues[issueIndex].resolution.resolvedDate = new Date();
        issues[issueIndex].resolution.resolvedBy = req.userId;
      }
      
      const issue = issues[issueIndex];
      res.json({ success: true, message: 'Issue status updated successfully', issue });
    } else {
      res.status(404).json({ success: false, message: 'Issue not found' });
    }
  } catch (error) {
    console.error('Update issue status error:', error);
    res.status(500).json({ success: false, message: 'Server error while updating issue status' });
  }
};

// Get Issue Statistics
const getIssueStats = async (req, res) => {
  try {
    const totalIssues = issues.length;
    const pendingIssues = issues.filter(i => i.status === 'pending').length;
    const inProgressIssues = issues.filter(i => i.status === 'in-progress').length;
    const resolvedIssues = issues.filter(i => i.status === 'resolved').length;
    
    res.json({
      success: true,
      stats: {
        total: totalIssues,
        pending: pendingIssues,
        inProgress: inProgressIssues,
        resolved: resolvedIssues
      }
    });
  } catch (error) {
    console.error('Get issue stats error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching statistics' });
  }
};

// Delete Issue
const deleteIssue = async (req, res) => {
  try {
    const { issueId } = req.params;
    const userId = req.userId;

    console.log('Delete request for issue:', issueId, 'by user:', userId);
    
    // Find issue index
    const issueIndex = issues.findIndex(i => i._id === issueId);
    
    if (issueIndex === -1) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    // For demo purposes, allow any user to delete any issue
    issues.splice(issueIndex, 1);
    console.log('Issue deleted successfully. Remaining issues:', issues.length);
    
    res.json({ success: true, message: 'Issue deleted successfully' });
  } catch (error) {
    console.error('Delete issue error:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting issue' });
  }
};

// Toggle Upvote
const toggleUpvote = async (req, res) => {
  try {
    const { issueId } = req.params;
    const userId = req.userId;

    const issue = issues.find(i => i._id === issueId);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    if (!issue.upvotes) issue.upvotes = [];
    
    const upvoteIndex = issue.upvotes.indexOf(userId);
    if (upvoteIndex > -1) {
      issue.upvotes.splice(upvoteIndex, 1);
    } else {
      issue.upvotes.push(userId);
    }

    res.json({ success: true, upvotes: issue.upvotes.length, hasUpvoted: upvoteIndex === -1 });
  } catch (error) {
    console.error('Toggle upvote error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Add Comment
const addComment = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { text } = req.body;
    const userId = req.userId;

    const issue = issues.find(i => i._id === issueId);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    if (!issue.comments) issue.comments = [];
    
    const comment = {
      userId,
      text,
      createdAt: new Date()
    };
    
    issue.comments.push(comment);
    issue.updatedAt = new Date();

    res.json({ success: true, message: 'Comment added', comment });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  createIssue,
  getUserIssues,
  getAllIssues,
  updateIssueStatus,
  getIssueStats,
  deleteIssue,
  toggleUpvote,
  addComment
};