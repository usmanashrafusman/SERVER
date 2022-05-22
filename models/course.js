import mongoose from "mongoose";

const CourseScehma = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  admin: { type: mongoose.Types.ObjectId, ref: "auth" },
  enrolledStudent: [{ type: mongoose.Types.ObjectId, ref: "auth" }],
  appliedStudents: [{ type: mongoose.Types.ObjectId, ref: "auth" }],
  timeStamp: { type: Date, default: Date.now() },
  isOpen: { type: Boolean, default: true },
  duration: { type: Number, required: true }, //In Month
});

const Course = mongoose.model("course", CourseScehma);

// Course.createIndexes();
export default Course;
