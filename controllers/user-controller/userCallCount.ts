// Import necessary modules
import { Request, Response } from "express";
import User from "../../models/user";
import DailyStats from "../../models/DailyStats";

// Controller to update call count and track called users
const callCount = async (req: Request, res: Response) => {
  const userId = req.body.user._id;
  const calledUserId = req.body.calledUserId;
  const calledUserNumber = req.body.calledUserNumber;

  try {
    let dailyStats = await DailyStats.findOne({ userId });

    if (!dailyStats) {
      // If no dailyStats document exists, create a new one
      dailyStats = new DailyStats({
        userId
      });
    }

    // Check if the user has reached the call limit for the day
    if (dailyStats.callCount < 20) {
      // Fetch information about the user being called
      const calledUser = await User.findById(calledUserId);

      if (calledUser) {
        // Track users called (if not already tracked)
        const calledUserInfo = {
          userId: calledUserId,
          number : calledUserNumber,
          timestamp: new Date(),
        };

        if (
          !dailyStats.calledUsers.some(
            (user) => user.userId && user.userId.toString() === calledUserId && user.number === calledUserNumber
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
        res.json({ success: false, message: "User not found" });
      }
    } else {
      res.json({
        success: false,
        message: `आपण दिवसाचे कॉल सीमा ओलांडली आहे, कृपया उदया पुन्हा प्रयत्न करा.${"\n"} You have exceeded the daily call limit, please try again Tomorrow.`,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Export the controller
export default callCount;
