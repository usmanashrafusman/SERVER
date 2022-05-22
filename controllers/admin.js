import { Router } from "express";
import { isThisAdmin, passwordHasher, tokenExtractor, tokenGenerator } from "../utils/authHelpers.js";
import { sendResponse, serverError, badRequest } from "../utils/serverResponse.js";
import { v4 as uuidv4 } from "uuid";
import pkg from "p-iteration";
const { forEach } = pkg;
const upload = multer({ storage: memoryStorage(), dest: "./tmp" });
import multer, { memoryStorage } from "multer";
import render from "xlsx";
import { body, validationResult } from "express-validator";
import Student from "../models/student.js";
import bcrypt from "bcryptjs";
import Admin from "../models/admin.js";
const router = Router();
router.post(
  "/signin",
  [
    //validation
    body("username", "Enter Valid Username").notEmpty(),
    body("password", "Password is required").notEmpty(),
  ],
  // if error in above conditions
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return badRequest(res, { error: errors.array()[0].msg });
    }
    try {
      const { username, password } = req.body;
      const user = await Admin.findOne({ username });

      if (!user) {
        return badRequest(res, { error: "User Not Found" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return badRequest(res, { error: "Password is incorrect" });
      }
      // if password not matched
      const tokenData = {
        id: user.id,
        name: user.name,
        username: user.username,
        isAdmin: user.isAdmin,
      };

      res.status(200).send({
        token: tokenGenerator(tokenData),
      });
    } catch (error) {
      return serverError(error, res);
    }
  }
);
router.post("/addStudents", tokenExtractor, isThisAdmin, upload.single("file"), async (req, res) => {
  try {
    var tmpFiles = render.read(req.file.buffer);
    const sheets = tmpFiles.SheetNames[0];
    const toBeAdd = [];
    const sheetData = render.utils.sheet_to_json(tmpFiles.Sheets[sheets]);
    await forEach(sheetData, async (student) => {
      toBeAdd.push({
        uniqueId: uuidv4(),
        addBy: req.user.id,
        ...student,
      });
    });
    let students = await Student.insertMany(toBeAdd);
    return sendResponse(res, 200, {
      message: "Students registered successfully",
    });
  } catch (error) {
    return serverError(error, res);
  }
});

router.post(
  "/addAdmin",
  tokenExtractor,
  isThisAdmin,
  [
    //validation
    body("name", "Name is Required").notEmpty(),
    body("username", "Username Is Required").notEmpty(),
    body("password", "Password must be atleast 6 charactors").isLength({ min: 6 }),
  ],
  // if error in above conditions
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return badRequest(res, { error: errors.array()[0].msg });
    }
    try {
      const { name, username, password } = req.body;
      const isExist = await Admin.findOne({ username });
      if (isExist) {
        return badRequest(res, { error: "Username already exists" });
      }
      const hashedPassword = await passwordHasher(password);
      const user = await Admin.create({
        name,
        username,
        password: hashedPassword,
        isAdmin: true,
      });

      res.status(200).send({ user });
    } catch (error) {
      return serverError(error, res);
    }
  }
);

export default router;
