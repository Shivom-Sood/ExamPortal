const Attempt = require('../model/attempt.model.js');
const Exam = require('../model/exam.model.js');
const Question = require('../model/question.model.js');
const User = require('../model/user.model.js');

// rounds a number to 2 decimal places
const round2 = (num) => {
    return Math.round(num * 100) / 100;
}

// Report for one exam (teacher of that exam / admin)
const getExamReport = async (req, res, next) => {
    try {
        const exam = await Exam.findById(req.params.examId);
        if (!exam) {
            return res.status(404).json({ success: false, message: 'Exam not found' });
        }

        if (req.user.role !== 'admin' && exam.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'This is not your exam' });
        }

        // aggregation: class performance for this exam
        const stats = await Attempt.aggregate([
            { $match: { exam: exam._id, status: 'submitted' } },
            {
                $group: {
                    _id: '$exam',
                    totalAttempts: { $sum: 1 },
                    averageScore: { $avg: '$score' },
                    highestScore: { $max: '$score' },
                    lowestScore: { $min: '$score' },
                    // add 1 if passed is true, else add 0
                    passedCount: { $sum: { $cond: ['$passed', 1, 0] } }
                }
            },
            { $project: { _id: 0 } }
        ]);

        // if nobody has submitted yet, show zeros
        let summary = {
            totalAttempts: 0,
            averageScore: 0,
            highestScore: 0,
            lowestScore: 0,
            passedCount: 0,
            passPercentage: 0
        };

        if (stats.length > 0) {
            summary = stats[0];
            summary.averageScore = round2(summary.averageScore);
            summary.passPercentage = round2((summary.passedCount / summary.totalAttempts) * 100);
        }

        // how many students got each question right
        const attempts = await Attempt.find({ exam: exam._id, status: 'submitted' }).select('answers');
        const questions = await Question.find({ _id: { $in: exam.questions } }).select('text correctOption');

        const questionStats = [];
        for (const question of questions) {
            let correct = 0;
            for (const attempt of attempts) {
                const answer = attempt.answers.find((a) => a.question.toString() === question._id.toString());
                if (answer && answer.selectedOption === question.correctOption) {
                    correct = correct + 1;
                }
            }

            let correctPercentage = 0;
            if (attempts.length > 0) {
                correctPercentage = round2((correct / attempts.length) * 100);
            }

            questionStats.push({
                _id: question._id,
                text: question.text,
                correctCount: correct,
                correctPercentage: correctPercentage
            });
        }

        // hardest question first
        questionStats.sort((a, b) => a.correctPercentage - b.correctPercentage);

        res.json({
            success: true,
            exam: {
                _id: exam._id,
                title: exam.title,
                subject: exam.subject,
                totalMarks: exam.totalMarks,
                passMarks: exam.passMarks
            },
            summary: summary,
            questionStats: questionStats
        });
    } catch (error) {
        next(error);
    }
}

// Overview of the whole portal (admin)
const getOverview = async (req, res, next) => {
    try {
        // aggregation: how many users in each role
        const usersByRole = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        const totalQuestions = await Question.countDocuments();
        const totalExams = await Exam.countDocuments();
        const publishedExams = await Exam.countDocuments({ isPublished: true });

        // aggregation: summary of every exam that has submitted attempts
        const examStats = await Attempt.aggregate([
            { $match: { status: 'submitted' } },
            {
                $group: {
                    _id: '$exam',
                    totalAttempts: { $sum: 1 },
                    averageScore: { $avg: '$score' },
                    passedCount: { $sum: { $cond: ['$passed', 1, 0] } }
                }
            },
            { $sort: { totalAttempts: -1 } }
        ]);

        // add exam title to each row
        const examIds = [];
        for (const row of examStats) {
            examIds.push(row._id);
        }
        const exams = await Exam.find({ _id: { $in: examIds } }).select('title subject totalMarks');

        const examSummary = [];
        for (const row of examStats) {
            const exam = exams.find((e) => e._id.toString() === row._id.toString());
            if (!exam) {
                continue;
            }
            examSummary.push({
                examId: row._id,
                title: exam.title,
                subject: exam.subject,
                totalMarks: exam.totalMarks,
                totalAttempts: row.totalAttempts,
                averageScore: round2(row.averageScore),
                passPercentage: round2((row.passedCount / row.totalAttempts) * 100)
            });
        }

        res.json({
            success: true,
            usersByRole: usersByRole,
            totalQuestions: totalQuestions,
            totalExams: totalExams,
            publishedExams: publishedExams,
            examSummary: examSummary
        });
    } catch (error) {
        next(error);
    }
}

module.exports = { getExamReport, getOverview };