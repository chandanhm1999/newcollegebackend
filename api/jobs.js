// Add to existing file: api/jobs.js
import express from "express";
import Job from "../models/jobModel.js";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const router = express.Router();

// Auth Middleware (optional for public jobs listing)
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

// ✅ GET /api/job/getall
router.get("/getall", async (req, res, next) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.status(200).json({ jobs });
  } catch (err) {
    next(err);
  }
});

// ✅ GET /api/job/:id — Fetch single job by ID
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

// POST /api/job/post
router.post("/post", protectEmployer, async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      country,
      city,
      location,
      fixedSalary,
      salaryFrom,
      salaryTo,
    } = req.body;

    const job = await Job.create({
      title,
      description,
      category,
      country,
      city,
      location,
      fixedSalary,
      salaryFrom,
      salaryTo,
      createdBy: req.user._id,
    });

    res.status(201).json({ message: "Job posted successfully", job });
  } catch (err) {
    next(err);
  }
});

// GET /api/job/getmyjobs
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

export default router;
