
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cron = require('node-cron');
const path = require('path');
const Schedule = require('./models/scheduleModel');

// Routes IMPORT
const schoolRouter = require('./routes/schoolRouter');
const classRouter = require('./routes/classRouter');
const subjectRouter = require('./routes/subjectRouter');
const studentRouter = require('./routes/studentRouter');
const teacherRouter = require('./routes/teacherRouter');
const scheduleRouter = require('./routes/scheduleRouter');
const attendanceRouter = require('./routes/attendanceRouter');
const examinationRouter = require('./routes/examinationRouter');
const noticeRouter = require('./routes/noticeRouter');

// Middleware
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const corsOptions = { exposedHeaders: "Authorization" };
app.use(cors(corsOptions));
app.use(cookieParser()); // To accept cookies

// Serve static files from uploads directory
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads directories if they don't exist
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
const schoolDir = path.join(uploadsDir, 'school');
const studentDir = path.join(uploadsDir, 'student');
const teacherDir = path.join(uploadsDir, 'teacher');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(schoolDir)) {
    fs.mkdirSync(schoolDir, { recursive: true });
}
if (!fs.existsSync(studentDir)) {
    fs.mkdirSync(studentDir, { recursive: true });
}
if (!fs.existsSync(teacherDir)) {
    fs.mkdirSync(teacherDir, { recursive: true });
}

// Mongodb Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");
        // Setup cleanup job after successful database connection
        setupScheduleCleanupJob();
    })
    .catch((err) => {
        console.log("Connection error", err);
    });

// Setup cron job for automatic schedule cleanup
function setupScheduleCleanupJob() {
    // Run cleanup job at midnight every day
    cron.schedule('0 0 * * *', async () => {
        try {
            console.log('Running schedule cleanup job...');
            const now = new Date();

            // Mark completed schedules
            const updateResult = await Schedule.updateMany(
                {
                    status: 'active',
                    endTime: { $lt: now }
                },
                {
                    $set: { status: 'completed' }
                }
            );

            console.log(`Marked ${updateResult.modifiedCount} schedules as completed`);

            // Delete old completed schedules (older than 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const deleteResult = await Schedule.deleteMany({
                status: 'completed',
                endTime: { $lt: thirtyDaysAgo }
            });

            console.log(`Deleted ${deleteResult.deletedCount} old completed schedules`);
        } catch (error) {
            console.error('Error in schedule cleanup job:', error);
        }
    }, {
        scheduled: true,
        timezone: "UTC" // Set appropriate timezone
    });
}

// Routes
app.use('/api/school', schoolRouter);
app.use('/api/class', classRouter);
app.use('/api/subject', subjectRouter);
app.use('/api/student', studentRouter);
app.use('/api/teacher', teacherRouter);
app.use('/api/schedule', scheduleRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/examination', examinationRouter);
app.use('/api/notice', noticeRouter);

// To start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Uploads directory: ${uploadsDir}`);
});