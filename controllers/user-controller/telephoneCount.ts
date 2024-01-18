// Import necessary modules
import { Request, Response } from "express";
import User from "../../models/user";
import DailyStats from "../../models/DailyStats";

// Controller to update telephone count and track users who make telephone calls
const telephoneCount = async (req: Request, res: Response) => {
  const userId = req.body.user._id;
  const telephoneUserId = req.body.telephoneUserId; // Assuming you pass the telephone user's ID in the request
  const telephoneUserNumber = req.body.telephoneUserNumber;

  try {
    let dailyStats = await DailyStats.findOne({ userId});

    if (!dailyStats) {
      // If no dailyStats document exists, create a new one
      dailyStats = new DailyStats({
        userId
      });
    }

    // Check if the user has reached the telephone call limit for the day
    if (dailyStats.telephoneCount < 10) {
      // Fetch information about the telephone user
      const telephoneUser = await User.findById(telephoneUserId);

      if (telephoneUser) {
        // Track users who make telephone calls (if not already tracked)
        const telephoneUserInfo = {
          userId: telephoneUserId,
          number:telephoneUserNumber,
          timestamp: new Date(),
        };

        if (
          !dailyStats.telephoneUsers.some(
            (user) => user.userId && user.userId.toString() === telephoneUserId && user.number === telephoneUserNumber
          )
        ) {
          dailyStats.telephoneUsers.push(telephoneUserInfo);
          // Update the dailyStats document
          dailyStats.telephoneCount += 1;
        }

        // Save the dailyStats document
        await dailyStats.save();

        res.json({ success: true });
      } else {
        res.json({ success: false, message: "Telephone user not found" });
      }
    } else {
      res.json({
          success: false,
          message: "Telephone call limit exceeded for the day",
        });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Export the controller
export default telephoneCount;
