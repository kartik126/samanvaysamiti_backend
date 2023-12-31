// controllers/resetPasswordController.js
import { Request, Response } from "express";
import User from "../../models/user";
import { hashPasswordSecurely } from "../../utils/hashPasswordSecurely";

const resetPassword = async (req: Request, res: Response) => {
  try {
    const { resetToken, newPassword } = req.body;

    // Find the user with the provided reset token
    const user = await User.findOne({
      resetPasswordToken: resetToken
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or the link has been expired!",
        status: false,
      });
    }

    const hashedPassword = await hashPasswordSecurely(newPassword);
    // Set the new password and clear the reset token fields
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    // Save the updated user with the new password
    await user.save();

    res
      .status(200)
      .json({ message: "Password reset successfully", status: true });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default resetPassword;
