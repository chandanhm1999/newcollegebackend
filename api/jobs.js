import express from "express";
import Job from "../models/jobModel.js";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const router = express.Router();

// Auth Middleware (inline for simplicity)
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

export default router;
