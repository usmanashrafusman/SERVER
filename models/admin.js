import mongoose from "mongoose";

const adminAuth = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, unique: true },
  password: { type: String },
  isAdmin: { type: Boolean, default: false },
  timeStamp: { type: Date, default: Date.now() },
  addedBy: { type: mongoose.Types.ObjectId, ref: "admin" },
});

const Admin = mongoose.model("admin", adminAuth);

export default Admin;
