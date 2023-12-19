// controllers/profileController.js
import { Request, Response } from "express";
import User from "../../models/user";

let getUser = async (req: Request, res: Response) => {
  try {
    // Use the serial_no obtained from the request parameters
    const serialNo = req.params.serialNo;
    
    // Fetch the user's profile based on the serial_no
    const user = await User.findOne({ serial_no: serialNo });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ profile: user });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default getUser;
