const Exam = require('../model/exam.model.js');
const Question = require('../model/question.model.js');
const Attempt = require('../model/attempt.model.js');

// teacher can only change their own exams (admin can change all)
const canEdit = (exam, user) => {
    return user.role === 'admin' || exam.createdBy.toString() === user.id;
}

// finds the questions and adds up their marks
// returns null if any id is wrong, repeated, or not this teacher's question
const getTotalMarks = async (questionIds, user) => {
    const questions = await Question.find({ _id: { $in: questionIds } });

    if (questions.length !== questionIds.length) {
        return null;
    }

    let total = 0;
    for (const question of questions) {
        if (user.role !== 'admin' && question.createdBy.toString() !== user.id) {
            return null;
        }
        total = total + question.marks;
    }
    return total;
}

// Create exam (teacher)
const createExam = async (req, res, next) => {
    try {
        const { title, subject, duration, questions, passMarks } = req.body || {};

        if (!Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ success: false, message: 'Please select at least one question' });
        }

        // total marks is calculated on the server, not sent by the frontend
        const totalMarks = await getTotalMarks(questions, req.user);
        if (totalMarks === null) {
            return res.status(400).json({ success: false, message: 'Some questions are invalid, repeated or not yours' });
        }

        if (passMarks > totalMarks) {
            return res.status(400).json({ success: false, message: 'Pass marks cannot be more than total marks (' + totalMarks + ')' });
        }

        const exam = await Exam.create({
            title: title,
            subject: subject,
            duration: duration,
            questions: questions,
            totalMarks: totalMarks,
            passMarks: passMarks,
            createdBy: req.user.id
        });

        res.status(201).json({ success: true, exam: exam });
    } catch (error) {
        next(error);
    }
}

// Get exams - what you see depends on your role
// teacher: own exams, admin: all exams, student: only published exams
const getExams = async (req, res, next) => {
    try {
        const filter = {};
        if (req.user.role === 'teacher') {
            filter.createdBy = req.user.id;
        }
        if (req.user.role === 'student') {
            filter.isPublished = true;
        }
        if (req.query.subject) {
            filter.subject = req.query.subject;
        }

        const exams = await Exam.find(filter).populate('createdBy', 'name').sort('-createdAt');

        res.json({ success: true, count: exams.length, exams: exams });
    } catch (error) {
        next(error);
    }
}

// Get one exam
const getExamById = async (req, res, next) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (!exam) {
            return res.status(404).json({ success: false, message: 'Exam not found' });
        }

        // students: only published exams, and no questions here
        // (they get the questions when they start the exam)
        if (req.user.role === 'student') {
            if (!exam.isPublished) {
                return res.status(404).json({ success: false, message: 'Exam not found' });
            }
            return res.json({
                success: true,
                exam: {
                    _id: exam._id,
                    title: exam.title,
                    subject: exam.subject,
                    duration: exam.duration,
                    totalMarks: exam.totalMarks,
                    passMarks: exam.passMarks,
                    numberOfQuestions: exam.questions.length
                }
            });
        }

        if (!canEdit(exam, req.user)) {
            return res.status(403).json({ success: false, message: 'This is not your exam' });
        }

        // teacher/admin get the full questions (with answers)
        await exam.populate('questions');
        res.json({ success: true, exam: exam });
    } catch (error) {
        next(error);
    }
}

// Update exam (only if no student has attempted it yet)
const updateExam = async (req, res, next) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (!exam) {
            return res.status(404).json({ success: false, message: 'Exam not found' });
        }
        if (!canEdit(exam, req.user)) {
            return res.status(403).json({ success: false, message: 'This is not your exam' });
        }

        const attempted = await Attempt.findOne({ exam: exam._id });
        if (attempted) {
            return res.status(400).json({ success: false, message: 'Students have already attempted this exam, it cannot be changed' });
        }

        // only change the fields that were sent
        const { title, subject, duration, questions, passMarks } = req.body || {};
        if (title !== undefined) exam.title = title;
        if (subject !== undefined) exam.subject = subject;
        if (duration !== undefined) exam.duration = duration;
        if (passMarks !== undefined) exam.passMarks = passMarks;

        if (questions !== undefined) {
            if (!Array.isArray(questions) || questions.length === 0) {
                return res.status(400).json({ success: false, message: 'Please select at least one question' });
            }
            const totalMarks = await getTotalMarks(questions, req.user);
            if (totalMarks === null) {
                return res.status(400).json({ success: false, message: 'Some questions are invalid, repeated or not yours' });
            }
            exam.questions = questions;
            exam.totalMarks = totalMarks;
        }

        if (exam.passMarks > exam.totalMarks) {
            return res.status(400).json({ success: false, message: 'Pass marks cannot be more than total marks (' + exam.totalMarks + ')' });
        }

        await exam.save();
        res.json({ success: true, message: 'Exam updated', exam: exam });
    } catch (error) {
        next(error);
    }
}

// Publish or unpublish exam
// body: { "isPublished": true }
const publishExam = async (req, res, next) => {
    try {
        const { isPublished } = req.body || {};
        if (typeof isPublished !== 'boolean') {
            return res.status(400).json({ success: false, message: 'isPublished must be true or false' });
        }

        const exam = await Exam.findById(req.params.id);
        if (!exam) {
            return res.status(404).json({ success: false, message: 'Exam not found' });
        }
        if (!canEdit(exam, req.user)) {
            return res.status(403).json({ success: false, message: 'This is not your exam' });
        }

        exam.isPublished = isPublished;
        await exam.save();

        res.json({
            success: true,
            message: isPublished ? 'Exam published' : 'Exam unpublished',
            exam: exam
        });
    } catch (error) {
        next(error);
    }
}

// Delete exam (only if no student has attempted it yet)
const deleteExam = async (req, res, next) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (!exam) {
            return res.status(404).json({ success: false, message: 'Exam not found' });
        }
        if (!canEdit(exam, req.user)) {
            return res.status(403).json({ success: false, message: 'This is not your exam' });
        }

        const attempted = await Attempt.findOne({ exam: exam._id });
        if (attempted) {
            return res.status(400).json({ success: false, message: 'Students have already attempted this exam, it cannot be deleted' });
        }

        await exam.deleteOne();
        res.json({ success: true, message: 'Exam deleted' });
    } catch (error) {
        next(error);
    }
}

module.exports = { createExam, getExams, getExamById, updateExam, publishExam, deleteExam };