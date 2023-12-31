import { Request, Response } from "express";
import { hashPasswordSecurely } from "../utils/hashPasswordSecurely";
import Guest from "../models/guest";
import { comparePasswords } from "../utils/comparePasswords";

var express = require("express");
var router = express.Router();

router.post("/register", async (req: Request, res: Response) => {
  try {
    const { fullname, email, password, phone } = req.body;

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

    res.status(201).json({ message: "Guest user registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await Guest.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found", status: false });
    }
    const isPasswordValid = await comparePasswords(password, user.password);

    if (isPasswordValid) {
      res.status(200).json({ message: "Login successful", status: true });
    } else {
      res.status(401).json({ message: "Invalid password", status: false });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
