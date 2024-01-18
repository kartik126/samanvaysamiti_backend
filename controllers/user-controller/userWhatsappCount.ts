// Import necessary modules
import { Request, Response } from "express";
import User from "../../models/user";
import DailyStats from "../../models/DailyStats";

// Controller to update WhatsApp count and track WhatsApp users
const whatsappCount = async (req: Request, res: Response) => {
  const userId = req.body.user._id;
  const whatsappUserId = req.body.whatsappUserId;
  const whatsappUserNumber = req.body.whatsappUserNumber;

  try {
    // No date constraint in the query
    let dailyStats = await DailyStats.findOne({ userId });

    if (!dailyStats) {
      // If no document exists, create a new one
      dailyStats = new DailyStats({
        userId,
      });
    }

    if (dailyStats.whatsappCount < 10) {
      const whatsappUser = await User.findById(whatsappUserId);

      if (whatsappUser) {
        const whatsappUserInfo = {
          userId: whatsappUserId,
          number:whatsappUserNumber,
          timestamp: new Date(),
        };

        // Check if the user is already tracked
        const isUserTracked = dailyStats.whatsappUsers.some(
          (user) =>
            user.userId &&
            user.userId.toString() === whatsappUserId &&
            user.number === whatsappUserNumber
        );

        if (!isUserTracked) {
          dailyStats.whatsappUsers.push(whatsappUserInfo);
          dailyStats.whatsappCount += 1;
        }

        await dailyStats.save();
        res.json({ success: true });
      } else {
        res.json({ success: false, message: "WhatsApp user not found" });
      }
    } else {
      res.json({
        success: false,
        message: "WhatsApp limit exceeded for the day",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Export the controller
export default whatsappCount;
