require("dotenv").config();
const formidable = require("formidable");
const Student = require("../models/studentModel");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = {
registerStudent: async (req, res) => {
  try {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res
          .status(400)
          .json({ success: false, message: "Form parsing error" });
      }

      if (!files.image || !files.image[0]) {
        return res
          .status(400)
          .json({ success: false, message: "Student image is required" });
      }

      const existingStudent = await Student.findOne({
        email: fields.email[0],
      });

      if (existingStudent) {
        return res.status(409).json({
          success: false,
          message: "A student with this email already exists.",
        });
      }

      const photo = files.image[0];
      let filepath = photo.filepath;

      // Generate unique filename
      const timestamp = Date.now();
      const fileExtension = path.extname(photo.originalFilename);
      const originalName = path
        .basename(photo.originalFilename, fileExtension)
        .replace(/\s+/g, "_");
      const uniqueFilename = `${originalName}_${timestamp}${fileExtension}`;

      // Save to backend uploads directory
      let newPath = path.join(__dirname, "../uploads/student/", uniqueFilename);
      const dir = path.dirname(newPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      let photoData = fs.readFileSync(filepath);
      fs.writeFileSync(newPath, photoData);

      const newStudent = new Student({
        school: req.user.schoolId,
        email: fields.email[0],
        name: fields.name[0],
        studentClass: fields.studentClass[0],
        age: fields.age[0],
        gender: fields.gender[0],
        parent: fields.parent[0],
        parentNum: fields.parentNum[0],
        studentImg: uniqueFilename,
        password: fields.password[0], // stored as plain-text as per your instruction
      });

      const savedStudent = await newStudent.save();
      res.status(200).json({
        success: true,
        data: savedStudent,
        message: "Student is registered Successfully",
      });
    });
  } catch (error) {
    console.error("Register Student error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
},

  loginStudent: async (req, res) => {
    try {
      const student = await Student.findOne({ email: req.body.email });

      if (student) {
        if (req.body.password === student.password) {
          const jwtSecret = process.env.JWT_SECRET;
          const token = jwt.sign(
            {
              id: student._id,
              schoolId: student.school,
              name: student.name,
              studentImg: student.studentImg,
              role: "STUDENT",
            },
            jwtSecret
          );
          res.header("Authorization", token);

          return res.status(200).json({
            success: true,
            message: "Success Login.",
            user: {
              id: student._id,
              schoolId: student.school,
              name: student.name,
              studentImg: student.studentImg,
              role: "STUDENT",
            },
            token: token,
          });
        } else {
          return res
            .status(401)
            .json({ success: false, message: "Password is Incorrect" });
        }
      } else {
        return res
          .status(404)
          .json({ success: false, message: "Email not found" });
      }
    } catch (error) {
      console.error("Login Student error:", error);
      res
        .status(500)
        .json({
          success: false,
          message: "Internal server error [Student LOGIN]",
        });
    }
  },

  getStudentsWithQuery: async (req, res) => {
    try {
      const filterQuery = { school: req.user.schoolId };

      if (req.query.search) {
        filterQuery.name = { $regex: req.query.search, $options: "i" };
      }

      if (req.query.studentClass) {
        filterQuery.studentClass = req.query.studentClass;
      }

      const students = await Student.find(filterQuery).populate("studentClass");

      if (!students || students.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "No Student data found" });
      }

      res.status(200).json({ success: true, message: "Data Found", students });
    } catch (error) {
      console.error("Get all Students error:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },

  getStudentOwnData: async (req, res) => {
    try {
      const id = req.user.id;
      const schoolId = req.user.schoolId;
      const student = await Student.findOne({
        _id: id,
        school: schoolId,
      }).populate('studentClass');

      if (!student) {
        return res
          .status(404)
          .json({ success: false, message: "Student Not Found" });
      }

      res.status(200).json({ success: true, student });
    } catch (error) {
      console.error("Get Student own data error:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },

  fetchStudentWithId: async (req, res) => {
    try {
      const id = req.params.id;
      const schoolId = req.user.schoolId;
      const student = await Student.findOne({ _id: id, school: schoolId });

      if (!student) {
        return res
          .status(404)
          .json({ success: false, message: "Student Not Found" });
      }

      res.status(200).json({ success: true, student });
    } catch (error) {
      console.error("Get Student by id error:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },

  updateStudent: async (req, res) => {
    try {
      const id = req.params.id;
      const schoolId = req.user.schoolId;
      const form = new formidable.IncomingForm();

      form.parse(req, async (err, fields, files) => {
        if (err) {
          return res
            .status(400)
            .json({ success: false, message: "Form parsing error" });
        }

        const student = await Student.findOne({ _id: id, school: schoolId });

        if (!student) {
          return res
            .status(404)
            .json({ success: false, message: "Student not found" });
        }

        // Update fields from form data (take first element if array)
        Object.keys(fields).forEach((field) => {
          student[field] = Array.isArray(fields[field])
            ? fields[field][0]
            : fields[field];
        });

        // Handle image update if provided
        if (files.image && files.image[0]) {
          const photo = files.image[0];
          let filepath = photo.filepath;

          // Generate unique filename
          const timestamp = Date.now();
          const fileExtension = path.extname(photo.originalFilename);
          const originalName = path.basename(photo.originalFilename, fileExtension).replace(/\s+/g, "_");
          const uniqueFilename = `${originalName}_${timestamp}${fileExtension}`;

          // Delete old image if exists
          if (student.studentImg) {
            let oldImagePath = path.join(
              __dirname,
              "../uploads/student/",
              student.studentImg
            );
            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath);
            }
          }

          let newPath = path.join(
            __dirname,
            "../uploads/student/",
            uniqueFilename
          );

          // Create directory if it doesn't exist
          const dir = path.dirname(newPath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }

          let photoData = fs.readFileSync(filepath);
          fs.writeFileSync(newPath, photoData);

          student.studentImg = uniqueFilename; // Update the filename
        }

        await student.save();
        res.status(200).json({
          success: true,
          message: "Student data Updated",
          student: {
            id: student._id,
            name: student.name,
            email: student.email,
            studentImg: student.studentImg,
          },
        });
      });
    } catch (error) {
      console.error("Update Student error:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },

  deleteStudentWithId: async (req, res) => {
    try {
      const id = req.params.id;
      const schoolId = req.user.schoolId;

      const deletedStudent = await Student.findOneAndDelete({
        _id: id,
        school: schoolId,
      });
      if (!deletedStudent) {
        return res
          .status(404)
          .json({
            success: false,
            message: "Student not found or already deleted",
          });
      }

      const students = await Student.find({ school: schoolId }).select(
        "-password -__v -createdAt"
      );
      res
        .status(200)
        .json({ success: true, message: "Student Deleted", students });
    } catch (error) {
      console.error("Delete Student error:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },
};
