// controllers/forgotPasswordController.js
import { Request, Response } from "express";
import User from "../../models/user";
import { v4 as uuidv4 } from "uuid";
import nodemailer from "nodemailer";
import { transporter } from "../../utils/nodemailer";

const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Check if the email exists in the database
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found with this email address",
        status: false,
      });
    }

    // Generate a unique token for password reset
    const resetToken = uuidv4();

    // Save the reset token and its expiration time to the user in the database
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // Token will be valid for 1 hour
    await user.save();

    // Create the email content
    const mailOptions = {
      from: "info@samanvaysamiti.com",
      to: user.email,
      subject: "samanvaysamiti.com लॉगिन तपशील",
      text: `प्रिय सभासद,
              साईट वर लॉगिन करण्यासाठी कृपया खाली दिलेल्या लिंक वर जाऊन नवीन पासवर्ड जनरेट करून साईट वर लॉगिन करावे .

              https://www.samanvaysamiti.com/reset-password/${resetToken}

              धन्यवाद !`,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    res.status(200).json({
      message: "Password reset link has been sent to your email address",
      status: true,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default forgotPassword;
