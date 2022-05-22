import mongoose from "mongoose";

const LeaveSchema = new mongoose.Schema({
  user: { type: mongoose.Types.ObjectId, ref: "auth" },
  updatedBy: { type: mongoose.Types.ObjectId, ref: "auth" },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  attachment: { type: String },
  status: { type: String, default: "pending" },
});

const Leave = mongoose.model("leave", LeaveSchema);
export default Leave;
