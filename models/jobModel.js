import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    country: { type: String, required: true },
    city: { type: String, required: true },
    location: { type: String, required: true },
    fixedSalary: { type: Number },
    salaryFrom: { type: Number },
    salaryTo: { type: Number },
    expired: { type: Boolean, default: false },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Job", jobSchema);
