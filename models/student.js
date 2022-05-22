import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, unique: true },
  password: { type: String },
  isAdmin: { type: Boolean, default: false },
  uniqueId: { type: String, required: true },
  cnic: { type: String, unique: true, required: true },
  isRegistered: { type: Boolean, default: false },
  enrolledCourse: { type: mongoose.Types.ObjectId, ref: "course" },
  timeStamp: { type: Date, default: Date.now() },
  rollNo: { type: String, unique: true, required: true },
  addedBy: { type: mongoose.Types.ObjectId, ref: "admin" },
});

const Student = mongoose.model("student", StudentSchema);

export default Student;
