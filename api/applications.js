import express from "express";
import Application from "../models/applicationModel.js";
import Job from "../models/jobModel.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Submit application (Job Seeker only)
router.post("/submit", verifyToken, async (req, res, next) => {
  try {
    if (req.user.role !== "Job Seeker") {
      return res.status(403).json({ message: "Only Job Seekers can apply." });
    }

    const { jobId, name, email, phone, address, coverLetter } = req.body;

    const existingApp = await Application.findOne({
      jobId,
      userId: req.user._id,
    });

    if (existingApp) {
      return res
        .status(400)
        .json({ message: "You already applied to this job" });
    }

    const application = await Application.create({
      jobId,
      userId: req.user._id,
      name,
      email,
      phone,
      address,
      coverLetter,
    });

    res.status(200).json({
      message: "Application submitted successfully",
      application,
    });
  } catch (err) {
    next(err);
  }
});

// Get all applications submitted by the Job Seeker
router.get("/jobseeker/getall", verifyToken, async (req, res, next) => {
  try {
    if (req.user.role !== "Job Seeker") {
      return res
        .status(403)
        .json({ message: "Only Job Seekers can access this route" });
    }

    const applications = await Application.find({ userId: req.user._id });
    res.status(200).json({ applications });
  } catch (err) {
    next(err);
  }
});

// Get all applications received by Employer or Recruiter
router.get("/employer/getall", verifyToken, async (req, res, next) => {
  try {
    if (req.user.role !== "Employer" && req.user.role !== "Recruiter") {
      return res.status(403).json({
        message: "Only Employers or Recruiters can access this route",
      });
    }

    const jobs = await Job.find({ postedBy: req.user._id });
    const jobIds = jobs.map((job) => job._id);

    const applications = await Application.find({ jobId: { $in: jobIds } });
    res.status(200).json({ applications });
  } catch (err) {
    next(err);
  }
});

// Delete application (Job Seeker can delete their own only)
router.delete("/delete/:id", verifyToken, async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (
      req.user.role !== "Job Seeker" ||
      application.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    await Application.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Application deleted" });
  } catch (err) {
    next(err);
  }
});

export default router;
