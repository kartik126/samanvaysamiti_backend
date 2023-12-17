import mongoose, { Schema } from "mongoose";

let mandalSchema = new Schema({
  email: {
    type: "string",
  },
  phone: {
    type: "string",
  },
  mandal_name: {
    type: "string",
  },
  member_name: {
    type: "string",
  },
  designation: {
    type: "string",
  },
  photo: {
    type: "string",
  },
});

let Mandal = mongoose.model("Mandal", mandalSchema);

export default Mandal;
