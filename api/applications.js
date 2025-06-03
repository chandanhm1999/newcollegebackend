import express from "express";
import Application from "../models/applicationModel.js";
import Job from "../models/jobModel.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Submit application (no resume)
router.post("/submit", verifyToken, async (req, res, next) => {
  try {
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

// Get applications for Job Seeker (their own applications)
router.get("/jobseeker/getall", verifyToken, async (req, res, next) => {
  try {
    // Return only applications submitted by the logged-in user
    const applications = await Application.find({ userId: req.user._id });
    res.status(200).json({ applications });
  } catch (err) {
    next(err);
  }
});

// Get applications for Employer or Recruiter (applications to their posted jobs)
// Get applications for Employer or Recruiter (applications to their posted jobs)
router.get("/employer/getall", verifyToken, async (req, res, next) => {
  try {
    if (req.user.role !== "Employer" && req.user.role !== "Recruiter") {
      return res.status(403).json({
        message: "Only Employers or Recruiters can access this route",
      });
    }

    // Fix: use createdBy instead of postedBy
    const employerJobs = await Job.find({ createdBy: req.user._id });

    const jobIds = employerJobs.map((job) => job._id);

    const applications = await Application.find({ jobId: { $in: jobIds } })
      .populate("jobId")
      .populate("userId");

    res.status(200).json({ applications });
  } catch (err) {
    next(err);
  }
});

// Delete application (Job Seeker can delete their own application)
router.delete("/delete/:id", verifyToken, async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Only the Job Seeker who owns this application can delete it
    if (application.userId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this application" });
    }

    await Application.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Application deleted" });
  } catch (err) {
    next(err);
  }
});

export default router;
