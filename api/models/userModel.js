const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, "Name is required"],
        trim: true,
        maxlength: [50, "Name cannot exceed 50 characters"]
    },
    email: { 
        type: String, 
        required: [true, "Email is required"], 
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            "Please enter a valid email address"
        ]
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters long"]
    },
    role: {
        type: String,
        enum: ["STUDENT", "TEACHER", "SCHOOL"],
        required: [true, "Role is required"],
        default: "STUDENT"
    },
    schoolId: {
        type: mongoose.Schema.ObjectId,
        ref: "School",
        required: [true, "School ID is required"]
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
}, {
    timestamps: true, // This will automatically handle createdAt and updatedAt
    toJSON: { 
        virtuals: true,
        transform: function(doc, ret) {
            // Remove password from JSON output for security
            delete ret.password;
            return ret;
        }
    },
    toObject: { virtuals: true }
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ schoolId: 1, role: 1 });
userSchema.index({ schoolId: 1, isActive: 1 });

// Middleware to update the updatedAt field before saving
userSchema.pre('save', function(next) {
    if (!this.isNew) {
        this.updatedAt = new Date();
    }
    next();
});

// Middleware to update the updatedAt field before updating
userSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function(next) {
    this.set({ updatedAt: new Date() });
    next();
});

module.exports = mongoose.model("User", userSchema);