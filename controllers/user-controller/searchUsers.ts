// controllers/profileController.js
import { Request, Response } from "express";
import { z } from "zod";
import User from "../../models/user";

const requestBodySchema = z.object({
  gender: z.string().optional(),
  blood_group: z.string().optional(),
  location: z.string().optional(),
  city: z.string().optional(),
  profession: z.string().optional(),
  gotra: z.string().optional(),
  education_level_completed: z.string().optional(),
  minSalary: z.number().optional(),
  maxSalary: z.number().optional(),
  currency: z.string().optional(),
  minAge: z.number().optional(),
  maxAge: z.number().optional(),
  minHeight: z.number().optional(),
  maxHeight: z.number().optional(),
  minWeight: z.number().optional(),
  maxWeight: z.number().optional(),
});

let searchUsers = async (req: Request, res: Response) => {
  try {

    const requestBody = req.body || {};
    const {
      gender,
      blood_group,
      profession,
      gotra,
      education_level_completed,
      currency,
      minAge,
      maxAge,
      minHeight,
      maxHeight,
      minWeight,
      maxWeight,
      maxSalary,
      minSalary,
      location,
    } = requestBodySchema.parse(requestBody);

    const pipeline = [];

    if (minSalary !== undefined || maxSalary !== undefined) {
      const salaryMatch = {
        $match: {
          $and: [
            {
              $expr: {
                $or: [
                  { $eq: [minSalary, undefined] },
                  { $eq: ["$professional_details.monthly_income", ""] },
                  {
                    $gte: [
                      { $toDouble: "$professional_details.monthly_income" },
                      minSalary,
                    ],
                  },
                ],
              },
            },
            {
              $expr: {
                $or: [
                  { $eq: [maxSalary, undefined] },
                  { $eq: ["$professional_details.monthly_income", ""] },
                  {
                    $lte: [
                      { $toDouble: "$professional_details.monthly_income" },
                      maxSalary,
                    ],
                  },
                ],
              },
            },
          ],
        },
      };
      pipeline.push(salaryMatch);
    }

    if (minWeight !== undefined || maxWeight !== undefined) {
      const weightMatch = {
        $match: {
          $and: [
            {
              $expr: {
                $or: [
                  { $eq: [minWeight, undefined] },
                  { $eq: ["$personal_details.weight", ""] },
                  {
                    $gte: [
                      { $toDouble: "$personal_details.weight" },
                      minWeight,
                    ],
                  },
                ],
              },
            },
            {
              $expr: {
                $or: [
                  { $eq: [maxWeight, undefined] },
                  { $eq: ["$personal_details.weight", ""] },
                  {
                    $lte: [
                      { $toDouble: "$personal_details.weight" },
                      maxWeight,
                    ],
                  },
                ],
              },
            },
          ],
        },
      };
      pipeline.push(weightMatch);
    }

    if (minHeight !== undefined || maxHeight !== undefined) {
      const heightMatch = {
        $match: {
          $and: [
            {
              $expr: {
                $or: [
                  { $eq: [minHeight, undefined] },
                  { $eq: ["$personal_details.height", ""] },
                  {
                    $gte: [
                      { $toDouble: "$personal_details.height" },
                      minHeight,
                    ],
                  },
                ],
              },
            },
            {
              $expr: {
                $or: [
                  { $eq: [maxHeight, undefined] },
                  { $eq: ["$personal_details.height", ""] },
                  {
                    $lte: [
                      { $toDouble: "$personal_details.height" },
                      maxHeight,
                    ],
                  },
                ],
              },
            },
          ],
        },
      };
      pipeline.push(heightMatch);
    }

    if (minAge !== undefined || maxAge !== undefined) {
      const ageMatch = {
        $match: {
          $and: [
            {
              $expr: {
                $or: [
                  { $eq: [minAge, undefined] },
                  { $eq: ["$personal_details.age", ""] },
                  { $gte: [{ $toDouble: "$personal_details.age" }, minAge] },
                ],
              },
            },
            {
              $expr: {
                $or: [
                  { $eq: [maxAge, undefined] },
                  { $eq: ["$personal_details.age", ""] },
                  { $lte: [{ $toDouble: "$personal_details.age" }, maxAge] },
                ],
              },
            },
          ],
        },
      };
      pipeline.push(ageMatch);
    }

    if (gender !== undefined) {
      const genderMatch = {
        $match: {
          "personal_details.gender": { $regex: new RegExp(`^${gender}$`, "i") },
        },
      };
      pipeline.push(genderMatch);
    }

    if (blood_group !== undefined) {
      const bloodMatch = {
        $match: {
          "personal_details.blood_group": {
            $regex: blood_group.toUpperCase(),
          },
        },
      };
      pipeline.push(bloodMatch);
    }

    if (location !== undefined) {
      const locationMatch = {
        $match: {
          "contact_details.current_address": {
            $regex: new RegExp(`${location}`, "i"),
          },
        },
      };
      pipeline.push(locationMatch);
    }

    if (profession !== undefined) {
      const professionMatch = {
        $match: {
          "professional_details.profession": {
            $regex: new RegExp(`${profession}`, "i"),
          },
        },
      };
      pipeline.push(professionMatch);
    }
    
    if (gotra !== undefined) {
      const gotraMatch = {
        $match: {
          "personal_details.gotra": {
            $regex: new RegExp(`^${gotra}$`, "i"),
          },
        },
      };
      pipeline.push(gotraMatch);
    }

    if (education_level_completed !== undefined) {
      const educationMatch = {
        $match: {
          "educational_details.education_level": {
            $regex: new RegExp(`^${education_level_completed}$`, "i"),
          },
        },
      };
      pipeline.push(educationMatch);
    }

    if (currency !== undefined) {
      const currencyMatch = {
        $match: {
          "professional_details.payment_currency": {
            $regex: new RegExp(`^${currency}$`, "i"),
          },
        },
      };
      pipeline.push(currencyMatch);
    }

    const result = await User.aggregate(pipeline);

    if (!result) {
      return res.status(200).json({ message: "User not found", result });
    }

    return res.status(200).json({ success: true, result });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default searchUsers;
