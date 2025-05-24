const Subject = require("../models/subjectModel");

const Student = require("../models/studentModel");
const Exam = require("../models/examinationModel");
const Schedule = require("../models/scheduleModel");

module.exports = {
  getAllSubjects: async (req, res) => {
    try {
        const schoolId = req.user.schoolId;
        const allSubjects = await Subject.find({school:schoolId});

        res.status(200).json({success:true, message:"Fetched all Subjects", data:allSubjects});

    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Server Error in Subject fetching" });
    }
  },

  createSubject: async (req, res) => {
    try {
      const newSubject = new Subject({
        school: req.user.schoolId,
        subjectName: req.body.subjectName,
        subjectCode: req.body.subjectCode,
      });

      await newSubject.save();

      res.status(201).json({ success: true, message: "Subject Created" });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Server Error in Subject Creation" });
    }
  },

  updateSubjectwithId: async (req, res) => {
    try {
      let id = req.params.id;
      await Subject.findOneAndUpdate({ _id: id }, { $set: { ...req.body } });
      const SubjectAfterUpdate = await Subject.findOne({ _id: id });
      res
        .status(200)
        .json({
          success: true,
          message: "Subject updated.",
          data: SubjectAfterUpdate,
        });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Server Error in Subject Updating" });
      console.log(err);
    }
  },

  deleteSubjectwithId: async (req, res) => {
    try {
      let id = req.params.id;
      let schoolId = req.user.schoolId;

      const SubjectExamCount = (await Exam.find({ subject: id, school: schoolId }))
        .length;
      const SubjectScheduleCount = (
        await Schedule.find({ subject: id, school: schoolId })
      ).length;

      if (
        SubjectExamCount == 0 &&
        SubjectScheduleCount == 0
      ) {
        await Subject.findOneAndDelete({ _id: id, school: schoolId });
        return res
          .status(200)
          .json({ success: true, message: "Subject deleted" });
      } else {
        res
          .status(400)
          .json({ success: false, message: "This Subject is Allocated" });
      }
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Server Error in Subject deleting" });
    }
  },
};
