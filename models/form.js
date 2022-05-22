import mongoose from "mongoose";

const FormSchema = new mongoose.Schema({
  city: { type: String, required: true },
  name: { type: String, required: true },
  course: { type: mongoose.Types.ObjectId, ref: "course" },
  fatherName: { type: String, require: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  cnic: { type: String, required: true, unique: true },
  fatherCnic: { type: String },
  dob: { type: String, required: true },
  gender: { type: String, required: true },
  address: { type: String, required: true },
  lastQualification: { type: String, required: true },
  image: { type: String, default: "Profile Image" },
});

const Form = mongoose.model("form", FormSchema);

// Form.createIndexes();
export default Form;
