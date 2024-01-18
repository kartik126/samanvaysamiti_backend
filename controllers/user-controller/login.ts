// controllers/loginController.js
import { Request, Response } from "express";
import User from "../../models/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Guest from "../../models/guest";

let loginUser = async (req: Request, res: Response) => {
  try {
    const { emailOrPhone, password } = req.body;

    let user;

    if (isValidEmail(emailOrPhone)) {
      user = await Guest.findOne({ email: emailOrPhone });
    } else if (isValidPhone(emailOrPhone)) {
      user = await Guest.findOne({ phone: emailOrPhone });
    } else {
      return res
        .status(400)
        .json({ message: "Invalid email or phone format", status: false });
    }

    // If no guest user is found, search for a regular user
    if (!user) {
      user = await User.findOne({ email: emailOrPhone });
    }
    if (!user) {
      user = await User.findOne({ phone: emailOrPhone });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found", status: false });
    }

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password ?? "");

    if (isPasswordValid && user.user_status == "active") {
      var token = jwt.sign(
        {
          _id: user?._id,
        },
        process.env.API_SECRET as string,
        {
          expiresIn: 8640000,
        }
      );
      res
        .status(200)
        .json({ message: "Login successful", token: token, status: true,user });
    } else if (user.user_status != "active") {
      res.status(401).json({ message: 'You do not have an active account, Contact admin to activate your account!', status: false });
    } else {
      res.status(401).json({ message: "Invalid password", status: false });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

function isValidEmail(input: string) {
  // Simple email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(input);
}

function isValidPhone(input: string) {
  // Simple phone number validation (numeric and minimum length)
  const phoneRegex = /^\d{7,}$/;
  return phoneRegex.test(input);
}

export default loginUser;
