import { body, validationResult } from "express-validator";
import Leave from "../models/leave.js";
import { isThisAdmin, tokenExtractor } from "../utils/authHelpers.js";
import { sendResponse, serverError } from "../utils/serverResponse.js";
import { v4 as uuidv4 } from "uuid";
import pkg from "p-iteration";
const { forEach } = pkg;
const upload = multer({ storage: memoryStorage(), dest: "./tmp" });
import multer, { memoryStorage } from "multer";
import router from "./course.js";

// ROUTE : 1 POST ADD LEAVE APPLICATION
router.post(
  "/addLeave",
  tokenExtractor,
  [
    //validation
    body("subject", "Subject is requrired").notEmpty(),
    body("description", "Description is required").notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty) {
      return badRequest(res, { error: errors.array() });
    }
    try {
      const { subject, description, attachment } = req.body;

      let leave = await Leave.create({
        user: req.user.id,
        subject,
        description,
        attachment,
      });
      return sendResponse(res, 201, { leave });
    } catch (error) {
      return serverError(error, res);
    }
  }
);

// ROUTE : 2 Get request status update
router.post("/updateLeave", tokenExtractor, isThisAdmin, async (req, res) => {
  try {
    const { response, leaveId } = req.body;
    console.log(response, leaveId);
    const result = await Leave.findOneAndUpdate({ _id: leaveId }, { status: response }, { new: true });
    res.send(result);
  } catch (error) {
    return serverError(error, res);
  }
});

// ROUTE : 3 Get all applications
router.get("/getLeaves", tokenExtractor, isThisAdmin, async (req, res) => {
  try {
    let leaves = await Leave.find().populate({ path: "user", select: "name email" }).exec();
    sendResponse(res, 200, { leaves });
  } catch (error) {
    return serverError(error, res);
  }
});

// ROUTE : 4 Get my requests
router.get("/getMyLeaves", tokenExtractor, async (req, res) => {
  try {
    const { user } = req;
    let leaves = await Leave.find({ user: user.id });
    sendResponse(res, 200, { leaves });
  } catch (error) {
    return serverError(error, res);
  }
});



export default router;
