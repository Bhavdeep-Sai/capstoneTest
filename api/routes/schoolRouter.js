const express = require('express');
const { registerSchool, getAllSchools, loginSchool, updateSchool, getSchoolOwnData } = require('../controllers/schoolController');
const authMiddleware = require('../auth/auth');
const router = express.Router();

router.post('/register', registerSchool);
router.get('/all', getAllSchools);
router.post('/login', loginSchool);
router.put('/update', authMiddleware(['SCHOOL']), updateSchool);
router.get('/fetch-single', authMiddleware(['SCHOOL']), getSchoolOwnData);

module.exports = router;