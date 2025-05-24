const express = require('express');
const authMiddleware = require('../auth/auth');
const { 
    createSchedule, 
    getSchedulewithClass, 
    deleteScheduleWithId, 
    updateScheduleWithId,
    getScheduleById,
    cleanupCompletedSchedules,
    getTeacherSubjects // Added new function
} = require('../controllers/scheduleController');

const router = express.Router();

// CRUD operations
router.post('/create', authMiddleware(['SCHOOL', 'TEACHER']), createSchedule);
router.get('/fetch-with-class/:id', authMiddleware(['SCHOOL', 'TEACHER']), getSchedulewithClass);
router.get('/fetch/:id', authMiddleware(['SCHOOL', 'TEACHER']), getScheduleById);
router.put('/update/:id', authMiddleware(['SCHOOL', 'TEACHER']), updateScheduleWithId); 
router.delete('/delete/:id', authMiddleware(['SCHOOL','TEACHER']), deleteScheduleWithId); 

// New endpoint to fetch subjects for a teacher
router.get('/teacher/subjects/:teacherId', authMiddleware(['SCHOOL']), getTeacherSubjects);

// Manual trigger for cleanup (admin only)
router.post('/cleanup', authMiddleware(['SCHOOL']), cleanupCompletedSchedules);

module.exports = router;