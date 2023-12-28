import { NextFunction, Request, Response } from "express";
import addUser from "../controllers/user-controller/addUser";
import verifyOTP from "../controllers/user-controller/verifyOTP";
import sendOTP from "../controllers/user-controller/sendOTP";
import verifyToken from "../middleware/verifyToken";
import getProfile from "../controllers/user-controller/getProfile";
import signupVerifyOTP from "../controllers/user-controller/signupVerifyOTP";
import getUser from "../controllers/user-controller/getUser";
import searchUsers from "../controllers/user-controller/searchUsers";
import downloadProfile from "../controllers/user-controller/downloadProfile";
import callCount from "../controllers/user-controller/userCallCount";
import whatsappCount from "../controllers/user-controller/userWhatsappCount";
import forgotPassword from "../controllers/user-controller/forgotPassword";
import resetPassword from "../controllers/user-controller/resetPassword";
import loginUser from "../controllers/user-controller/login";

var express = require("express");
var router = express.Router();

const multer = require("multer");

const storage = multer.memoryStorage(); // Store the image in memory
const upload = multer({ storage: storage, limits: { files: 5 } });

router.post("/send-otp", sendOTP);
router.post("/register", upload.array("photo", 5), addUser);
router.post("/verify-otp", verifyOTP);
router.post("/signup-verify-otp", signupVerifyOTP);

router.get("/get-profile", verifyToken, getProfile);
router.get("/user-detail/:serialNo", getUser);
router.post("/search-users", searchUsers);

router.post("/download-profile", verifyToken, downloadProfile);
router.post("/call-profile", verifyToken, callCount);
router.post("/whatsapp-profile", verifyToken, whatsappCount);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.post("/login", loginUser);

module.exports = router;
