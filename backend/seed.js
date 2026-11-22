require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./model/user.model.js');
const Question = require('./model/question.model.js');
const Exam = require('./model/exam.model.js');
const Attempt = require('./model/attempt.model.js');

// same password for every demo account
const PASSWORD = '123456';

const users = [
    { key: 'admin', name: 'Admin', email: 'admin@examportal.com', role: 'admin' },
    { key: 'priya', name: 'Priya Sharma', email: 'priya@examportal.com', role: 'teacher' },
    { key: 'rahul', name: 'Rahul Verma', email: 'rahul@examportal.com', role: 'teacher' },
    { key: 'aman', name: 'Aman Gupta', email: 'aman@examportal.com', role: 'student' },
    { key: 'neha', name: 'Neha Singh', email: 'neha@examportal.com', role: 'student' },
    { key: 'rohan', name: 'Rohan Mehta', email: 'rohan@examportal.com', role: 'student' },
    { key: 'simran', name: 'Simran Kaur', email: 'simran@examportal.com', role: 'student' }
];

// teacher = who created the question
const questions = [
    // JavaScript (Priya) -> index 0 to 5
    { teacher: 'priya', subject: 'JavaScript', marks: 1, correctOption: 2, text: 'Which keyword declares a variable that cannot be reassigned?', options: ['var', 'let', 'const', 'static'] },
    { teacher: 'priya', subject: 'JavaScript', marks: 2, correctOption: 1, text: 'What does typeof null return?', options: ['null', 'object', 'undefined', 'number'] },
    { teacher: 'priya', subject: 'JavaScript', marks: 1, correctOption: 0, text: 'Which method adds an element to the end of an array?', options: ['push()', 'pop()', 'shift()', 'unshift()'] },
    { teacher: 'priya', subject: 'JavaScript', marks: 1, correctOption: 1, text: "What is the result of 2 + '2' in JavaScript?", options: ['4', '22', 'NaN', 'Error'] },
    { teacher: 'priya', subject: 'JavaScript', marks: 1, correctOption: 2, text: 'Which operator checks both value and type?', options: ['==', '=', '===', '!='] },
    { teacher: 'priya', subject: 'JavaScript', marks: 2, correctOption: 0, text: 'Which function converts JSON text into a JavaScript object?', options: ['JSON.parse()', 'JSON.stringify()', 'JSON.object()', 'JSON.convert()'] },

    // Node.js (Priya) -> index 6 to 9
    { teacher: 'priya', subject: 'Node.js', marks: 1, correctOption: 1, text: 'Which core module is used to work with files?', options: ['http', 'fs', 'path', 'os'] },
    { teacher: 'priya', subject: 'Node.js', marks: 1, correctOption: 1, text: 'Which command creates a package.json file?', options: ['npm start', 'npm init', 'npm install', 'node init'] },
    { teacher: 'priya', subject: 'Node.js', marks: 1, correctOption: 1, text: 'In Express, which method handles a POST request?', options: ['app.get()', 'app.post()', 'app.put()', 'app.use()'] },
    { teacher: 'priya', subject: 'Node.js', marks: 2, correctOption: 2, text: 'In Express, where is the data sent in the request body?', options: ['req.params', 'req.query', 'req.body', 'res.body'] },

    // MongoDB (Rahul) -> index 10 to 15
    { teacher: 'rahul', subject: 'MongoDB', marks: 1, correctOption: 1, text: 'MongoDB stores data in the form of?', options: ['Tables', 'Documents', 'Rows', 'Sheets'] },
    { teacher: 'rahul', subject: 'MongoDB', marks: 1, correctOption: 1, text: 'Which method inserts many documents at once?', options: ['insertOne()', 'insertMany()', 'addMany()', 'createAll()'] },
    { teacher: 'rahul', subject: 'MongoDB', marks: 1, correctOption: 1, text: 'Which operator means "greater than"?', options: ['$lt', '$gt', '$eq', '$in'] },
    { teacher: 'rahul', subject: 'MongoDB', marks: 2, correctOption: 2, text: 'Which aggregation stage groups documents together?', options: ['$match', '$sort', '$group', '$project'] },
    { teacher: 'rahul', subject: 'MongoDB', marks: 1, correctOption: 1, text: 'What is the default primary key field in MongoDB?', options: ['id', '_id', 'key', 'primary'] },
    { teacher: 'rahul', subject: 'MongoDB', marks: 1, correctOption: 1, text: 'Which Mongoose method finds a document by its id?', options: ['findOne()', 'findById()', 'getById()', 'searchId()'] }
];

