// controllers/otpVerification.js
import { Request, Response } from "express";
import { z } from "zod";
import jwt from "jsonwebtoken";
import User from "../../models/user";

let requestBodySchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  otp: z.string(),
});

let signupVerifyOTP = async (req: Request, res: Response) => {
  try {
    const requestBody = requestBodySchema.parse(req.body);

    const otp = requestBody.otp;

    const user = await User.findOne({
      $or: [{ email: requestBody.email }, { phone: requestBody.phone }],
    });

    if (!user) {
      console.log("User not found:", requestBody.email, requestBody.phone);
      return res.status(400).json({ message: "User not found" });
    }

    console.log(
      "api secrest=======================================================>",
      process.env.API_SECRET
    );

    // Check if the OTP is valid
    if (otp === "1234") {
      var token = jwt.sign(
        {
          _id: user?._id,
        },
        process.env.API_SECRET as string,
        {
          expiresIn: 86400,
        }
      );

      res.status(200).json({
        success: true,
        message: "OTP verification successful,User created successfully",
        token: token,
        user: user,
      });
    } else {
      res.status(401).json({ message: "Invalid OTP" });
    }
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default signupVerifyOTP;
