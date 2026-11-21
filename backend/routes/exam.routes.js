const express = require('express');
const router = express.Router();
const {
    createExam,
    getExams,
    getExamById,
    updateExam,
    publishExam,
    deleteExam
} = require('../controller/exam.controller.js');
const { verifyToken, isTeacher } = require('../middleware/auth.middleware.js');

// any logged in user (controller shows different exams for each role)
router.get('/api/exams', verifyToken, getExams);
router.get('/api/exams/:id', verifyToken, getExamById);

// teacher (or admin) only
router.post('/api/exams', verifyToken, isTeacher, createExam);
router.put('/api/exams/:id', verifyToken, isTeacher, updateExam);
router.patch('/api/exams/:id/publish', verifyToken, isTeacher, publishExam);
router.delete('/api/exams/:id', verifyToken, isTeacher, deleteExam);

module.exports = router;