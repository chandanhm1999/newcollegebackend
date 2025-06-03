import express from "express";
import Job from "../models/jobModel.js";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const router = express.Router();

// 🔐 Employer-only Auth Middleware
const protectEmployer = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) throw new Error("Unauthorized");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id);

    if (!user || user.role !== "Employer") {
      return res.status(403).json({ message: "Access denied" });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

// ✅ GET /api/job/getall — Public all jobs listing
router.get("/getall", async (req, res, next) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.status(200).json({ jobs });
  } catch (err) {
    next(err);
  }
});

// ✅ GET /api/job/getmyjobs — Employer's jobs
router.get("/getmyjobs", protectEmployer, async (req, res, next) => {
  try {
    const myJobs = await Job.find({ createdBy: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json({ myJobs });
  } catch (err) {
    next(err);
  }
});

// ✅ PUT /api/job/update/:id — Update a job
router.put("/update/:id", protectEmployer, async (req, res, next) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });
    if (!job)
      return res
        .status(404)
        .json({ message: "Job not found or access denied" });

    Object.assign(job, req.body); // update fields
    await job.save();

    res.status(200).json({ message: "Job updated successfully", job });
  } catch (err) {
    next(err);
  }
});

// ✅ DELETE /api/job/delete/:id — Delete a job
router.delete("/delete/:id", protectEmployer, async (req, res, next) => {
  try {
    const job = await Job.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id,
    });
    if (!job)
      return res
        .status(404)
        .json({ message: "Job not found or access denied" });

    res.status(200).json({ message: "Job deleted successfully" });
  } catch (err) {
    next(err);
  }
});

// ✅ POST /api/job/post — Create new job
router.post("/post", protectEmployer, async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      country,
      city,
      location,
      salaryFrom,
      salaryTo,
      fixedSalary,
    } = req.body;

    const job = new Job({
      title,
      description,
      category,
      country,
      city,
      location,
      salaryFrom,
      salaryTo,
      fixedSalary,
      createdBy: req.user._id, // 🔐 Important: set createdBy
    });

    await job.save();
    res.status(201).json({ message: "Job posted successfully", job });
  } catch (err) {
    next(err);
  }
});

// ✅ GET /api/job/:id — Fetch single job by ID (keep this last)
router.get("/:id", async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.status(200).json({ job });
  } catch (err) {
    next(err);
  }
});

export default router;
