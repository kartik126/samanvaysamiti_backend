// controllers/loginController.js
import { Request, Response } from "express";
import User from "../../models/user";
import bcrypt from "bcrypt";

let loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find the user with the provided email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password ?? "");

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // TODO: Create a token (JWT) for authentication and send it in the response
    // You'll need to implement this part based on your authentication mechanism

    res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default loginUser;
