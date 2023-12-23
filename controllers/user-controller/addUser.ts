import { Request, Response } from "express";
import User from "../../models/user";
import { z } from "zod";
import { uploadToS3 } from "../../utils/uploadToS3";

interface FileArray extends Array<Express.Multer.File> {}

// Zod schema for request data validation
const userSchema = z.object({
  phone: z.string(),
  email: z.string().email(),
  featured: z
    .boolean()
    .transform((value) => String(value).toLowerCase() === "true"),
});

let addUser = async (req: Request, res: Response) => {
  try {
    console.log("request body------------------------------------>", req.body);

    let requestBody = userSchema.parse(req.body);

    // Check if the email or phone already exists
    const existingUser = await User.findOne({
      $or: [{ email: requestBody.email }, { phone: requestBody.phone }],
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email or phone already exists" });
    }

    // Explicit type assertion for req.files
    const files = req.files as FileArray;

    // Upload multiple images to S3
    const imageBuffers = files?.map((file) => file.buffer);

    if (!imageBuffers || imageBuffers.length === 0) {
      return res.status(404).json({ message: "Please provide profile images" });
    }

    const photoUrls = await Promise.all(
      imageBuffers.map(
        async (buffer) => await uploadToS3(requestBody.email, buffer)
      )
    );

    const personalDetailsRequest = req.body.personal_details;

    const personalDetails = {
      fullname: personalDetailsRequest.fullname,
      gender: personalDetailsRequest.gender,
      photo: photoUrls,
      birth_date: personalDetailsRequest.birth_date,
      birth_name: personalDetailsRequest.birth_name,
      birth_time: personalDetailsRequest.birth_time,
      birth_place: personalDetailsRequest.birth_place,
      height: personalDetailsRequest.height,
      blood_group: personalDetailsRequest.blood_group,
      weight: personalDetailsRequest.weight,
      gotra: personalDetailsRequest.gotra,
      kuldevi: personalDetailsRequest.kuldevi,
      age: personalDetailsRequest.age,
    };

    const educationDetailsRequest = req.body?.educational_details;

    const educationDetails = {
      education_level: educationDetailsRequest?.education_level,
      education_detail: educationDetailsRequest?.education_detail,
      special_education: educationDetailsRequest?.special_education,
      special_information: educationDetailsRequest?.special_information,
    };

    const professionalDetailsRequest = req.body.professional_details;

    const professionalDetails = {
      profession: professionalDetailsRequest?.profession,
      job_title: professionalDetailsRequest?.job_title,
      company_name: professionalDetailsRequest?.company_name,
      work_city: professionalDetailsRequest?.work_city,
      job_address: professionalDetailsRequest?.job_address,
      weekly_holiday: professionalDetailsRequest?.weekly_holiday,
      monthly_income: professionalDetailsRequest?.monthly_income,
      payment_currency: professionalDetailsRequest?.payment_currency,
    };

    const contactDetailsRequest = req.body.contact_details;

    const contactDetails = {
      phone: contactDetailsRequest?.phone_number,
      email: contactDetailsRequest?.email,
      consanguineous_marriage: contactDetailsRequest?.consanguineous_marriage,
      mobile: contactDetailsRequest?.mobile,
      current_address: contactDetailsRequest?.current_address,
      partner_expectations: contactDetailsRequest?.partner_expectations,
    };

    const familyDetailsRequest = req.body.family_details;

    const familyDetails = {
      fathers_name: familyDetailsRequest?.fathers_name,
      guardians_profession: familyDetailsRequest?.guardians_profession,
      designation: familyDetailsRequest?.designation,
      address: familyDetailsRequest?.address,
      parents_phone: familyDetailsRequest?.parents_phone,
      mothers_name: familyDetailsRequest?.mothers_name,
      mothers_phone: familyDetailsRequest?.mothers_phone,
    };

    const brotherDetailsRequest = req.body.brothers_details;

    const brotherDetails = {
      brother_unmarried: brotherDetailsRequest?.brother_unmarried,
      brother_married: brotherDetailsRequest?.brother_married,
      father_in_law_name_phone: brotherDetailsRequest?.father_in_law_name_phone,
    };

    const sisterDetailsRequest = req.body.sisters_details;

    const sisterDetails = {
      sisters_unmarried: sisterDetailsRequest?.sisters_unmarried,
      sisters_married: sisterDetailsRequest?.sisters_married,
      brothers_in_law_name_phone:
        sisterDetailsRequest?.brothers_in_law_name_phone,
    };

    const fatherFamilyDetailsRequest = req.body.fathers_family_details;

    const fatherFamilyDetails = {
      grandfather_name: fatherFamilyDetailsRequest?.grandfather_name,
      grandfather_village: fatherFamilyDetailsRequest?.grandfather_village,
      kaka: fatherFamilyDetailsRequest?.kaka,
      fuva: fatherFamilyDetailsRequest?.fuva,
    };

    const motherFamilyDetailsRequest = req.body.mothers_family_details;

    const motherFamilyDetails = {
      grandfather_name: motherFamilyDetailsRequest?.grandfather_name,
      grandfather_village: motherFamilyDetailsRequest?.grandfather_village,
      mama: motherFamilyDetailsRequest?.mama,
      mavsa: motherFamilyDetailsRequest?.mavsa,
    };
    let user = new User({
      phone: requestBody.phone,
      email: requestBody.email,
      featured: requestBody.featured,
      personal_details: personalDetails,
      educational_details: educationDetails,
      professional_details: professionalDetails,
      contact_details: contactDetails,
      family_details: familyDetails,
      brothers_details: brotherDetails,
      sisters_details: sisterDetails,
      fathers_family_details: fatherFamilyDetails,
      mothers_family_details: motherFamilyDetails,
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
