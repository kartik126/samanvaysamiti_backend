// controllers/loginController.js
import { Request, Response } from "express";
import User from "../../models/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

let loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find the user with the provided email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found", status: false });
    }

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password ?? "");

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: "Invalid password", status: false });
    }

    // TODO: Create a token (JWT) for authentication and send it in the response
    // You'll need to implement this part based on your authentication mechanism
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
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default loginUser;
