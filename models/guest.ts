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
});

const Guest = mongoose.model("Guest", guestSchema);

export default Guest;
