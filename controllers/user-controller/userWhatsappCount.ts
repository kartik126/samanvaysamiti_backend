// Import necessary modules
import { Request, Response } from 'express';
import User from '../../models/user';

// Controller to update WhatsApp count and track WhatsApp users
const whatsappCount = async (req: Request, res: Response) => {
  const userId = req.body.user._id;
  const whatsappUserId = req.body.whatsappUserId; // Assuming you pass the WhatsApp user's ID in the request

  try {
    // Find the user by ID
    const user = await User.findById(userId);

    // Update whatsapp_profiles_count
    // @ts-ignore
    user?.whatsapp_profiles_count += 1;

    // Track WhatsApp user (add whatsappUserId to the whatsappUsers array)
    if (whatsappUserId && !user?.whatsappUsers.includes(whatsappUserId)) {
      user?.whatsappUsers.push(whatsappUserId);
    }

    // Save the updated user document
    await user?.save();

    // Return a response or do other necessary actions
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Export the controller
export default whatsappCount;
