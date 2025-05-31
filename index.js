import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./utils/connectDB.js";
import userRouter from "./api/users.js";
import { errorHandler } from "./middleware/error.js";

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://collegefrontend-nine.vercel.app",
    ],
    credentials: true,
  })
);

// Routes
app.use("/api/user", userRouter);

// Error Middleware
app.use(errorHandler);

// Start
connectDB().then(() => {
  app.listen(3000, () => console.log("Server running on port 3000"));
});
