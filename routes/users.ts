import { NextFunction, Request, Response } from "express";
import addUser from "../controllers/user-controller/addUser";
import verifyOTP from "../controllers/user-controller/verifyOTP";
import sendOTP from "../controllers/user-controller/sendOTP";
import verifyToken from "../middleware/verifyToken";
import getProfile from "../controllers/user-controller/getProfile";
import signupVerifyOTP from "../controllers/user-controller/signupVerifyOTP";
import getUser from "../controllers/user-controller/getUser";

var express = require("express");
var router = express.Router();

router.post("/send-otp", sendOTP);
router.post("/register", addUser);
router.post("/verify-otp", verifyOTP);
router.post("/signup-verify-otp", signupVerifyOTP);
router.get("/get-profile", verifyToken, getProfile);
router.get("/user-detail/:id", getUser);


module.exports = router;
