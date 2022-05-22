import { Router } from "express";
import { body, validationResult } from "express-validator";
import Course from "../models/course.js";
import Form from "../models/form.js";
import { tokenExtractor } from "../utils/authHelpers.js";
import { badRequest, notFound, sendResponse, serverError } from "../utils/serverResponse.js";

const router = Router();

// ROUTE : 1 POST ADD COURSE
router.post(
  "/addCourse",
  tokenExtractor,
  [
    //validation
    body("title", "Course Title is requrired").notEmpty(),
    body("duration", "Duration must be in numbers(In Month)").isNumeric(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty) {
      return badRequest(res, { error: errors.array() });
    }
    try {
      const {
        body: { title, duration },
        user,
      } = req;
      let course = await Course.findOne({ title });
      if (course) {
        return badRequest(res, { error: "Couse Already Exists with this name" });
      }
      course = await Course.create({
        title,
        duration,
        createBy: user.id,
      });
      sendResponse(res, 201, { data: course });
    } catch (error) {
      return serverError(error, res);
    }
  }
);

// ROUTE : 2 Get Courses
router.get("/getCourses", async (req, res) => {
  try {
    const courses = await Course.find();
    sendResponse(res, 200, { courses });
  } catch (error) {
    return serverError(error, res);
  }
});

// ROUTE : 3 Apply in course
router.post("/applyCourse/:courseId", async (req, res) => {
  try {
    const { name, city, fatherName, email, phone, cnic, fatherCnic, dob, gender, address, lastQualification, image } =
      req.body;
    const { courseId } = req.params;
    let course = await Course.findById(courseId);
    const alreadyApplied = await Form.findOne({ cnic });
    if (alreadyApplied) {
      return badRequest(res, { error: "You have already applied for this course" });
    }
    const form = await Form.create({
      city,
      fatherName,
      email,
      phone,
      cnic,
      fatherCnic,
      dob,
      gender,
      address,
      lastQualification,
      image,
      name,
      course: courseId,
    });
    sendResponse(res, 201, { form });
  } catch (error) {
    return serverError(error, res);
  }
});

// ROUTE : 4 update course status
router.post("/updateCourse/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;
    const { status, name } = req.body;
    let course = await Course.findOneAndUpdate({ _id: courseId }, { title:name });
    if (!course) {
      return notFound(res, { error: "Course not found" });
    }
    return sendResponse(res, 201, { course });
  } catch (error) {
    return serverError(error, res);
  }
});

export default router;