// questions = index numbers from the list above
const exams = [
    { teacher: 'priya', title: 'JavaScript Basics Test', subject: 'JavaScript', duration: 10, passMarks: 4, isPublished: true, questions: [0, 1, 2, 3, 4, 5] },
    { teacher: 'priya', title: 'Node.js and Express Quiz', subject: 'Node.js', duration: 5, passMarks: 3, isPublished: true, questions: [6, 7, 8, 9] },
    { teacher: 'rahul', title: 'MongoDB Fundamentals', subject: 'MongoDB', duration: 10, passMarks: 4, isPublished: true, questions: [10, 11, 12, 13, 14, 15] },
    { teacher: 'priya', title: 'Full Stack Mock Test', subject: 'Full Stack', duration: 15, passMarks: 3, isPublished: false, questions: [0, 2, 6, 8, 9] }
];

// exam = index from the exams list, right = how many questions the student got right
const attempts = [
    { student: 'aman', exam: 0, right: 6 },
    { student: 'neha', exam: 0, right: 4 },
    { student: 'rohan', exam: 0, right: 2 },
    { student: 'simran', exam: 0, right: 5 },
    { student: 'aman', exam: 2, right: 5 },
    { student: 'neha', exam: 2, right: 3 },
    { student: 'rohan', exam: 2, right: 6 },
    { student: 'simran', exam: 1, right: 2 }
];

// mixes up the list (same idea as in attempt.controller.js)
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

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to: ' + mongoose.connection.host + ' / ' + mongoose.connection.name);

        // 1. delete old data
        await Attempt.deleteMany({});
        await Exam.deleteMany({});
        await Question.deleteMany({});
        await User.deleteMany({});
        console.log('Old data deleted');

        // 2. users
        const hashedPassword = await bcrypt.hash(PASSWORD, 10);
        const userIds = {};
        for (const u of users) {
            const user = await User.create({
                name: u.name,
                email: u.email,
                password: hashedPassword,
                role: u.role
            });
            userIds[u.key] = user._id;
        }
        console.log(users.length + ' users created');

        // 3. questions
        const savedQuestions = [];
        for (const q of questions) {
            const question = await Question.create({
                text: q.text,
                options: q.options,
                correctOption: q.correctOption,
                marks: q.marks,
                subject: q.subject,
                createdBy: userIds[q.teacher]
            });
            savedQuestions.push(question);
        }
        console.log(savedQuestions.length + ' questions created');

        // 4. exams (total marks = sum of question marks)
        const savedExams = [];
        for (const e of exams) {
            const examQuestions = [];
            let totalMarks = 0;
            for (const index of e.questions) {
                examQuestions.push(savedQuestions[index]);
                totalMarks = totalMarks + savedQuestions[index].marks;
            }

            const exam = await Exam.create({
                title: e.title,
                subject: e.subject,
                duration: e.duration,
                questions: examQuestions.map((q) => q._id),
                totalMarks: totalMarks,
                passMarks: e.passMarks,
                isPublished: e.isPublished,
                createdBy: userIds[e.teacher]
            });
            savedExams.push({ exam: exam, questions: examQuestions });
        }
        console.log(savedExams.length + ' exams created');

        // 5. submitted attempts (first "right" questions correct, the rest wrong)
        let hoursAgo = attempts.length;
        for (const a of attempts) {
            const exam = savedExams[a.exam].exam;
            const order = shuffle(savedExams[a.exam].questions);

            let score = 0;
            const answers = [];
            for (let i = 0; i < order.length; i++) {
                const question = order[i];
                let selected = (question.correctOption + 1) % 4; // a wrong option
                if (i < a.right) {
                    selected = question.correctOption;
                    score = score + question.marks;
                }
                answers.push({ question: question._id, selectedOption: selected });
            }

            const startedAt = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
            const submittedAt = new Date(startedAt.getTime() + 4 * 60 * 1000);
            hoursAgo = hoursAgo - 1;

            await Attempt.create({
                exam: exam._id,
                student: userIds[a.student],
                questionOrder: order.map((q) => q._id),
                answers: answers,
                score: score,
                totalMarks: exam.totalMarks,
                passed: score >= exam.passMarks,
                status: 'submitted',
                startedAt: startedAt,
                submittedAt: submittedAt
            });
        }
        console.log(attempts.length + ' attempts created');

        console.log('\nSeed done! Login with any of these (password: ' + PASSWORD + ')');
        for (const u of users) {
            console.log('  ' + u.role.padEnd(8) + u.email);
        }

        await mongoose.disconnect();
    } catch (error) {
        console.log('Seed failed: ' + error.message);
        process.exit(1);
    }
}

seed();