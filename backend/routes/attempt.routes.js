const express = require('express');
const router = express.Router();
const {
    startExam,
    submitExam,
    getMyAttempts,
    getAttemptResult,
    getExamAttempts
} = require('../controller/attempt.controller.js');
const { verifyToken, isTeacher, isStudent } = require('../middleware/auth.middleware.js');

// student
router.post('/api/attempts/start/:examId', verifyToken, isStudent, startExam);
router.post('/api/attempts/:id/submit', verifyToken, isStudent, submitExam);
router.get('/api/attempts/my', verifyToken, isStudent, getMyAttempts);

// teacher (or admin): results of one exam
router.get('/api/attempts/exam/:examId', verifyToken, isTeacher, getExamAttempts);

// result of one attempt (permission is checked in the controller)
// keep this LAST, so "/my" is not treated as an :id
router.get('/api/attempts/:id', verifyToken, getAttemptResult);

module.exports = router;