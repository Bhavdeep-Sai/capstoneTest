const mongoose = require("mongoose");

const examinationSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true
  },
  examDate: {
    type: Date,
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true
  },
  examType: {
    type: String,
    required: true,
    enum: [
      // School-only exam types (main/big exams)
      'Mid Term', 'Final Term', 'Annual Exam','Unit Test','Semester Exam',
      // Teacher-allowed exam types (small tests/quizzes)
      'Quiz', 'Class Test','Weekly Test', 'Slip Test'
    ]
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true
  },
  startTime: {
    type: String, // Store as string in HH:MM format
    required: true,
    validate: {
      validator: function(v) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'Start time must be in HH:MM format'
    }
  },
  endTime: {
    type: String, // Store as string in HH:MM format
    required: true,
    validate: {
      validator: function(v) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'End time must be in HH:MM format'
    }
  },
  duration: {
    type: Number, // Store duration in minutes
    required: true,
    min: [1, 'Duration must be at least 1 minute']
  },
  // Field to track who created the exam
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'createdByModel'
  },
  createdByModel: {
    type: String,
    required: true,
    enum: ['School', 'Teacher']
  },
  // Field to track creator's role for easier filtering
  creatorRole: {
    type: String,
    required: true,
    enum: ['SCHOOL', 'TEACHER']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
examinationSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

// Pre-save validation to ensure end time is after start time
examinationSchema.pre("save", function(next) {
  const startTime = new Date(`1970-01-01T${this.startTime}`);
  const endTime = new Date(`1970-01-01T${this.endTime}`);
  
  if (endTime <= startTime) {
    const error = new Error('End time must be after start time');
    error.name = 'ValidationError';
    return next(error);
  }
  next();
});

// Index for better query performance
examinationSchema.index({ school: 1, class: 1 });
examinationSchema.index({ createdBy: 1, creatorRole: 1 });
examinationSchema.index({ examDate: 1 });
examinationSchema.index({ school: 1, examDate: 1 });

module.exports = mongoose.model("Examination", examinationSchema);