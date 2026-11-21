const Question = require('../model/question.model.js');
const Exam = require('../model/exam.model.js');

// teacher can only change their own questions (admin can change all)
const canEdit = (question, user) => {
    return user.role === 'admin' || question.createdBy.toString() === user.id;
}

// Create question (teacher)
const addQuestion = async (req, res, next) => {
    try {
        const { text, options, correctOption, marks, subject } = req.body || {};

        const question = await Question.create({
            text: text,
            options: options,
            correctOption: correctOption,
            marks: marks,
            subject: subject,
            createdBy: req.user.id   // logged in teacher
        });

        res.status(201).json({ success: true, question: question });
    } catch (error) {
        next(error);
    }
}

// Get questions with filter, search and pagination
// example: /api/questions?subject=JavaScript&search=array&page=1&limit=10
const getQuestions = async (req, res, next) => {
    try {
        const { subject, search } = req.query;

        const filter = {};
        // teachers see only their own questions, admin sees all
        if (req.user.role === 'teacher') {
            filter.createdBy = req.user.id;
        }
        if (subject) {
            filter.subject = subject;
        }
        if (search) {
            filter.text = { $regex: search, $options: 'i' };
        }

        // pagination
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const total = await Question.countDocuments(filter);
        const questions = await Question.find(filter).sort('-createdAt').skip(skip).limit(limit);

        res.json({
            success: true,
            total: total,
            page: page,
            totalPages: Math.ceil(total / limit),
            count: questions.length,
            questions: questions
        });
    } catch (error) {
        next(error);
    }
}

// Get one question
const getQuestionById = async (req, res, next) => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }
        if (!canEdit(question, req.user)) {
            return res.status(403).json({ success: false, message: 'This is not your question' });
        }
        res.json({ success: true, question: question });
    } catch (error) {
        next(error);
    }
}

// Update question
const updateQuestion = async (req, res, next) => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }
        if (!canEdit(question, req.user)) {
            return res.status(403).json({ success: false, message: 'This is not your question' });
        }

        // only change the fields that were sent
        const { text, options, correctOption, marks, subject } = req.body || {};
        if (text !== undefined) question.text = text;
        if (options !== undefined) question.options = options;
        if (correctOption !== undefined) question.correctOption = correctOption;
        if (marks !== undefined) question.marks = marks;
        if (subject !== undefined) question.subject = subject;

        await question.save(); // runs the schema validation again

        res.json({ success: true, message: 'Question updated', question: question });
    } catch (error) {
        next(error);
    }
}

// Delete question
const deleteQuestion = async (req, res, next) => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }
        if (!canEdit(question, req.user)) {
            return res.status(403).json({ success: false, message: 'This is not your question' });
        }

        // don't delete a question that is being used in an exam
        const exam = await Exam.findOne({ questions: question._id });
        if (exam) {
            return res.status(400).json({ success: false, message: 'This question is used in the exam "' + exam.title + '". Remove it from the exam first' });
        }

        await question.deleteOne();
        res.json({ success: true, message: 'Question deleted' });
    } catch (error) {
        next(error);
    }
}

module.exports = { addQuestion, getQuestions, getQuestionById, updateQuestion, deleteQuestion };
