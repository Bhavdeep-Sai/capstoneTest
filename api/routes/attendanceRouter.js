const express = require('express');
const authMiddleware = require('../auth/auth');
const { 
  markAttendance, 
  markBulkAttendance, 
  getAttendance, 
  getBulkAttendance, 
  checkAttendance 
} = require('../controllers/attendanceController');
const router = express.Router();

// Mark individual attendance (keeping for backward compatibility)
router.post('/mark', authMiddleware(['TEACHER']), markAttendance);

// Mark bulk attendance for a class (new route for efficient attendance taking)
router.post('/mark-bulk', authMiddleware(['TEACHER']), markBulkAttendance);

// Check if attendance has been taken for a class on current date
router.get('/check/:classId', authMiddleware(['SCHOOL', 'TEACHER']), checkAttendance); 

// Get attendance for a specific student
router.get('/:id', authMiddleware(['SCHOOL', 'TEACHER']), getAttendance);

// Get bulk attendance for multiple students (POST request to send student IDs in body)
router.post('/bulk', authMiddleware(['SCHOOL', 'TEACHER']), getBulkAttendance);

module.exports = router;