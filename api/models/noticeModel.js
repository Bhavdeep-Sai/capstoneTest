const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema({
    school: {
        type: mongoose.Schema.ObjectId,
        ref: "School",
        required: true
    },
    title: {
        type: String,
        required: [true, "Please provide a notice title"],
        trim: true,
        maxlength: [100, "Title cannot exceed 100 characters"]
    },
    message: {
        type: String,
        required: [true, "Please provide a message content"],
    },
    audience: {
        type: String,
        enum: ['Student', 'Teacher', 'All'],
        required: true,
        default: 'Student'
    },
    isImportant: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    expiryDate: {
        type: Date,
        default: function () {
            // Default to 30 days from creation
            const date = new Date();
            date.setDate(date.getDate() + 30);
            return date;
        }
    }
});

// Middleware to update the updatedAt field before saving
noticeSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Middleware to update the updatedAt field before updating
noticeSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function(next) {
    this.set({ updatedAt: new Date() });
    next();
});

module.exports = mongoose.model("Notice", noticeSchema);