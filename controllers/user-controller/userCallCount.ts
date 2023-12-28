// Import necessary modules
import { Request, Response } from "express";
import User from "../../models/user";
import DailyStats from "../../models/DailyStats";

// Controller to update call count and track called users
const callCount = async (req: Request, res: Response) => {
  const userId = req.body.user._id;
  const calledUserId = req.body.calledUserId;

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

    // Check if the user has reached the call limit for the day
    if (dailyStats.callCount < 10) {
      // Fetch information about the user being called
      const calledUser = await User.findById(calledUserId);

      if (calledUser) {
        // Track users called (if not already tracked)
        const calledUserInfo = {
          userId: calledUserId,
          timestamp: new Date(),
        };

        if (
          !dailyStats.calledUsers.some(
            (user) => user.userId && user.userId.toString() === calledUserId
          )
        ) {
          dailyStats.calledUsers.push(calledUserInfo);
          // Update the dailyStats document
          dailyStats.callCount += 1;
        }

        // Save the dailyStats document
        await dailyStats.save();

        res.json({ success: true });
      } else {
        res.status(400).json({ success: false, message: "User not found" });
      }
    } else {
      res
        .status(400)
        .json({ success: false, message: "Call limit exceeded for the day" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Export the controller
export default callCount;
