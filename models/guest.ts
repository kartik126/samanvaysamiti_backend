import mongoose from "mongoose";
const Schema = mongoose.Schema;

const guestSchema = new Schema({
  fullname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: false,
  },
  status: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    default: "relative",
  },
});

const Guest = mongoose.model("Guest", guestSchema);

export default Guest;
