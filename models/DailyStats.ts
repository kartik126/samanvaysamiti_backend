import mongoose, { Schema } from "mongoose";
import cron from "node-cron";

const dailyStatsSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  callCount: {
    type: Number,
    default: 0,
  },
  whatsappCount: {
    type: Number,
    default: 0,
  },
  emailCount: {
    type: Number,
    default: 0,
  },
  telephoneCount: {
    type: Number,
    default: 0,
  },
  profileDownloadCount: {
    type: Number,
    default: 0,
  },
  calledUsers: [
    {
      _id: false,
      userId: { type: Schema.Types.ObjectId, ref: "User" },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  whatsappUsers: [
    {
      _id: false,
      userId: { type: Schema.Types.ObjectId, ref: "User" },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  emailUsers: [
    {
      _id: false,
      userId: { type: Schema.Types.ObjectId, ref: "User" },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  telephoneUsers: [
    {
      _id: false,
      userId: { type: Schema.Types.ObjectId, ref: "User" },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  downloadedProfiles: [
    {
      _id: false,
      userId: { type: Schema.Types.ObjectId, ref: "User" },
      timestamp: { type: Date, default: Date.now },
      name: String,
      serial_no: String,
    },
  ],
});

const DailyStats = mongoose.model("DailyStats", dailyStatsSchema);

cron.schedule("0 0 * * *", async () => {
  try {
    // Reset the counts for a new day
    await DailyStats.updateMany(
      {},
      {
        $set: {
          callCount: 0,
          whatsappCount: 0,
          profileDownloadCount: 0,
          emailCount: 0,
        },
      }
    );
    console.log("Counts reset for a new day");
  } catch (error) {
    console.error("Error resetting counts:", error);
  }
});
export default DailyStats;
