import { Request, Response } from "express";
import { hashPasswordSecurely } from "../utils/hashPasswordSecurely";
import Guest from "../models/guest";
import { comparePasswords } from "../utils/comparePasswords";
import User from "../models/user";
import jwt from "jsonwebtoken";

var express = require("express");
var router = express.Router();

router.post("/register", async (req: Request, res: Response) => {
  try {
    const { fullname, email, password, phone,location } = req.body;

    // Validate email and phone formats
    if (email && !isValidEmail(email)) {
      return res
        .status(400)
        .json({ message: "Invalid email format", status: false });
    }

    if (phone && !isValidPhone(phone)) {
      return res
        .status(400)
        .json({ message: "Invalid phone number", status: false });
    }

    // Check if the email or phone already exists in the Users table
    if (email) {
      const userWithEmailExists =
        (await User.findOne({ email })) || (await Guest.findOne({ email }));

      if (userWithEmailExists) {
        return res
          .status(400)
          .json({ message: "Email already registered", status: false });
      }
    }

    if (phone) {
      const userWithPhoneExists =
        (await User.findOne({ phone })) || (await Guest.findOne({ phone }));

      if (userWithPhoneExists) {
        return res
          .status(400)
          .json({ message: "Phone already registered", status: false });
      }
    }

    // Hash the password securely
    const hashedPassword = await hashPasswordSecurely(password);

    // Create a new guest user
    const newGuest = new Guest({
      fullname,
      email,
      password: hashedPassword,
      phone,
      location,
      status: false,
      role: "relative",
    });

    // Save the new guest user to the database
    await newGuest.save();

    var token = jwt.sign(
      {
        _id: newGuest?._id,
      },
      process.env.API_SECRET as string,
      {
        expiresIn: 86400,
      }
    );
    res
      .status(201)
      .json({ message: "Registered successfully", token: token, status: true });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


// Login Route
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { emailOrPhone, password } = req.body;

    // Check if emailOrPhone is a valid email or phone format
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

    if (!user) {
      return res.status(404).json({ message: "User not found", status: false });
    }

    const isPasswordValid = await comparePasswords(password, user.password);

    if (isPasswordValid && user.status) {
      var token = jwt.sign(
        {
          _id: user?._id,
        },
        process.env.API_SECRET as string,
        {
          expiresIn: 86400,
        }
      );
      res
        .status(200)
        .json({ message: "Login successful", token: token, status: true });
    } else if (!user.status) {
      res
        .status(401)
        .json({
          message: "You do not have an active account. Contact admin to activate your profile.",
          status: false,
        });
    } else {
      res.status(401).json({ message: "Invalid password", status: false });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


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



module.exports = router;
