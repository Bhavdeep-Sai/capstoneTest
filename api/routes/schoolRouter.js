const express = require('express');
const { registerSchool, getAllSchools, loginSchool, updateSchool, getSchoolOwnData } = require('../controllers/schoolController');
const authMiddleware = require('../auth/auth');
const router = express.Router();

router.post('/register', authMiddleware(['SCHOOL']), registerSchool);
router.get('/all', getAllSchools);
router.post('/login', loginSchool);
router.put('/update', authMiddleware(['SCHOOL']), updateSchool); // Changed from 'School' to 'SCHOOL'
router.get('/fetch-single', authMiddleware(['SCHOOL']), getSchoolOwnData); // Changed from 'School' to 'SCHOOL'

module.exports = router;