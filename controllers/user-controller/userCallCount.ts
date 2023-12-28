// Import necessary modules
import { Request, Response } from "express";
import User from "../../models/user";

// Controller to update call count and track called users
const callCount = async (req: Request, res: Response) => {
  const userId = req.body.user._id;
  const calledUserId = req.body.calledUserId; // Assuming you pass the called user's ID in the request

  try {
    // Find the user by ID
    const user = await User.findById(userId);

    // Update call_profiles_count
    // @ts-ignore
    user?.call_profiles_count += 1;

    // Track called user (add calledUserId to the calledUsers array)
    if (calledUserId && !user?.calledUsers.includes(calledUserId)) {
      user?.calledUsers.push(calledUserId);
    }

    // Save the updated user document
    await user?.save();

    // Return a response or do other necessary actions
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Export the controller
export default callCount;
