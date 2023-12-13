import { Request, Response } from "express";
import User from "../../models/user";
import { z } from "zod";

// Zod schema for request data validation
const userSchema = z.object({
  phone: z.string(),
  email: z.string().email(),
  personal_details: z.object({
    fullname: z.string().min(3).max(20),
    gender: z.string(),
    birth_date: z.string(),
    birth_time: z.string(),
    birth_place: z.string(),
    height: z.string(),
    blood_group: z.string(),
    weight: z.string(),
    gotra: z.string(),
    kuldevi: z.string(),
  }),
  educational_details: z.object({
    education_level: z.string(),
    education_detail: z.string(),
    special_education: z.string(),
    special_information: z.string(),
  }),
  professional_details: z.object({
    professiona: z.string(),
    job_title: z.string(),
    company_name: z.string(),
    job_address: z.string(),
    weekly_holiday: z.string(),
    monthly_income: z.string(),
    payment_currency: z.string(),
  }),
  contact_details: z.object({
    mobile: z.string().max(10),
    phone: z.string().max(10),
    email: z.string(),
    current_address: z.string(),
    partner_expectations: z.string(),
  }),
  family_details: z.object({
    fathers_name: z.string(),
    guardians_profession: z.string(),
    designation: z.string(),
    address: z.string(),
    parents_phone: z.string(),
    mothers_name: z.string(),
    mothers_phone: z.string(),
  }),
  brothers_details: z.object({
    brother_unmarried: z.string(),
    brother_married: z.string(),
    father_in_lows_name: z.string(),
    father_in_lows_phone: z.string(),
  }),
  sisters_details: z.object({
    sisters_unmarried: z.string(),
    sisters_married: z.string(),
    brothers_in_lows_name: z.string(),
    brothers_in_lows_phone: z.string(),
  }),
  fathers_family_details: z.object({
    grandfather_name: z.string(),
    grandfather_village: z.string(),
    kaka_name: z.string(),
    kaka_village: z.string(),
    kaka_phone: z.string(),
    fuva_name: z.string(),
    fuva_village: z.string(),
    fuva_phone: z.string(),
  }),
  mothers_family_details: z.object({
    grandfather_name: z.string(),
    grandfather_village: z.string(),
    mama_name: z.string(),
    mama_village: z.string(),
    mama_phone: z.string(),
    mavsa_name: z.string(),
    mavsa_village: z.string(),
    mavsa_phone: z.string(),
  }),
});

let addUser = async (req: Request, res: Response) => {
  try {
    let requestBody = userSchema.parse(req.body);
    // Check if the email or phone already exists
    const existingUser = await User.findOne({
      $or: [
        { email: requestBody.contact_details.email },
        { phone: requestBody.contact_details.phone },
      ],
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email or phone already exists" });
    }
    let user = new User({
      phone:requestBody.phone,
      email:requestBody.email,
      personal_details: requestBody.personal_details,
      educational_details: requestBody.educational_details,
      professional_details: requestBody.professional_details,
      contact_details: requestBody.contact_details,
      family_details: requestBody.family_details,
      brothers_details: requestBody.brothers_details,
      sisters_details: requestBody.sisters_details,
      fathers_family_details: requestBody.fathers_family_details,
      mothers_family_details: requestBody.mothers_family_details,
    });

    await user.save();

    return res.status(200).send({
      message: "User created successfully",
      user: user,
    });
  } catch (e) {
    res.status(500).send(e);
    console.log({ error: e });
  }
};

export default addUser;
