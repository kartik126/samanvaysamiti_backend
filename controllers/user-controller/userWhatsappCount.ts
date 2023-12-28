// Import necessary modules
import { Request, Response } from "express";
import User from "../../models/user";
import DailyStats from "../../models/DailyStats";

// Controller to update WhatsApp count and track WhatsApp users
const whatsappCount = async (req: Request, res: Response) => {
  const userId = req.body.user._id;
  const whatsappUserId = req.body.whatsappUserId;

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

    // Check if the user has reached the WhatsApp limit for the day
    if (dailyStats.whatsappCount < 10) {
      // Fetch information about the WhatsApp user
      const whatsappUser = await User.findById(whatsappUserId);

      if (whatsappUser) {
        // Track WhatsApp users (if not already tracked)
        const whatsappUserInfo = {
          userId: whatsappUserId,
          timestamp: new Date(),
        };

        if (
          !dailyStats.whatsappUsers.some(
            (user) => user.userId && user.userId.toString() === whatsappUserId
          )
        ) {
          dailyStats.whatsappUsers.push(whatsappUserInfo);
          // Update the dailyStats document
          dailyStats.whatsappCount += 1;
        }

        // Save the dailyStats document
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
