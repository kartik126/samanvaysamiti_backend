import { Request, Response } from "express";
import User from "../../models/user";
import { z } from "zod";
import { uploadToS3 } from "../../utils/uploadToS3";
import { hashPasswordSecurely } from "../../utils/hashPasswordSecurely";

interface FileArray extends Array<Express.Multer.File> {}

// Zod schema for request data validation
const userSchema = z.object({
  phone: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().optional(),
});

let editUser = async (req: Request, res: Response) => {
  try {
    console.log("id from toke================================>", req.body.user);
    const userIdFromToken = req.body.user._id;

    // Check if the user with the given userId exists
    const existingUser:any = await User.findById(userIdFromToken);

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("request body------------------------------------>", req.body);

    let requestBody = userSchema.parse(req.body);

    // Check if the updated email or phone already exists for a different user
    const duplicateUser = await User.findOne({
      $and: [
        { $or: [{ email: requestBody.email }, { phone: requestBody.phone }] },
        { _id: { $ne: userIdFromToken } },
      ],
    });

    if (duplicateUser) {
      return res.status(400).json({ message: "Email or phone already exists" });
    }

    // Update user fields based on the request body
    if (requestBody.phone) {
      existingUser.phone = requestBody.phone;
    }
    if (requestBody.email) {
      existingUser.email = requestBody.email;
    }

    if (requestBody.password) {
      existingUser.password = await hashPasswordSecurely(requestBody.password);
    }

    const files = req.files as FileArray;

    // Upload multiple images to S3
    const imageBuffers = files?.map((file) => file.buffer);

    let photoUrls: string[] | undefined;

    if (imageBuffers) {
      photoUrls = await Promise.all(
        imageBuffers.map(
          async (buffer) => await uploadToS3(existingUser?.email, buffer)
        )
      );
    }

    console.log("photo==============>",photoUrls)

    const personalDetailsRequest = req.body.personal_details;

    if (personalDetailsRequest || imageBuffers) {
      existingUser.personal_details = {
        fullname:
          personalDetailsRequest?.fullname ||
          existingUser?.personal_details?.fullname,
        gender:
          personalDetailsRequest?.gender ||
          existingUser.personal_details?.gender,
        photo: photoUrls || existingUser.personal_details?.photo,
        birth_date:
          personalDetailsRequest?.birth_date ||
          existingUser.personal_details?.birth_date,
        birth_name:
          personalDetailsRequest?.birth_name ||
          existingUser.personal_details?.birth_name,
        birth_time:
          personalDetailsRequest?.birth_time ||
          existingUser.personal_details?.birth_time,
        birth_place:
          personalDetailsRequest?.birth_place ||
          existingUser.personal_details?.birth_place,
        height:
          personalDetailsRequest?.height ||
          existingUser.personal_details?.height,
        blood_group:
          personalDetailsRequest?.blood_group ||
          existingUser.personal_details?.blood_group,
        weight:
          personalDetailsRequest?.weight ||
          existingUser.personal_details?.weight,
        gotra:
          personalDetailsRequest?.gotra || existingUser.personal_details?.gotra,
        kuldevi:
          personalDetailsRequest?.kuldevi ||
          existingUser.personal_details?.kuldevi,
        age: personalDetailsRequest?.age || existingUser.personal_details?.age,
      };
    }

    const educationDetailsRequest = req.body?.educational_details;

    if (educationDetailsRequest) {
      existingUser.educational_details = {
        education_level:
          educationDetailsRequest?.education_level ||
          existingUser.educational_details?.education_level,
        education_detail:
          educationDetailsRequest?.education_detail ||
          existingUser.educational_details?.education_detail,
        special_education:
          educationDetailsRequest?.special_education ||
          existingUser.educational_details?.special_education,
        special_information:
          educationDetailsRequest?.special_information ||
          existingUser.educational_details?.special_information,
      };
    }
    const professionalDetailsRequest = req.body.professional_details;

    if (professionalDetailsRequest) {
      existingUser.professional_details = {
        profession:
          professionalDetailsRequest?.profession ||
          existingUser.professional_details?.profession,
        job_title:
          professionalDetailsRequest?.job_title ||
          existingUser.professional_details?.job_title,
        company_name:
          professionalDetailsRequest?.company_name ||
          existingUser.professional_details?.company_name,
        work_city:
          professionalDetailsRequest?.work_city ||
          existingUser.professional_details?.work_city,
        job_address:
          professionalDetailsRequest?.job_address ||
          existingUser.professional_details?.job_address,
        weekly_holiday:
          professionalDetailsRequest?.weekly_holiday ||
          existingUser.professional_details?.weekly_holiday,
        monthly_income:
          professionalDetailsRequest?.monthly_income ||
          existingUser.professional_details?.monthly_income,
        payment_currency:
          professionalDetailsRequest?.payment_currency ||
          existingUser.professional_details?.payment_currency,
      };
    }

    const contactDetailsRequest = req.body.contact_details;

    if (contactDetailsRequest) {
      existingUser.contact_details = {
        phone_number:
          contactDetailsRequest?.phone_number ||
          existingUser.contact_details?.phone_number,
        email:
          contactDetailsRequest?.email || existingUser.contact_details?.email,
        consanguineous_marriage:
          contactDetailsRequest?.consanguineous_marriage ||
          existingUser.contact_details?.consanguineous_marriage,
        mobile:
          contactDetailsRequest?.mobile || existingUser.contact_details?.mobile,
        current_address:
          contactDetailsRequest?.current_address ||
          existingUser.contact_details?.current_address,
        partner_expectations:
          contactDetailsRequest?.partner_expectations ||
          existingUser.contact_details?.partner_expectations,
      };
    }

    const familyDetailsRequest = req.body.family_details;

    if (familyDetailsRequest) {
      existingUser.family_details = {
        fathers_name:
          familyDetailsRequest?.fathers_name ||
          existingUser.family_details?.fathers_name,
        guardians_profession:
          familyDetailsRequest?.guardians_profession ||
          existingUser.family_details?.guardians_profession,
        designation:
          familyDetailsRequest?.designation ||
          existingUser.family_details?.designation,
        address:
          familyDetailsRequest?.address || existingUser.family_details?.address,
        parents_phone:
          familyDetailsRequest?.parents_phone ||
          existingUser.family_details?.parents_phone,
        mothers_name:
          familyDetailsRequest?.mothers_name ||
          existingUser.family_details?.mothers_name,
        mothers_phone:
          familyDetailsRequest?.mothers_phone ||
          existingUser.family_details?.mothers_phone,
      };
    }

    const brotherDetailsRequest = req.body.brothers_details;

    if (brotherDetailsRequest) {
      existingUser.brothers_details = {
        brother_unmarried:
          brotherDetailsRequest?.brother_unmarried ||
          existingUser.brothers_details?.brother_unmarried,
        brother_married:
          brotherDetailsRequest?.brother_married ||
          existingUser.brothers_details?.brother_married,
        father_in_law_name_phone:
          brotherDetailsRequest?.father_in_law_name_phone ||
          existingUser.brothers_details?.father_in_law_name_phone,
      };
    }

    const sisterDetailsRequest = req.body.sisters_details;

    if (sisterDetailsRequest) {
      existingUser.sisters_details = {
        sisters_unmarried:
          sisterDetailsRequest?.sisters_unmarried ||
          existingUser.sisters_details?.sisters_unmarried,
        sisters_married:
          sisterDetailsRequest?.sisters_married ||
          existingUser.sisters_details?.sisters_married,
        brothers_in_law_name_phone:
          sisterDetailsRequest?.brothers_in_law_name_phone ||
          existingUser.sisters_details?.brothers_in_law_name_phone,
      };
    }

    const fatherFamilyDetailsRequest = req.body.fathers_family_details;

    if (fatherFamilyDetailsRequest) {
      existingUser.fathers_family_details = {
        grandfather_name:
          fatherFamilyDetailsRequest?.grandfather_name ||
          existingUser.fathers_family_details?.grandfather_name,
        grandfather_village:
          fatherFamilyDetailsRequest?.grandfather_village ||
          existingUser.fathers_family_details?.grandfather_village,
        kaka:
          fatherFamilyDetailsRequest?.kaka ||
          existingUser.fathers_family_details?.kaka,
        fuva:
          fatherFamilyDetailsRequest?.fuva ||
          existingUser.fathers_family_details?.fuva,
      };
    }

    const motherFamilyDetailsRequest = req.body.mothers_family_details;

    if (motherFamilyDetailsRequest) {
      existingUser.mothers_family_details = {
        grandfather_name:
          motherFamilyDetailsRequest?.grandfather_name ||
          existingUser.mothers_family_details?.grandfather_name,
        grandfather_village:
          motherFamilyDetailsRequest?.grandfather_village ||
          existingUser.mothers_family_details?.grandfather_village,
        mama:
          motherFamilyDetailsRequest?.mama ||
          existingUser.mothers_family_details?.mama,
        mavsa:
          motherFamilyDetailsRequest?.mavsa ||
          existingUser.mothers_family_details?.mavsa,
      };
    }

    await existingUser.save();

    return res.status(200).send({
      message: "User updated successfully",
      status:true,
      user:existingUser
    });
  } catch (e) {
    res.status(500).send(e);
    console.log({ error: e });
  }
};

export default editUser;
