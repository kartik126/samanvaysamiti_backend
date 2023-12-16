// controllers/profileController.js
import { Request, Response } from "express";
import User from "../../models/user";
import { z } from "zod";

const requestBodySchema = z.object({
  minAge: z.number().optional(),
  maxAge: z.number().optional(),
  minHeight: z.string().optional(),
  maxHeight: z.string().optional(),
  minWeight: z.string().optional(),
  maxWeight: z.string().optional(),
  minIncome: z.number().optional(),
  maxIncome: z.number().optional(),
  manglik: z.string().optional(),
  complexion: z.string().optional(),
  education: z.string().optional(),
  location: z.string().optional(),
  like: z.string().optional(),
});

let searchUsers = async (req: Request, res: Response) => {
  try {
    // Use the user's ID obtained from the token
    const userId = req.body.user._id;
    // Fetch the user's profile based on the user ID
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ profile: user });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default searchUsers;
