import express from "express";
import User from "../models/userModel.js";
import { generateToken } from "../utils/generateToken.js";

const router = express.Router();

// Register
router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ name, email, password, phone, role });
    generateToken(user, res, "Registered Successfully");
  } catch (err) {
    next(err);
  }
});

// Login
router.post("/login", async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    if (user.role !== role)
      return res.status(400).json({ message: "Role does not match" });

    generateToken(user, res, "Login Successful");
  } catch (err) {
    next(err);
  }
});

// Logout — clears the cookie properly based on environment
router.get("/logout", (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";

  res
    .clearCookie("token", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
    })
    .status(200)
    .json({ message: "Logged out successfully" });
});

export default router;
