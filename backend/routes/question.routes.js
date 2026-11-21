const express = require('express');
const router = express.Router();
const {
    addQuestion,
    getQuestions,
    getQuestionById,
    updateQuestion,
    deleteQuestion
} = require('../controller/question.controller.js');
const { verifyToken, isTeacher } = require('../middleware/auth.middleware.js');

// all question routes: logged in + teacher (or admin)
router.post('/api/questions', verifyToken, isTeacher, addQuestion);
router.get('/api/questions', verifyToken, isTeacher, getQuestions);
router.get('/api/questions/:id', verifyToken, isTeacher, getQuestionById);
router.put('/api/questions/:id', verifyToken, isTeacher, updateQuestion);
router.delete('/api/questions/:id', verifyToken, isTeacher, deleteQuestion);

module.exports = router;