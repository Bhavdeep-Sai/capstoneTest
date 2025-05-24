const express = require('express');
const authMiddleware = require('../auth/auth');
const { 
  createExamination, 
  getAllExamination, 
  getExaminationByClass, 
  updateExaminationWithId,
  deleteExaminationWithId, 
  calculateDuration,
  getAvailableExamTypes
} = require('../controllers/ExaminationController');

const router = express.Router();

// Create examination - Both SCHOOL and TEACHER can create (with role-based restrictions)
router.post('/create', authMiddleware(['TEACHER', 'SCHOOL']), createExamination);

// Get all examinations - SCHOOL sees all, TEACHER sees assigned classes, STUDENT sees their class
router.get('/all', authMiddleware(['SCHOOL', 'TEACHER', 'STUDENT']), getAllExamination); 

// Get examinations by class - All roles can view with proper validation
router.get('/class/:id', authMiddleware(['SCHOOL', 'TEACHER', 'STUDENT']), getExaminationByClass);

// Update examination - SCHOOL can update all, TEACHER can only update their own
router.put('/update/:id', authMiddleware(['SCHOOL', 'TEACHER']), updateExaminationWithId);

// Delete examination - SCHOOL can delete all, TEACHER can only delete their own
router.delete('/delete/:id', authMiddleware(['SCHOOL', 'TEACHER']), deleteExaminationWithId);

// Calculate duration - Both SCHOOL and TEACHER can use this utility
router.post('/calculate-duration', authMiddleware(['SCHOOL', 'TEACHER']), calculateDuration);

// Get available exam types based on user role
router.get('/exam-types', authMiddleware(['SCHOOL', 'TEACHER']), getAvailableExamTypes);

module.exports = router;