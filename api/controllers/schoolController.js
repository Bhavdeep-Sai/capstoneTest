require("dotenv").config();
const formidable = require("formidable");
const School = require("../models/schoolModel");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// Email configuration - Fixed function name
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

module.exports = {
  registerSchool: async (req, res) => {
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
            .json({ success: false, message: "School image is required" });
        }

        // Check if school with email already exists
        const existingSchool = await School.findOne({ email: fields.email[0] });
        if (existingSchool) {
          return res.status(400).json({
            success: false,
            message: "School with this email already exists",
          });
        }

        const photo = files.image[0];
        let filepath = photo.filepath;

        // Generate unique filename to avoid conflicts
        const timestamp = Date.now();
        const fileExtension = path.extname(photo.originalFilename);
        const originalName = path
          .basename(photo.originalFilename, fileExtension)
          .replace(/\s+/g, "_");
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
          schoolImg: uniqueFilename,
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

  // Google OAuth Registration - Modified to handle manual image upload
  registerSchoolGoogle: async (req, res) => {
    try {
      const form = new formidable.IncomingForm();
      form.parse(req, async (err, fields, files) => {
        if (err) {
          return res
            .status(400)
            .json({ success: false, message: "Form parsing error" });
        }

        const { token, schoolName, ownerName } = fields;

        if (!token || !schoolName || !ownerName) {
          return res.status(400).json({
            success: false,
            message: "Google token, school name, and owner name are required",
          });
        }

        // Check if image is uploaded manually
        if (!files.image || !files.image[0]) {
          return res.status(400).json({
            success: false,
            message: "School image is required",
          });
        }

        try {
          // Verify Google token
          const googleResponse = await axios.get(
            `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${token[0]}`
          );

          const { email, id: googleId, name } = googleResponse.data;

          // Check if school already exists
          const existingSchool = await School.findOne({ email });
          if (existingSchool) {
            return res.status(400).json({
              success: false,
              message: "School with this email already exists",
            });
          }

          // Handle manually uploaded image
          const photo = files.image[0];
          let filepath = photo.filepath;

          // Generate unique filename to avoid conflicts
          const timestamp = Date.now();
          const fileExtension = path.extname(photo.originalFilename);
          const originalName = path
            .basename(photo.originalFilename, fileExtension)
            .replace(/\s+/g, "_");
          const uniqueFilename = `google_manual_${originalName}_${timestamp}${fileExtension}`;

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

          // Generate a random password for OAuth users
          const randomPassword = Math.random().toString(36).slice(-12);
          const salt = bcrypt.genSaltSync(10);
          const hashPassword = bcrypt.hashSync(randomPassword, salt);

          const newSchool = new School({
            schoolName: schoolName[0],
            email,
            ownerName: ownerName[0],
            schoolImg: uniqueFilename,
            password: hashPassword,
            oauthProvider: "google",
            oauthId: googleId,
            isOAuthUser: true,
          });

          const savedSchool = await newSchool.save();

          res.status(200).json({
            success: true,
            message: "School registered successfully with Google",
            data: {
              id: savedSchool._id,
              ownerName: savedSchool.ownerName,
              schoolName: savedSchool.schoolName,
              schoolImg: savedSchool.schoolImg,
              email: savedSchool.email,
              isOAuthUser: true,
              oauthProvider: "google"
            },
          });

        } catch (googleError) {
          console.error("Google OAuth verification error:", googleError);
          return res.status(400).json({
            success: false,
            message: "Invalid Google token or verification failed",
          });
        }
      });
    } catch (error) {
      console.error("Google OAuth registration error:", error);
      res.status(500).json({
        success: false,
        message: "Google OAuth registration failed",
      });
    }
  },

  loginSchool: async (req, res) => {
    try {
      const school = await School.findOne({ email: req.body.email });

      if (school) {
        // Check if it's an OAuth user trying to login with password
        if (school.isOAuthUser) {
          return res.status(400).json({
            success: false,
            message: `This account was created with ${school.oauthProvider}. Please use ${school.oauthProvider} login.`,
          });
        }

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
              role: "SCHOOL",
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
              role: "SCHOOL",
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
      res
        .status(500)
        .json({
          success: false,
          message: "Internal server error [SCHOOL LOGIN]",
        });
    }
  },

  // Google OAuth Login
  loginSchoolGoogle: async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required for OAuth login",
        });
      }

      // Find school with Google OAuth
      const school = await School.findOne({
        email: email,
        oauthProvider: "google",
        isOAuthUser: true,
      });

      if (school) {
        const jwtSecret = process.env.JWT_SECRET;
        const token = jwt.sign(
          {
            id: school._id,
            schoolId: school._id,
            ownerName: school.ownerName,
            schoolName: school.schoolName,
            schoolImg: school.schoolImg,
            role: "SCHOOL",
          },
          jwtSecret
        );

        res.header("Authorization", token);

        return res.status(200).json({
          success: true,
          message: "Google Login Successful",
          user: {
            id: school._id,
            ownerName: school.ownerName,
            schoolName: school.schoolName,
            schoolImg: school.schoolImg,
            role: "SCHOOL",
          },
          token: token,
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "No account found with this Google account",
        });
      }
    } catch (error) {
      console.error("Google OAuth login error:", error);
      res.status(500).json({
        success: false,
        message: "Google OAuth login failed",
      });
    }
  },

  // Forgot Password
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
        });
      }

      // Find the school by email
      const school = await School.findOne({ email });

      if (!school) {
        return res.status(404).json({
          success: false,
          message: "No account found with this email address",
        });
      }

      // Check if it's an OAuth user
      if (school.isOAuthUser) {
        return res.status(400).json({
          success: false,
          message: `This account was created with ${school.oauthProvider}. Please use ${school.oauthProvider} login to access your account.`,
        });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

      // Save reset token to database
      school.resetPasswordToken = resetToken;
      school.resetPasswordExpires = resetTokenExpiry;
      await school.save();

      // Create password reset URL
      const resetURL = `${
        process.env.FRONTEND_URL || "http://localhost:3000"
      }/reset-password/${resetToken}`;

      // Email content
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Password Reset Request - School Management System",
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <h2 style="color: #FF9800;">Password Reset Request</h2>
            <p>Dear ${school.ownerName},</p>
            <p>You have requested to reset your password for your School Management System account.</p>
            <p>Please click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetURL}" 
                 style="background: linear-gradient(45deg, #FF9800 30%, #FF5722 90%); 
                        color: white; 
                        padding: 12px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        display: inline-block;">
                Reset Password
              </a>
            </div>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetURL}</p>
            <p><strong>This link will expire in 1 hour.</strong></p>
            <p>If you did not request this password reset, please ignore this email and your password will remain unchanged.</p>
            <br>
            <p>Best regards,<br>School Management System Team</p>
          </div>
        `,
      };

      // Send email - Fixed function call
      const transporter = createTransporter();
      await transporter.sendMail(mailOptions);

      res.status(200).json({
        success: true,
        message: "Password reset link has been sent to your email address",
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to send password reset email. Please try again later.",
      });
    }
  },

  // Reset Password
  resetPassword: async (req, res) => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Reset token and new password are required",
        });
      }

      // Find school with valid reset token
      const school = await School.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() },
      });

      if (!school) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired reset token",
        });
      }

      // Hash new password
      const salt = bcrypt.genSaltSync(10);
      const hashPassword = bcrypt.hashSync(newPassword, salt);

      // Update password and clear reset token
      school.password = hashPassword;
      school.resetPasswordToken = null;
      school.resetPasswordExpires = null;
      await school.save();

      res.status(200).json({
        success: true,
        message: "Password has been reset successfully",
      });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to reset password. Please try again.",
      });
    }
  },

  // Verify Reset Token
  verifyResetToken: async (req, res) => {
    try {
      const { token } = req.params;

      const school = await School.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() },
      });

      if (!school) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired reset token",
        });
      }

      res.status(200).json({
        success: true,
        message: "Token is valid",
        schoolName: school.schoolName,
      });
    } catch (error) {
      console.error("Verify reset token error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to verify reset token",
      });
    }
  },

  getAllSchools: async (req, res) => {
    try {
      const schools = await School.find().select(
        "-password -__v -createdAt -resetPasswordToken -resetPasswordExpires"
      );

      if (!schools || schools.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "No School data found" });
      }

      res.status(200).json({ success: true, message: "Data Found", schools });
    } catch (error) {
      console.error("Get all schools error:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },

  getSchoolOwnData: async (req, res) => {
    try {
      const id = req.user.id;
      const school = await School.findOne({ _id: id }).select(
        "-password -resetPasswordToken -resetPasswordExpires"
      );

      if (!school) {
        return res
          .status(404)
          .json({ success: false, message: "School Not Found" });
      }

      res.status(200).json({ success: true, school });
    } catch (error) {
      console.error("Get school own data error:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },

  updateSchool: async (req, res) => {
    try {
      const id = req.user.id;
      const form = new formidable.IncomingForm();

      form.parse(req, async (err, fields, files) => {
        if (err) {
          return res
            .status(400)
            .json({ success: false, message: "Form parsing error" });
        }

        const school = await School.findOne({ _id: id });

        if (!school) {
          return res
            .status(404)
            .json({ success: false, message: "School not found" });
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
          const originalName = path
            .basename(photo.originalFilename, fileExtension)
            .replace(/\s+/g, "_");
          const uniqueFilename = `${originalName}_${timestamp}${fileExtension}`;

          // Delete old image if exists and it's not from Google OAuth
          if (school.schoolImg && !school.schoolImg.includes("google_")) {
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
            schoolImg: school.schoolImg,
          },
        });
      });
    } catch (error) {
      console.error("Update school error:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },
};