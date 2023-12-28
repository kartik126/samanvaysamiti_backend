// Import necessary modules
import { Request, Response } from "express";
import User from "../../models/user";
import DailyStats from "../../models/DailyStats";

// Controller to update Email count and track Email users
const emailCount = async (req: Request, res: Response) => {
  const userId = req.body.user._id;
  const emailUserId = req.body.emailUserId; // Assuming you pass the Email user's ID in the request

  try {
    // Check if there is a dailyStats document for today and the user
    const today = new Date().setHours(0, 0, 0, 0);
    let dailyStats = await DailyStats.findOne({ userId, date: today });

    if (!dailyStats) {
      // If no dailyStats document exists, create a new one
      dailyStats = new DailyStats({
        userId,
        date: today,
      });
    }

    
      // Fetch information about the Email user
      const emailUser = await User.findById(emailUserId);

      if (emailUser) {
        // Track Email users (if not already tracked)
        const emailUserInfo = {
          userId: emailUserId,
          timestamp: new Date(),
        };

        if (
          !dailyStats.emailUsers.some(
            (user) => user.userId && user.userId.toString() === emailUserId
          )
        ) {
          dailyStats.emailUsers.push(emailUserInfo);
          // Update the dailyStats document
          dailyStats.emailCount += 1;
        }

        // Save the dailyStats document
        await dailyStats.save();

        res.json({ success: true });
      } else {
        res.json({ success: false, message: "Email user not found" });
      }
    } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Export the controller
export default emailCount;
