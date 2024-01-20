// Import necessary modules
import { Request, Response } from "express";
import User from "../../models/user";
import DailyStats from "../../models/DailyStats";

// Controller to update download profile count and track users who download profiles
const downloadProfile = async (req: Request, res: Response) => {
  const userId = req.body.user._id;
  const downloadedUserId = req.body.downloadedUserId; // Assuming you pass the downloaded user's ID in the request

  try {
    let dailyStats = await DailyStats.findOne({ userId });

    if (!dailyStats) {
      // If no dailyStats document exists, create a new one
      dailyStats = new DailyStats({
        userId
      });
    }

    // Check if the user has reached the download profile limit for the day
    if (dailyStats.profileDownloadCount < 10) {
      // Fetch information about the downloaded user
      const downloadedUser = await User.findById(downloadedUserId);

      if (downloadedUser) {
        // Track users who download profiles (if not already tracked)
        const downloadedUserInfo = {
          userId: downloadedUserId,
          name: downloadedUser.personal_details?.fullname,
          serial_no: downloadedUser.serial_no,
          timestamp: new Date(),
        };

        if (
          !dailyStats.downloadedProfiles.some(
            (user) => user.userId && user.userId.toString() === downloadedUserId
          )
        ) {
          dailyStats.downloadedProfiles.push(downloadedUserInfo);
          // Update the dailyStats document
          dailyStats.profileDownloadCount += 1;
        }
        else{
          dailyStats.downloadedProfiles.push(downloadedUserInfo);
        }

        // Save the dailyStats document
        await dailyStats.save();

        res.json({ success: true });
      } else {
        res.json({ success: false, message: "Downloaded user not found" });
      }
    } else {
      res.json({
          success: false,
          message: "Download profile limit exceeded for the day",
        });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Export the controller
export default downloadProfile;
