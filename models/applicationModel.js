import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: String,
  email: String,
  phone: String,
  address: String,
  coverLetter: String,
  resume: {
    public_id: String,
    url: String,
  },
});

export default mongoose.model("Application", applicationSchema);
