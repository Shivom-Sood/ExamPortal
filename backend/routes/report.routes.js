const express = require('express');
const router = express.Router();
const { getExamReport, getOverview } = require('../controller/report.controller.js');
const { verifyToken, isAdmin, isTeacher } = require('../middleware/auth.middleware.js');

// admin: whole portal
router.get('/api/reports/overview', verifyToken, isAdmin, getOverview);

// teacher (own exam) or admin: one exam
router.get('/api/reports/exam/:examId', verifyToken, isTeacher, getExamReport);

module.exports = router;