import mongoose, { Schema } from "mongoose";

const contactCardSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  name: { type: String },
  phone : {type:String},
  email: {type :String},
  whatsapp : {type:String},
  mobile: { type: String },
  address: { type: String },
});

const ContactCard = mongoose.model("ContactCard", contactCardSchema);

export default ContactCard;
