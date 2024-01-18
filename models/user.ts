import mongoose, { Error, Schema, SchemaTypes } from "mongoose";

const contactCardSchema = new Schema({
  type: { type: String, required: true }, // e.g., "father", "mother", "brother_in_law", etc.
  contactCard: { type: Schema.Types.ObjectId, ref: "ContactCard" },
});

let userSchema = new Schema({
  serial_no: {
    type: String,
    required: false,
  },
  phone: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  otp: {
    type: String,
  },
  referred_by: {
    type: String,
  },
  // downloaded_profiles_count: { type: Number, default: 0 },
  // downloadedProfiles: [{ type: Schema.Types.ObjectId, ref: "User" }],
  // call_profiles_count: { type: Number, default: 0 },
  // calledUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
  // whatsapp_profiles_count: { type: Number, default: 0 },
  // whatsappUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
  personal_details: {
    fullname: {
      type: String,
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
    birth_name: {
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
    height_cm: {
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
    age: {
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
    profession: {
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
    work_city: {
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
    phone_number: {
      type: String,
      maxlength: 10,
    },
    email: {
      type: String,
    },
    consanguineous_marriage: {
      type: String,
    },
    mobile: {
      type: String,
      maxlength: 10,
    },
    current_address: {
      type: String,
    },
    partner_expectations: {
      type: String,
    },
  },
  family_details: {
    father: {},
    guardian: { type: String },
    guardians_profession: {
      type: String,
    },
    designation: {
      type: String,
    },
    address: {
      type: String,
    },
    mother: {},
  },
  brothers_details: {
    brother_unmarried: {
      type: String,
    },
    brother_married: {
      type: String,
    },
    father_in_law: {},
    brothers: {},
  },
  sisters_details: {
    sisters_unmarried: {
      type: String,
    },
    sisters_married: {
      type: String,
    },
    brother_in_law: {},
    sisters: {},
  },
  fathers_family_details: {
    grandfather: {},
    // grandfather_name: {
    //   type: String,
    // },
    // grandfather_village: {
    //   type: String,
    // },
    kaka: {},
    fuva: {},
  },
  mothers_family_details: {
    grandfather: {},
    // grandfather_name: {
    //   type: String,
    // },
    // grandfather_village: {
    //   type: String,
    // },
    mama: {},
    mavsa: {},
  },
  featured: {
    type: Boolean,
    default: false,
  },
  user_status: {
    type: String,
  },
  role: {
    type: String,
    default: "user",
  },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpires: {
    type: Number,
  },
});




userSchema.pre("save", async function (next) {
  try {
    // Check if the serial_no is already set (e.g., during the cron job)
    if (this.serial_no) {
      return next();
    }

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear().toString().slice(-2);

    // Find the highest existing serial_no for the current year
    const highestSerialNo = await mongoose
      .model("User")
      .findOne({ serial_no: { $regex: `^${currentYear}` } })
      .sort({ serial_no: -1 });

    let nextSerialNo;
    if (highestSerialNo) {
      const lastSerialNo = parseInt(highestSerialNo.serial_no.slice(-4));
      nextSerialNo = `${currentYear}${("0000" + (lastSerialNo + 1)).slice(-4)}`;
    } else {
      // If no existing serial_no for the current year, start with 0001
      nextSerialNo = `${currentYear}0001`;
    }

    this.serial_no = nextSerialNo;
    next();
  } catch (error: any) {
    // Handle any errors, log, and pass it to the next middleware
    console.error("Error generating serial number:", error);
    next(error);
  }
});

let User = mongoose.model("User", userSchema);

export default User;
