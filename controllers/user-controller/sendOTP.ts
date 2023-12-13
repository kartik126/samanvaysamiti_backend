import { Request, Response } from "express";
import User from "../../models/user";
import { z } from "zod";
import { generateOTP } from "../../helpers/generateOTP";

let requestBodySchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

let sendOTP = async (req: Request, res: Response) => {
  try {
    let requestBody = requestBodySchema.parse(req.body);

    if (!requestBody.email && !requestBody.phone) {
      return res
        .status(400)
        .json({ message: "Please provide email or phone." });
    }

    let user = null;
    if (requestBody.email) {
      user = await User.findOne({ email: requestBody.email });
    } else if (requestBody.phone) {
      user = await User.findOne({ phone: requestBody.phone });
    }

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found,Please Register" });
    }

    const otp = generateOTP();
    // Save the generated OTP in the user document
    user.otp = otp;
    await user.save();

    res.status(200).json({
      success: true,
      message: `OTP Sent Successfully on ${
        requestBody.phone || requestBody.email
      }`,
      otp: otp,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default sendOTP;
