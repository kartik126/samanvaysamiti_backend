// controllers/profileController.js
import { Request, Response } from "express";
import User from "../../models/user";

let whatsappCount = async (req: Request, res: Response) => {
  const userId = req.body.user._id;
  try {
    // Find the user by ID
    const user = await User.findById(userId);

    // @ts-ignore
    user?.whatsapp_profiles_count += 1;

    // Save the updated user document
    await user?.save();

    // Return a response or do other necessary actions
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export default whatsappCount;
