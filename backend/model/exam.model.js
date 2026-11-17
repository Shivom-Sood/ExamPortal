const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const examSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Exam title is required'],
        trim: true
    },
    subject: {
        type: String,
        required: [true, 'Subject is required'],
        trim: true
    },
    // time allowed in minutes
    duration: {
        type: Number,
        required: [true, 'Duration is required'],
        min: [1, 'Duration must be at least 1 minute']
    },
    // relationship: list of questions in this exam
    questions: [{
        type: Schema.Types.ObjectId,
        ref: 'Question'
    }],
    // calculated in the controller from the questions' marks
    totalMarks: {
        type: Number,
        default: 0
    },
    passMarks: {
        type: Number,
        required: [true, 'Pass marks are required'],
        min: [0, 'Pass marks cannot be negative']
    },
    // students only see the exam after the teacher publishes it
    isPublished: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Exam', examSchema);