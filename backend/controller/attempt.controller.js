const Attempt = require('../model/attempt.model.js');
const Exam = require('../model/exam.model.js');
const Question = require('../model/question.model.js');

// 30 seconds extra after the timer ends (for slow internet)
const GRACE_TIME = 30 * 1000;

// mixes up the list so every student gets a different question order
const shuffle = (list) => {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = copy[i];
        copy[i] = copy[j];
        copy[j] = temp;
    }
    return copy;
}

// puts the questions back in the order saved in the attempt
const sortByOrder = (questions, order) => {
    const sorted = [];
    for (const id of order) {
        const found = questions.find((question) => question._id.toString() === id.toString());
        if (found) {
            sorted.push(found);
        }
    }
    return sorted;
}

// the time when the exam ends for this attempt
const getEndTime = (attempt, exam) => {
    return new Date(attempt.startedAt.getTime() + exam.duration * 60 * 1000);
}

// Start exam (student)
const startExam = async (req, res, next) => {
    try {
        const exam = await Exam.findById(req.params.examId);
        if (!exam || !exam.isPublished) {
            return res.status(404).json({ success: false, message: 'Exam not found' });
        }

        let attempt = await Attempt.findOne({ exam: exam._id, student: req.user.id });

        if (attempt && attempt.status === 'submitted') {
            return res.status(400).json({ success: false, message: 'You have already attempted this exam' });
        }

        // first time: create the attempt with a shuffled question order
        // (if it already exists, the student refreshed the page, so we continue the same attempt)
        if (!attempt) {
            attempt = await Attempt.create({
                exam: exam._id,
                student: req.user.id,
                questionOrder: shuffle(exam.questions),
                totalMarks: exam.totalMarks
            });
        }

        // send the questions WITHOUT the correct answer
        const questions = await Question.find({ _id: { $in: attempt.questionOrder } }).select('text options marks');

        res.json({
            success: true,
            attemptId: attempt._id,
            exam: {
                title: exam.title,
                subject: exam.subject,
                duration: exam.duration,
                totalMarks: exam.totalMarks
            },
            startedAt: attempt.startedAt,
            endsAt: getEndTime(attempt, exam),
            questions: sortByOrder(questions, attempt.questionOrder)
        });
    } catch (error) {
        next(error);
    }
}

// Submit exam (student) - marks are calculated here on the server
const submitExam = async (req, res, next) => {
    try {
        const attempt = await Attempt.findById(req.params.id);
        if (!attempt || attempt.student.toString() !== req.user.id) {
            return res.status(404).json({ success: false, message: 'Attempt not found' });
        }

        if (attempt.status === 'submitted') {
            return res.status(400).json({ success: false, message: 'This exam is already submitted' });
        }

        const exam = await Exam.findById(attempt.exam);

        // answers from the frontend: [{ question: 'id', selectedOption: 0-3 }]
        let sentAnswers = [];
        if (req.body && Array.isArray(req.body.answers)) {
            sentAnswers = req.body.answers;
        }

        // if the time (+ 30 sec) is over, the answers are not accepted
        const lastTime = getEndTime(attempt, exam).getTime() + GRACE_TIME;
        const isLate = Date.now() > lastTime;

        const questions = await Question.find({ _id: { $in: attempt.questionOrder } });
        const orderedQuestions = sortByOrder(questions, attempt.questionOrder);

        let score = 0;
        const answers = [];

        for (const question of orderedQuestions) {
            let selected = null;

            if (!isLate) {
                const sent = sentAnswers.find((answer) => answer && answer.question === question._id.toString());
                if (sent && Number.isInteger(sent.selectedOption) && sent.selectedOption >= 0 && sent.selectedOption <= 3) {
                    selected = sent.selectedOption;
                }
            }

            if (selected === question.correctOption) {
                score = score + question.marks;
            }

            answers.push({ question: question._id, selectedOption: selected });
        }

        attempt.answers = answers;
        attempt.score = score;
        attempt.totalMarks = exam.totalMarks;
        attempt.passed = score >= exam.passMarks;
        attempt.status = 'submitted';
        attempt.submittedAt = new Date();
        await attempt.save();

        let message = 'Exam submitted successfully';
        if (isLate) {
            message = 'Time was over, so your answers were not accepted';
        }

        res.json({
            success: true,
            message: message,
            result: {
                attemptId: attempt._id,
                score: attempt.score,
                totalMarks: attempt.totalMarks,
                passed: attempt.passed
            }
        });
    } catch (error) {
        next(error);
    }
}

// My attempts history (student)
const getMyAttempts = async (req, res, next) => {
    try {
        const attempts = await Attempt.find({ student: req.user.id })
            .populate('exam', 'title subject')
            .select('-answers -questionOrder')
            .sort('-createdAt');

        res.json({ success: true, count: attempts.length, attempts: attempts });
    } catch (error) {
        next(error);
    }
}

// Detailed result of one attempt
// student: only their own | teacher: only for their exam | admin: all
const getAttemptResult = async (req, res, next) => {
    try {
        const attempt = await Attempt.findById(req.params.id)
            .populate('exam', 'title subject passMarks createdBy')
            .populate('student', 'name email');

        if (!attempt) {
            return res.status(404).json({ success: false, message: 'Attempt not found' });
        }

        const isOwner = attempt.student && attempt.student._id.toString() === req.user.id;
        const isExamTeacher = attempt.exam.createdBy.toString() === req.user.id;

        if (!isOwner && !isExamTeacher && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'You cannot see this result' });
        }

        if (attempt.status !== 'submitted') {
            return res.status(400).json({ success: false, message: 'This exam is not submitted yet' });
        }

        const questions = await Question.find({ _id: { $in: attempt.questionOrder } });
        const orderedQuestions = sortByOrder(questions, attempt.questionOrder);

        // each question with the student's answer and the correct answer
        const details = [];
        for (const question of orderedQuestions) {
            const answer = attempt.answers.find((a) => a.question.toString() === question._id.toString());
            let selected = null;
            if (answer) {
                selected = answer.selectedOption;
            }

            details.push({
                _id: question._id,
                text: question.text,
                options: question.options,
                marks: question.marks,
                correctOption: question.correctOption,
                selectedOption: selected,
                isCorrect: selected === question.correctOption
            });
        }

        res.json({
            success: true,
            result: {
                attemptId: attempt._id,
                exam: attempt.exam,
                student: attempt.student,
                score: attempt.score,
                totalMarks: attempt.totalMarks,
                passed: attempt.passed,
                startedAt: attempt.startedAt,
                submittedAt: attempt.submittedAt,
                questions: details
            }
        });
    } catch (error) {
        next(error);
    }
}

// All attempts of one exam (teacher of that exam / admin)
const getExamAttempts = async (req, res, next) => {
    try {
        const exam = await Exam.findById(req.params.examId);
        if (!exam) {
            return res.status(404).json({ success: false, message: 'Exam not found' });
        }

        if (req.user.role !== 'admin' && exam.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'This is not your exam' });
        }

        const attempts = await Attempt.find({ exam: exam._id })
            .populate('student', 'name email')
            .select('-answers -questionOrder')
            .sort('-score');

        res.json({
            success: true,
            exam: {
                _id: exam._id,
                title: exam.title,
                totalMarks: exam.totalMarks,
                passMarks: exam.passMarks
            },
            count: attempts.length,
            attempts: attempts
        });
    } catch (error) {
        next(error);
    }
}

module.exports = { startExam, submitExam, getMyAttempts, getAttemptResult, getExamAttempts };