import mongoose from "mongoose";

const AuthSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  uniqueId: { type: String, required: true },
  isRegistered: { type: Boolean, default: false },
  cnic: { type: String, index: true, unique: true, sparse: true },
  appliedCourses: [{ type: mongoose.Types.ObjectId, ref: "course" }],
  enrolledCourses: [{ type: mongoose.Types.ObjectId, ref: "course" }],
  timeStamp: { type: Date, default: Date.now() },
});

const Auth = mongoose.model("auth", AuthSchema);

export default Auth;
