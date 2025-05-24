require("dotenv").config();
const formidable = require("formidable");
const School = require("../models/schoolModel");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = {
  registerSchool: async (req, res) => {
    try {
      const form = new formidable.IncomingForm();
      form.parse(req, async (err, fields, files) => {
        if (err) {
          return res.status(400).json({ success: false, message: "Form parsing error" });
        }
        
        if (!files.image || !files.image[0]) {
          return res.status(400).json({ success: false, message: "School image is required" });
        }

        const photo = files.image[0];
        let filepath = photo.filepath;
        
        // Generate unique filename to avoid conflicts
        const timestamp = Date.now();
        const fileExtension = path.extname(photo.originalFilename);
        const originalName = path.basename(photo.originalFilename, fileExtension).replace(/\s+/g, "_");
        const uniqueFilename = `${originalName}_${timestamp}${fileExtension}`;
        
        // Save to backend uploads directory
        let newPath = path.join(
          __dirname,
          "../uploads/school/",
          uniqueFilename
        );

        // Create directory if it doesn't exist
        const dir = path.dirname(newPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        let photoData = fs.readFileSync(filepath);
        fs.writeFileSync(newPath, photoData);

        const salt = bcrypt.genSaltSync(10);
        const hashPassword = bcrypt.hashSync(fields.password[0], salt);

        const newSchool = new School({
          schoolName: fields.schoolName[0],
          email: fields.email[0],
          ownerName: fields.ownerName[0],
          schoolImg: uniqueFilename, // Store the unique filename
          password: hashPassword,
        });

        const savedSchool = await newSchool.save();
        res.status(200).json({
          success: true,
          data: savedSchool,
          message: "School is registered Successfully",
        });
      });
    } catch (error) {
      console.error("Register school error:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },

  loginSchool: async (req, res) => {
    try {
      const school = await School.findOne({ email: req.body.email });

      if (school) {
        // Changed to await the bcrypt.compare promise
        const isAuth = await bcrypt.compare(req.body.password, school.password);

        if (isAuth) {
          const jwtSecret = process.env.JWT_SECRET;
          const token = jwt.sign(
            {
              id: school._id,
              schoolId: school._id,
              ownerName: school.ownerName,
              schoolName: school.schoolName, 
              schoolImg: school.schoolImg,
              role: "SCHOOL", // Consistent role name
            },
            jwtSecret
          );
          res.header("Authorization", token);

          return res.status(200).json({
            success: true,
            message: "Success Login.",
            user: {
              id: school._id,
              ownerName: school.ownerName,
              schoolName: school.schoolName,
              schoolImg: school.schoolImg,
              role: "SCHOOL", // Consistent role name
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
      console.error("Login school error:", error);
      res.status(500).json({success: false, message: "Internal server error [SCHOOL LOGIN]"});
    }
  },

  getAllSchools: async(req, res) => {
    try {
      const schools = await School.find().select('-password -__v -createdAt');
      
      if(!schools || schools.length === 0){
        return res.status(404).json({success: false, message: "No School data found"});
      }

      res.status(200).json({success: true, message: "Data Found", schools});
    } catch (error) {
      console.error("Get all schools error:", error);
      res.status(500).json({success: false, message: "Internal Server Error"});
    }
  },
  
  getSchoolOwnData: async(req, res) => {
    try {
      const id = req.user.id;
      const school = await School.findOne({_id: id}).select('-password');

      if(!school){
        return res.status(404).json({success: false, message: "School Not Found"});
      }

      res.status(200).json({success: true, school})
    } catch (error) {
      console.error("Get school own data error:", error);
      res.status(500).json({success: false, message: "Internal Server Error"});
    }
  },

  updateSchool: async (req, res) => {
    try {
      const id = req.user.id;
      const form = new formidable.IncomingForm();
      
      form.parse(req, async (err, fields, files) => {
        if (err) {
          return res.status(400).json({ success: false, message: "Form parsing error" });
        }

        const school = await School.findOne({_id: id});
        
        if (!school) {
          return res.status(404).json({success: false, message: "School not found"});
        }
        
        // Update fields
        Object.keys(fields).forEach((field) => {
          school[field] = fields[field][0];
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
          if (school.schoolImg) {
            let oldImagePath = path.join(
              __dirname,
              "../uploads/school/",
              school.schoolImg
            );
            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath);
            }
          }

          let newPath = path.join(
            __dirname,
            "../uploads/school/",
            uniqueFilename
          );
          
          // Create directory if it doesn't exist
          const dir = path.dirname(newPath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          
          let photoData = fs.readFileSync(filepath);
          fs.writeFileSync(newPath, photoData);
          
          school.schoolImg = uniqueFilename;
        }

        await school.save();
        res.status(200).json({
          success: true, 
          message: "School data Updated", 
          school: {
            id: school._id,
            schoolName: school.schoolName,
            ownerName: school.ownerName,
            email: school.email,
            schoolImg: school.schoolImg
          }
        });
      });
    } catch (error) {
      console.error("Update school error:", error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  }
};