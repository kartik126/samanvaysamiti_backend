import { Request, Response } from "express";
import User from "../../models/user";
import { z } from "zod";
import { uploadToS3 } from "../../utils/uploadToS3";
import { hashPasswordSecurely } from "../../utils/hashPasswordSecurely";
import ContactCard from "../../models/ContactCard";

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
    const existingUser: any = await User.findById(userIdFromToken);

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

    if (imageBuffers && imageBuffers.length > 0) {
      photoUrls = await Promise.all(
        imageBuffers.map(
          async (buffer) => await uploadToS3(existingUser?.email, buffer)
        )
      );
    }

    console.log("photo==============>", photoUrls);

    const personalDetailsRequest = req.body.personal_details;

    if (personalDetailsRequest || imageBuffers) {
      existingUser.personal_details = {
        fullname:
          personalDetailsRequest?.fullname ||
          existingUser?.personal_details?.fullname,
        gender:
          personalDetailsRequest?.gender ||
          existingUser.personal_details?.gender,
        photo:
          photoUrls && photoUrls.length > 0
            ? photoUrls
            : existingUser.personal_details?.photo,
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
        height_cm:
          personalDetailsRequest?.height_cm ||
          existingUser.personal_details?.height_cm,
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
      const updatedFamilyDetails: any = {}; // Create an object to store updated family details
      if (familyDetailsRequest.father) {
        const fatherContact = familyDetailsRequest.father;
        // Check if the father object exists in family_details
        if (!existingUser.family_details.father) {
          existingUser.family_details.father = {};
        }
        // Update father details
        existingUser.family_details.father = {
          salutation : fatherContact.salutation,
          name: fatherContact.name,
          phone: fatherContact.phone,
          email: fatherContact.email,
          whatsapp: fatherContact.whatsapp,
          mobile: fatherContact.mobile,
          address: fatherContact.address,
        };
      }
      if (familyDetailsRequest.mother) {
        const motherContact = familyDetailsRequest.mother;
        // Check if the father object exists in family_details
        if (!existingUser.family_details.mother) {
          existingUser.family_details.mother = {};
        }
        // Update father details
        existingUser.family_details.mother = {
          salutation: motherContact.salutation,
          name: motherContact.name,
          phone: motherContact.phone,
          email: motherContact.email,
          whatsapp: motherContact.whatsapp,
          mobile: motherContact.mobile,
          address: motherContact.address,
        };
      }

      // Update other family details
      updatedFamilyDetails.guardian =
        familyDetailsRequest?.guardian ||
        existingUser.family_details?.guardian;
      updatedFamilyDetails.guardians_profession =
        familyDetailsRequest?.guardians_profession ||
        existingUser.family_details?.guardians_profession;
      updatedFamilyDetails.designation =
        familyDetailsRequest?.designation ||
        existingUser.family_details?.designation;
      updatedFamilyDetails.address =
        familyDetailsRequest?.address || existingUser.family_details?.address;
      // Assign updated family details back to existingUser
      existingUser.family_details = {
        ...existingUser.family_details,
        ...updatedFamilyDetails,
      };
    }

    // The rest of your code...

    const brotherDetailsRequest = req.body.brothers_details;

      if (brotherDetailsRequest) {
        existingUser.brothers_details = {
          brother_unmarried:
            brotherDetailsRequest?.brother_unmarried ||
            existingUser.brothers_details?.brother_unmarried,
          brother_married:
            brotherDetailsRequest?.brother_married ||
            existingUser.brothers_details?.brother_married,
        };

        if (
          brotherDetailsRequest.father_in_law &&
          Array.isArray(brotherDetailsRequest.father_in_law)
        ) {
          // Initialize the array if it doesn't exist
          if (!existingUser.brothers_details.father_in_law) {
            existingUser.brothers_details.father_in_law = [];
          }

          // Update brothers details for each father-in-law
          existingUser.brothers_details.father_in_law =
            brotherDetailsRequest.father_in_law.map((fatherInLawContact: { salutation: any; name: any; phone: any; email: any; whatsapp: any; mobile: any; address: any; }) => ({
              salutation: fatherInLawContact.salutation,
              name: fatherInLawContact.name,
              phone: fatherInLawContact.phone,
              email: fatherInLawContact.email,
              whatsapp: fatherInLawContact.whatsapp,
              mobile: fatherInLawContact.mobile,
              address: fatherInLawContact.address,
            }));
        }

        if (
          brotherDetailsRequest.brothers &&
          Array.isArray(brotherDetailsRequest.brothers)
        ) {
          // Initialize the array if it doesn't exist
          if (!existingUser.brothers_details.brothers) {
            existingUser.brothers_details.brothers = [];
          }

          // Update brothers details for each father-in-law
          existingUser.brothers_details.brothers =
            brotherDetailsRequest.brothers.map(
              (brotherContact: {
                salutation: any;
                name: any;
                phone: any;
                email: any;
                whatsapp: any;
                mobile: any;
                address: any;
              }) => ({
                salutation: brotherContact.salutation,
                name: brotherContact.name,
                phone: brotherContact.phone,
                email: brotherContact.email,
                whatsapp: brotherContact.whatsapp,
                mobile: brotherContact.mobile,
                address: brotherContact.address,
              })
            );
        }
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
      };

      if (
        sisterDetailsRequest.brother_in_law &&
        Array.isArray(sisterDetailsRequest.brother_in_law)
      ) {
        // Initialize the array if it doesn't exist
        if (!existingUser.sisters_details.brother_in_law) {
          existingUser.sisters_details.brother_in_law = [];
        }

        // Update sisters details for each brother-in-law
        existingUser.sisters_details.brother_in_law =
          sisterDetailsRequest.brother_in_law.map((brotherInLawContact: { salutation: any; name: any; phone: any; email: any; whatsapp: any; mobile: any; address: any; }) => ({
            salutation: brotherInLawContact.salutation,
            name: brotherInLawContact.name,
            phone: brotherInLawContact.phone,
            email: brotherInLawContact.email,
            whatsapp: brotherInLawContact.whatsapp,
            mobile: brotherInLawContact.mobile,
            address: brotherInLawContact.address,
          }));
      }

      if (
        sisterDetailsRequest.sisters &&
        Array.isArray(sisterDetailsRequest.sisters)
      ) {
        // Initialize the array if it doesn't exist
        if (!existingUser.sisters_details.sisters) {
          existingUser.sisters_details.sisters = [];
        }

        // Update sisters details for each brother-in-law
        existingUser.sisters_details.sisters = sisterDetailsRequest.sisters.map(
          (sisterContact: {
            salutation: any;
            name: any;
            phone: any;
            email: any;
            whatsapp: any;
            mobile: any;
            address: any;
          }) => ({
            salutation: sisterContact.salutation,
            name: sisterContact.name,
            phone: sisterContact.phone,
            email: sisterContact.email,
            whatsapp: sisterContact.whatsapp,
            mobile: sisterContact.mobile,
            address: sisterContact.address,
          })
        );
      }
    }


    const fatherFamilyDetailsRequest = req.body.fathers_family_details;

    if (fatherFamilyDetailsRequest) {
      // existingUser.fathers_family_details = {
      //   grandfather_name:
      //     fatherFamilyDetailsRequest?.grandfather_name ||
      //     existingUser.fathers_family_details?.grandfather_name,
      //   grandfather_village:
      //     fatherFamilyDetailsRequest?.grandfather_village ||
      //     existingUser.fathers_family_details?.grandfather_village,
      // };

       if (fatherFamilyDetailsRequest.grandfather) {
         const grandfatherContact = fatherFamilyDetailsRequest.grandfather;
         // Check if the father object exists in family_details
         if (!existingUser.fathers_family_details.grandfather) {
           existingUser.fathers_family_details.grandfather = {};
         }
         // Update grandfather  details
         existingUser.fathers_family_details.grandfather = {
           salutation: grandfatherContact.salutation,
           name: grandfatherContact.name,
           phone: grandfatherContact.phone,
           email: grandfatherContact.email,
           whatsapp: grandfatherContact.whatsapp,
           mobile: grandfatherContact.mobile,
           address: grandfatherContact.address,
         };
       }
      // Update kaka details
      if (
        fatherFamilyDetailsRequest.kaka &&
        Array.isArray(fatherFamilyDetailsRequest.kaka)
      ) {
        if (!existingUser.fathers_family_details.kaka) {
          existingUser.fathers_family_details.kaka = [];
        }
        existingUser.fathers_family_details.kaka =
          fatherFamilyDetailsRequest.kaka.map((kakaContact: { salutation: any; name: any; phone: any; email: any; whatsapp: any; mobile: any; address: any; }) => ({
            salutation: kakaContact.salutation,
            name: kakaContact.name,
            phone: kakaContact.phone,
            email: kakaContact.email,
            whatsapp: kakaContact.whatsapp,
            mobile: kakaContact.mobile,
            address: kakaContact.address,
          }));
      }

      // Update fuva details
      if (
        fatherFamilyDetailsRequest.fuva &&
        Array.isArray(fatherFamilyDetailsRequest.fuva)
      ) {
         if (!existingUser.fathers_family_details.fuva) {
           existingUser.fathers_family_details.fuva = [];
         }
        existingUser.fathers_family_details.fuva =
          fatherFamilyDetailsRequest.fuva.map((fuvaContact: { salutation: any; name: any; phone: any; email: any; whatsapp: any; mobile: any; address: any; }) => ({
            salutation: fuvaContact.salutation,
            name: fuvaContact.name,
            phone: fuvaContact.phone,
            email: fuvaContact.email,
            whatsapp: fuvaContact.whatsapp,
            mobile: fuvaContact.mobile,
            address: fuvaContact.address,
          }));
      }
    }

    const motherFamilyDetailsRequest = req.body.mothers_family_details;

    if (motherFamilyDetailsRequest) {
      // existingUser.mothers_family_details = {
      //   grandfather_name:
      //     motherFamilyDetailsRequest?.grandfather_name ||
      //     existingUser.mothers_family_details?.grandfather_name,
      //   grandfather_village:
      //     motherFamilyDetailsRequest?.grandfather_village ||
      //     existingUser.mothers_family_details?.grandfather_village,
      // };

       if (motherFamilyDetailsRequest.grandfather) {
         const grandfatherContact = motherFamilyDetailsRequest.grandfather;
         // Check if the father object exists in family_details
         if (!existingUser.mothers_family_details.grandfather) {
           existingUser.mothers_family_details.grandfather = {};
         }
         // Update grandfather  details
         existingUser.mothers_family_details.grandfather = {
           salutation: grandfatherContact.salutation,
           name: grandfatherContact.name,
           phone: grandfatherContact.phone,
           email: grandfatherContact.email,
           whatsapp: grandfatherContact.whatsapp,
           mobile: grandfatherContact.mobile,
           address: grandfatherContact.address,
         };
       }

      // Update mama details
      if (
        motherFamilyDetailsRequest.mama &&
        Array.isArray(motherFamilyDetailsRequest.mama)
      ) {
        if (!existingUser.mothers_family_details.mama) {
          existingUser.mothers_family_details.mama = [];
        }
        existingUser.mothers_family_details.mama =
          motherFamilyDetailsRequest.mama.map((mamaContact: { salutation: any; name: any; phone: any; email: any; whatsapp: any; mobile: any; address: any; }) => ({
            salutation: mamaContact.salutation,
            name: mamaContact.name,
            phone: mamaContact.phone,
            email: mamaContact.email,
            whatsapp: mamaContact.whatsapp,
            mobile: mamaContact.mobile,
            address: mamaContact.address,
          }));
      }

      // Update mavsa details
      if (
        motherFamilyDetailsRequest.mavsa &&
        Array.isArray(motherFamilyDetailsRequest.mavsa)
      ) {
        if (!existingUser.mothers_family_details.mavsa) {
          existingUser.mothers_family_details.mavsa = [];
        }
        existingUser.mothers_family_details.mavsa =
          motherFamilyDetailsRequest.mavsa.map((mavsaContact: { salutation: any; name: any; phone: any; email: any; whatsapp: any; mobile: any; address: any; }) => ({
            salutation: mavsaContact.salutation,
            name: mavsaContact.name,
            phone: mavsaContact.phone,
            email: mavsaContact.email,
            whatsapp: mavsaContact.whatsapp,
            mobile: mavsaContact.mobile,
            address: mavsaContact.address,
          }));
      }
    }


    await existingUser.save();

    return res.status(200).send({
      message: "User updated successfully",
      status: true,
      user: existingUser,
    });
  } catch (e) {
    res.status(500).send(e);
    console.log({ error: e });
  }
};

export default editUser;
