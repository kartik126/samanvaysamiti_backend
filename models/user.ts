import mongoose, { Schema, SchemaTypes } from "mongoose";

let userSchema = new Schema({
  serial_no: {
    type: String,
    required: false,
  },
  phone: {
    type: String,
    maxlength: 10,
  },
  email: {
    type: String,
  },
  otp: {
    type: String,
  },
  referred_by: {
    type: String,
  },
  downloaded_profiles_count: { type: Number, default: 0 },
  call_profiles_count: { type: Number, default: 0 },
  whatsapp_profiles_count: { type: Number, default: 0 },
  personal_details: {
    fullname: {
      type: String,
      minlength: 3,
      maxlength: 20,
    },
    gender: {
      type: String,
    },
    photo: {
      type: [String],
    },
    birth_date: {
      type: String,
    },
    birth_time: {
      type: String,
    },
    birth_place: {
      type: String,
    },
    height: {
      type: String,
    },
    blood_group: {
      type: String,
    },
    weight: {
      type: String,
    },
    gotra: {
      type: String,
    },
    kuldevi: {
      type: String,
    },
  },
  educational_details: {
    education_level: {
      type: String,
    },
    education_detail: {
      type: String,
    },
    special_education: {
      type: String,
    },
    special_information: {
      type: String,
    },
  },
  professional_details: {
    professiona: {
      type: String,
    },
    job_title: {
      type: String,
    },
    company_name: {
      type: String,
    },
    job_address: {
      type: String,
    },
    weekly_holiday: {
      type: String,
    },
    monthly_income: {
      type: String,
    },
    payment_currency: {
      type: String,
    },
  },
  contact_details: {
    mobile: {
      type: String,
      maxlength: 10,
    },
    phone: {
      type: String,
      maxlength: 10,
    },
    email: {
      type: String,
    },
    current_address: {
      type: String,
    },
    partner_expectations: {
      type: String,
    },
  },
  family_details: {
    fathers_name: {
      type: String,
    },
    guardians_profession: {
      type: String,
    },
    designation: {
      type: String,
    },
    address: {
      type: String,
    },
    parents_phone: {
      type: String,
      maxlength: 10,
    },
    mothers_name: {
      type: String,
    },
    mothers_phone: {
      type: String,
      maxlength: 10,
    },
  },
  brothers_details: {
    brother_unmarried: {
      type: String,
    },
    brother_married: {
      type: String,
    },
    father_in_lows_name: {
      type: String,
    },
    father_in_lows_phone: {
      type: String,
      maxlength: 10,
    },
  },
  sisters_details: {
    sisters_unmarried: {
      type: String,
    },
    sisters_married: {
      type: String,
    },
    brothers_in_lows_name: {
      type: String,
    },
    brothers_in_lows_phone: {
      type: String,
      maxlength: 10,
    },
  },
  fathers_family_details: {
    grandfather_name: {
      type: String,
    },
    grandfather_village: {
      type: String,
    },
    kaka_name: {
      type: String,
    },
    kaka_village: {
      type: String,
    },
    kaka_phone: {
      type: String,
      maxlength: 10,
    },
    fuva_name: {
      type: String,
    },
    fuva_village: {
      type: String,
    },
    fuva_phone: {
      type: String,
      maxlength: 10,
    },
  },
  mothers_family_details: {
    grandfather_name: {
      type: String,
    },
    grandfather_village: {
      type: String,
    },
    mama_name: {
      type: String,
    },
    mama_village: {
      type: String,
    },
    mama_phone: {
      type: String,
      maxlength: 10,
    },
    mavsa_name: {
      type: String,
    },
    mavsa_village: {
      type: String,
    },
    mavsa_phone: {
      type: String,
      maxlength: 10,
    },
  },
  featured: {
    type: Boolean,
    default: false,
  },
});

userSchema.pre("save", async function (next) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear().toString().slice(-2);

  // Find the highest existing serial_no for the current year
  const highestSerialNo = await mongoose
    .model("User")
    .find({ serial_no: { $regex: `^${currentYear}` } })
    .sort({ serial_no: -1 })
    .limit(1);

  let nextSerialNo;
  if (highestSerialNo && highestSerialNo.length > 0) {
    const lastSerialNo = parseInt(highestSerialNo[0].serial_no.slice(-4));
    nextSerialNo = `${currentYear}${("0000" + (lastSerialNo + 1)).slice(-4)}`;
  } else {
    // If no existing serial_no for the current year, start with 0001
    nextSerialNo = `${currentYear}0001`;
  }

  this.serial_no = nextSerialNo;
  next();
});

let User = mongoose.model("User", userSchema);

export default User;
