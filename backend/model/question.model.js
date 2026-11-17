const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const questionSchema = new Schema({
    text: {
        type: String,
        required: [true, 'Question text is required'],
        trim: true
    },
    options: {
        type: [String],
        validate: {
            validator: function (arr) {
                return arr.length === 4;
            },
            message: 'A question must have exactly 4 options'
        }
    },
    // index of the right option: 0, 1, 2 or 3
    correctOption: {
        type: Number,
        required: [true, 'Correct option is required'],
        min: [0, 'Correct option must be between 0 and 3'],
        max: [3, 'Correct option must be between 0 and 3']
    },
    marks: {
        type: Number,
        default: 1,
        min: [1, 'Marks must be at least 1']
    },
    subject: {
        type: String,
        required: [true, 'Subject is required'],
        trim: true
    },
    // relationship: which teacher made this question
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

// index to make "filter by subject" faster in the question bank
questionSchema.index({ subject: 1 });

module.exports = mongoose.model('Question', questionSchema);