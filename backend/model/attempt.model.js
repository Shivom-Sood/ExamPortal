const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const attemptSchema = new Schema({
    exam: {
        type: Schema.Types.ObjectId,
        ref: 'Exam',
        required: true
    },
    student: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // shuffled order of questions for this student
    questionOrder: [{
        type: Schema.Types.ObjectId,
        ref: 'Question'
    }],
    // embedded: each answer lives inside the attempt
    answers: [{
        question: { type: Schema.Types.ObjectId, ref: 'Question' },
        selectedOption: { type: Number, default: null },
        _id: false
    }],
    score: {
        type: Number,
        default: 0
    },
    totalMarks: {
        type: Number,
        default: 0
    },
    passed: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['in-progress', 'submitted'],
        default: 'in-progress'
    },
    startedAt: {
        type: Date,
        default: Date.now
    },
    submittedAt: {
        type: Date
    }
}, { timestamps: true });

// one attempt per student per exam
attemptSchema.index({ exam: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Attempt', attemptSchema);