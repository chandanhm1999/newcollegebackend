import express from "express";
import multer from "multer";
import cloudinary from "../utils/cloudinary.js";
import Application from "../models/applicationModel.js";
import Job from "../models/jobModel.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Submit application
router.post(
  "/submit",
  verifyToken,
  upload.single("resume"),
  async (req, res, next) => {
    try {
      const { jobId, name, email, phone, address, coverLetter } = req.body;

      const existingApp = await Application.findOne({
        jobId,
        userId: req.user._id,
      });
      if (existingApp)
        return res
          .status(400)
          .json({ message: "You already applied to this job" });

      const file = req.file;
      const uploadRes = await cloudinary.uploader.upload_stream(
        {
          folder: "college-resumes",
          resource_type: "auto",
        },
        async (error, result) => {
          if (error) return next(error);

          const application = await Application.create({
            jobId,
            userId: req.user._id,
            name,
            email,
            phone,
            address,
            coverLetter,
            resume: {
              public_id: result.public_id,
              url: result.secure_url,
            },
          });

          res.status(200).json({
            message: "Application submitted successfully",
            application,
          });
        }
      );
      uploadRes.end(file.buffer);
    } catch (err) {
      next(err);
    }
  }
);

// Get Job Seeker applications
router.get("/jobseeker/getall", verifyToken, async (req, res, next) => {
  try {
    const applications = await Application.find({ userId: req.user._id });
    res.status(200).json({ applications });
  } catch (err) {
    next(err);
  }
});

// Get Employer applications
router.get("/employer/getall", verifyToken, async (req, res, next) => {
  try {
    const employerJobs = await Job.find({ postedBy: req.user._id });
    const jobIds = employerJobs.map((job) => job._id);

    const applications = await Application.find({ jobId: { $in: jobIds } });
    res.status(200).json({ applications });
  } catch (err) {
    next(err);
  }
});

// Delete application
router.delete("/delete/:id", verifyToken, async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application)
      return res.status(404).json({ message: "Application not found" });

    await cloudinary.uploader.destroy(application.resume.public_id);
    await Application.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Application deleted" });
  } catch (err) {
    next(err);
  }
});

export default router;
