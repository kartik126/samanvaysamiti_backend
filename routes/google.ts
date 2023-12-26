import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";

import { sign } from "jsonwebtoken";
import User from "../models/user";

const router = require("express").Router();

router.post("/signin", async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;

    // Verify Google ID Token
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken,
      audience:
        "960152802121-5s5p8975k1r48fu4fc6722ctsmilhhna.apps.googleusercontent.com", //google provider id
    });

    const payload = ticket.getPayload();

    console.log("Google Sign-In", payload);
    const email = payload?.email;

    // Check if the Google account email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // If the user already exists, create a session or token as needed
      // For example, create and return a JWT token
      const token = sign(
        { _id: existingUser._id },
        "0d39826af2c7c9529831ddc423ac61da7e780fa98e58cdebaf71d417d6"
      );

      return res.status(200).json({
        success: true,
        message: "Google Sign-In successful",
        accessToken: token,
        user: existingUser,
      });
    }
  } catch (error) {
    console.error("Google Sign-In error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
