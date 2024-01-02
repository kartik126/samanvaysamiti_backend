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
    const { fullname, email, password, phone } = req.body;

    // Check if the email or phone already exists in the Users table
    const userWithEmailExists = await User.findOne({ email }) || await Guest.findOne({email});
    const userWithPhoneExists = await User.findOne({ phone }) || await Guest.findOne({phone});

    if (userWithEmailExists || userWithPhoneExists) {
      return res
        .status(400)
        .json({ message: "Email or phone already registered", status: false });
    }

    // if (!isValidEmail(email)) {
    //   return res
    //     .status(400)
    //     .json({ message: "Invalid email format", status: false });
    // }
    if (!isValidPhone(phone)) {
      return res
        .status(400)
        .json({ message: "Invalid phone number", status: false });
    }
    // Hash the password securely
    const hashedPassword = await hashPasswordSecurely(password);

    // Create a new guest user
    const newGuest = new Guest({
      fullname,
      email,
      password: hashedPassword,
      phone,
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
    res.status(201).json({ message: "Registered successfully",token:token, status:true });
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
     var token = jwt.sign(
       {
         _id: user?._id,
       },
       process.env.API_SECRET as string,
       {
         expiresIn: 86400,
       }
     );
    if (isPasswordValid) {
      res.status(200).json({ message: "Login successful",token:token, status: true });
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
