const formidable = require("formidable");
const Teacher = require("../models/teacherModel");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = {
  registerTeacher: async (req, res) => {
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
            .json({ success: false, message: "Teacher image is required" });
        }

        // Check for required fields based on the schema
        const requiredFields = [
          "email",
          "name",
          "qualification",
          "age",
          "gender",
          "password",
        ];
        for (const field of requiredFields) {
          if (!fields[field] || !fields[field][0]) {
            return res.status(400).json({
              success: false,
              message: `${
                field.charAt(0).toUpperCase() + field.slice(1)
              } is required`,
            });
          }
        }

        const photo = files.image[0];
        let filepath = photo.filepath;
        let originalFilename = photo.originalFilename.replace(/\s+/g, "_");
        let newPath = path.join(
          __dirname,
          process.env.TEACHER_IMAGE_PATH,
          originalFilename
        );

        // Create directory if it doesn't exist
        const dir = path.dirname(newPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        let photoData = fs.readFileSync(filepath);
        fs.writeFileSync(newPath, photoData);

        // Handle teacherClasses as array
        let teacherClasses = [];
        if (fields.teacherClasses && fields.teacherClasses[0]) {
          try {
            teacherClasses = JSON.parse(fields.teacherClasses[0]);
          } catch (e) {
            console.error("Error parsing teacherClasses:", e);
          }
        }

        // Handle subjects as array
        let subjects = [];
        if (fields.subjects && fields.subjects[0]) {
          try {
            subjects = JSON.parse(fields.subjects[0]);
          } catch (e) {
            console.error("Error parsing subjects:", e);
          }
        } else if (fields.subject && fields.subject[0]) {
          // For backward compatibility - if subjects is not provided but subject is
          try {
            // First try to parse subject as JSON in case it's already an array
            subjects = JSON.parse(fields.subject[0]);
          } catch (e) {
            // If it's not JSON, treat it as a single subject ID
            subjects = [fields.subject[0]];
          }
        }

        const newTeacher = new Teacher({
          school: req.user.schoolId,
          email: fields.email[0],
          name: fields.name[0],
          qualification: fields.qualification[0],
          subjects: subjects,
          teacherClasses: teacherClasses,
          age: fields.age[0],
          gender: fields.gender[0],
          teacherImg: originalFilename,
          password: fields.password[0],
        });

        const savedTeacher = await newTeacher.save();
        res.status(200).json({
          success: true,
          data: savedTeacher,
          message: "Teacher is registered Successfully",
        });
      });
    } catch (error) {
      console.error("Register Teacher error:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },

  loginTeacher: async (req, res) => {
    try {
      const teacher = await Teacher.findOne({ email: req.body.email });

      if (!teacher) {
        return res
          .status(404)
          .json({ success: false, message: "Email not found" });
      }

      if (req.body.password === teacher.password) {
        const jwtSecret = process.env.JWT_SECRET;
        const token = jwt.sign(
          {
            id: teacher._id,
            schoolId: teacher.school,
            name: teacher.name,
            teacherImg: teacher.teacherImg,
            role: "TEACHER",
          },
          jwtSecret
        );

        res.header("Authorization", token);

        return res.status(200).json({
          success: true,
          message: "Success Login.",
          user: {
            id: teacher._id,
            schoolId: teacher.school,
            name: teacher.name,
            teacherImg: teacher.teacherImg,
            role: "TEACHER",
          },
          token: token,
        });
      } else {
        return res
          .status(401)
          .json({ success: false, message: "Password is Incorrect" });
      }


    } catch (error) {
      console.error("Login Teacher error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error [Teacher LOGIN]",
      });
    }
  },

  getTeachersWithQuery: async (req, res) => {
    try {
      const filterQuery = { school: req.user.schoolId };

      if (req.query.search) {
        filterQuery.name = { $regex: req.query.search, $options: "i" };
      }

      if (req.query.teacherClass) {
        filterQuery.teacherClasses = req.query.teacherClass;
      }

      if (req.query.subject) {
        filterQuery.subjects = req.query.subject;
      }

      const teachers = await Teacher.find(filterQuery)
        .populate("teacherClasses")
        .populate("subjects")
        .select("-password");

      res.status(200).json({
        success: true,
        message: teachers.length > 0 ? "Data Found" : "No Teachers Found",
        teachers,
      });
    } catch (error) {
      console.error("Get all Teachers error:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },

  getTeacherOwnData: async (req, res) => {
    try {
      const id = req.user.id;
      const schoolId = req.user.schoolId;
      const teacher = await Teacher.findOne({ _id: id, school: schoolId })
        .populate("teacherClasses")
        .populate("subjects");

      if (!teacher) {
        return res
          .status(404)
          .json({ success: false, message: "Teacher Not Found" });
      }

      res.status(200).json({ success: true, teacher });
    } catch (error) {
      console.error("Get Teacher own data error:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },

  fetchTeacherWithId: async (req, res) => {
    try {
      const id = req.params.id;
      const schoolId = req.user.schoolId;
      const teacher = await Teacher.findOne({ _id: id, school: schoolId })
        .populate("teacherClasses")
        .populate("subjects");

      if (!teacher) {
        return res
          .status(404)
          .json({ success: false, message: "Teacher Not Found" });
      }

      res.status(200).json({ success: true, teacher });
    } catch (error) {
      console.error("Get Teacher by id error:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },

  updateTeacher: async (req, res) => {
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

        const teacher = await Teacher.findOne({ _id: id, school: schoolId });

        if (!teacher) {
          return res
            .status(404)
            .json({ success: false, message: "Teacher not found" });
        }

        // Update fields from form data (take first element if array)
        Object.keys(fields).forEach((field) => {
          // Handle special cases and skip password updates here
          if (
            field !== "teacherClasses" &&
            field !== "subjects" &&
            field !== "password"
          ) {
            teacher[field] = Array.isArray(fields[field])
              ? fields[field][0]
              : fields[field];
          }
        });

        // Handle teacherClasses as JSON array
        if (fields.teacherClasses && fields.teacherClasses[0]) {
          try {
            teacher.teacherClasses = JSON.parse(fields.teacherClasses[0]);
          } catch (e) {
            console.error("Error parsing teacherClasses:", e);
          }
        }

        // Handle subjects as JSON array
        if (fields.subjects && fields.subjects[0]) {
          try {
            teacher.subjects = JSON.parse(fields.subjects[0]);
          } catch (e) {
            console.error("Error parsing subjects:", e);
          }
        } else if (fields.subject && fields.subject[0]) {
          // For backward compatibility
          try {
            // First try to parse subject as JSON in case it's already an array
            teacher.subjects = JSON.parse(fields.subject[0]);
          } catch (e) {
            // If it's not JSON, treat it as a single subject ID
            teacher.subjects = [fields.subject[0]];
          }
        }

        // Handle password updates separately to trigger bcrypt hooks
        if (fields.password && fields.password[0]) {
          teacher.password = fields.password[0];
        }

        // Handle image update if provided
        if (files.image && files.image[0]) {
          const photo = files.image[0];
          let filepath = photo.filepath;
          let originalFilename = photo.originalFilename.replace(/\s+/g, "_");

          // Delete old image if exists
          if (teacher.teacherImg) {
            let oldImagePath = path.join(
              __dirname,
              process.env.TEACHER_IMAGE_PATH,
              teacher.teacherImg
            );
            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath);
            }
          }

          let newPath = path.join(
            __dirname,
            process.env.TEACHER_IMAGE_PATH,
            originalFilename
          );

          // Create directory if it doesn't exist
          const dir = path.dirname(newPath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }

          let photoData = fs.readFileSync(filepath);
          fs.writeFileSync(newPath, photoData);

          teacher.teacherImg = originalFilename;
        }

        await teacher.save();

        // Return updated teacher without sensitive data
        const updatedTeacher = await Teacher.findById(teacher._id)
          .populate("teacherClasses")
          .populate("subjects")
          .select("-password");

        res.status(200).json({
          success: true,
          message: "Teacher data Updated",
          teacher: updatedTeacher,
        });
      });
    } catch (error) {
      console.error("Update Teacher error:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },

  deleteTeacherWithId: async (req, res) => {
    try {
      const id = req.params.id;
      const schoolId = req.user.schoolId;

      const deletedTeacher = await Teacher.findOneAndDelete({
        _id: id,
        school: schoolId,
      });
      if (!deletedTeacher) {
        return res.status(404).json({
          success: false,
          message: "Teacher not found or already deleted",
        });
      }

      // Delete teacher image if exists
      if (deletedTeacher.teacherImg) {
        let imagePath = path.join(
          __dirname,
          process.env.TEACHER_IMAGE_PATH,
          deletedTeacher.teacherImg
        );
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      res.status(200).json({
        success: true,
        message: "Teacher Deleted Successfully",
      });
    } catch (error) {
      console.error("Delete Teacher error:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },
};
