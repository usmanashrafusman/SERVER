import { Router } from "express";
import { body, validationResult } from "express-validator";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import { isThisAdmin, passwordHasher, tokenExtractor, tokenGenerator } from "../utils/authHelpers.js";
import { badRequest, notFound, sendResponse, serverError } from "../utils/serverResponse.js";
import Admin from "../models/admin.js";
import bcrypt from "bcryptjs";
import multer from "multer";
import Student from "../models/student.js";
const upload = multer({ dest: "uploads/" });

const router = Router();

router.post(
  "/signup/",
  [
    body("name", "name is required").isLength({ min: 1 }),
    body("cnic", "CNIC is not valid").isLength({ min: 10 }),
    body("rollNo", "Roll No. is required").isLength({ min: 1 }),
    body("email", "Enter Valid Email").isEmail(),
    body("password", "Password must be 6 letter long").isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return badRequest(res, { error: errors.array()[0].msg });
    }
    try {
      const { name, email, password, rollNo, cnic } = req.body;
      let user = await Student.findOne({ cnic, rollNo });
      if (!user) {
        return badRequest(res, {
          error: "User not found",
        });
      }

      user = await Student.findOne({ email: email });
      if (user?.isRegistered) {
        return badRequest(res, { error: "User Already Registered with this email" });
      }

      user = await Student.findOne({ cnic });
      if (user?.isRegistered) {
        return badRequest(res, { error: "User Already Registered with this cnic" });
      }

      user = await Student.findOne({ rollNo });
      if (user?.isRegistered) {
        return badRequest(res, { error: "User Already Registered with this Roll No" });
      }

      const student = await Student.findOneAndUpdate(
        { cnic, rollNo },
        { isRegistered: true, name, email, password: passwordHasher(password) },
        { new: true }
      );

      res.status(201).send({ token: tokenGenerator(student) });
    } catch (error) {
      return serverError(error, res);
    }
  }
);

router.post(
  "/signin",
  [
    //validation
    body("rollNo", "Enter Valid Roll No").isLength({ min: 1 }),
    body("password", "Password is not valid").isLength({ min: 5 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return badRequest(res, { error: errors.array()[0].msg });
    }
    try {
      const { rollNo, password } = req.body;

      // function for login logic
      let user = await Student.findOne({ rollNo });
      if (!user) {
        return badRequest(res, { error: "User Not Found" });
      }
      if (user.isAdmin) {
        return badRequest(res, { error: "User Not Found" });
      }
      const comparePassWord = await bcrypt.compare(password, user.password);
      if (!comparePassWord) {
        return badRequest(res, { error: "Wrong Password" });
      }
      res.status(201).send({ token: tokenGenerator(user) });
    } catch (error) {
      return serverError(error, res);
    }
  }
);

router.get("/getUser", tokenExtractor, async (req, res) => {
  try {
    return res.status(200).json({ user: req.user });
  } catch (error) {
    serverError(error, res);
  }
});

router.post(
  "/changePassword",
  tokenExtractor,
  [
    //validation
    body("password", "Password 1must be 6 letter long").notEmpty(),
    body("newPassword", "Password must be 6 letter long").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return badRequest(res, { error: errors.array()[0].msg });
    }

    try {
      const { password, newPassword } = req.body;
      const userId = req.user.id;
      const user = await Admin.findById(userId).select({ password: 1 });
      const oldPassword = user.password;
      const comparePassWord = await bcrypt.compare(password, oldPassword);
      if (comparePassWord) {
        const updatePassword = passwordHasher(newPassword);
        const result = await Admin.updateOne({ _id: userId }, { $set: { password: updatePassword } });
        return res.json(result);
      }
      return res.status(401).json({ error: "Old Password Is Wrong" });
    } catch (error) {
      serverError(error, res);
    }
  }
);

router.post(
  "/addAdmin",
  tokenExtractor,
  isThisAdmin,
  [
    //validation
    body("email", "Enter Valid Email").isEmail(),
    body("password", "Password must be 6 letter long").isLength({ min: 6 }),
    body("name", "Name is Required").notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty) {
      return badRequest(res, { error: errors.array() });
    }
    try {
      const { name, email, password, cnic } = req.body;
      let user = await Auth.findOne({ email: email });

      if (user) {
        return badRequest(res, { error: "Email Already Exist" });
      }
      user = await Auth.create({
        name,
        email,
        cnic,
        password: passwordHasher(password),
        uniqueId: uuidv4(),
        isAdmin: true,
      });
      res.status(201).send({ message: "Add Admin Successfully" });
    } catch (error) {
      return serverError(error, res);
    }
  }
);

// ROUTE : 7 admin adding user with roll no and cnic
router.post("/addStudent", upload.single("studentDetails"), async (req, res) => {
  try {
    let fileData;
    fs.readFile(tmp_path, (err, data) => {
      console.log(data);
      fileData = data;
    });

    let user = await Auth.findOne({ $or: { cnic, rollNo } });
    if (user) {
      return badRequest(res, { error: "User Already Added" });
    }
    user = await Auth.create({
      cnic,
      rollNo,
      name: undefined,
      email: undefined,
      password: undefined,
    });
    sendResponse(res, 200, { message: "User Added Successfully" });
  } catch (error) {
    return serverError(error, res);
  }
});

router.post(
  "/signinAdmin",
  [body("email", "Enter Valid Email").isEmail(), body("password", "Password is required").notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return badRequest(res, { error: errors.array()[0].msg });
    }
    try {
      const { email, password } = req.body;

      // function for login logic
      let user = await Auth.findOne({ email });
      if (!user.isAdmin) {
        return badRequest(res, { error: "Credentials Not Found" });
      }
      if (!user) {
        return badRequest(res, { error: "Credentials Not Found" });
      }
      let userPassword = user.password;

      const comparePassWord = await bcrypt.compare(password, userPassword);
      if (!comparePassWord) {
        return badRequest(res, { error: "Credentials Not Found" });
      }
      res.status(200).send({ token: tokenGenerator(user) });
    } catch (error) {
      return serverError(error, res);
    }
  }
);

export default router;
