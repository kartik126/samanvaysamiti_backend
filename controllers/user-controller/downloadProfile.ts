// Import necessary modules
import { Request, Response } from 'express';
import User from '../../models/user';

// Controller to update downloaded profiles count and track downloaded profiles
const downloadProfile = async (req: Request, res: Response) => {
  const userId = req.body.user._id;
  const downloadedUserId = req.body.downloadedUserId; // Assuming you pass the downloaded user's ID in the request

  try {
    // Find the user by ID
    const user = await User.findById(userId);

    // Update downloaded_profiles_count
    // @ts-ignore
    user?.downloaded_profiles_count += 1;

    // Track downloaded profile (add downloadedUserId to the downloadedProfiles array)
    if (downloadedUserId && !user?.downloadedProfiles.includes(downloadedUserId)) {
      user?.downloadedProfiles.push(downloadedUserId);
    }

    // Save the updated user document
    await user?.save();

    // Return a response or do other necessary actions
    res.json({ success: true, message: 'Profile downloaded successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Export the controller
export default downloadProfile;
