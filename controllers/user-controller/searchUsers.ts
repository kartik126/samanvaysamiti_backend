// controllers/profileController.js
import { Request, Response } from "express";
import { z } from "zod";
import User from "../../models/user";

const requestBodySchema = z.object({
  gender: z.string().optional(),
  blood_group: z.string().optional(),
  location: z.string().optional(),
  city: z.string().optional(),
  profession: z.array(z.string()).optional(),
  gotra: z.array(z.string()).optional(),
  education_level_completed: z.array(z.string()).optional(),
  minSalary: z.number().optional(),
  maxSalary: z.number().optional(),
  currency: z.string().optional(),
  minAge: z.number().optional(),
  maxAge: z.number().optional(),
  minHeight: z.number().optional(),
  maxHeight: z.number().optional(),
  minWeight: z.number().optional(),
  maxWeight: z.number().optional(),
  searchQuery: z.string().optional(),
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
      searchQuery,
    } = requestBodySchema.parse(requestBody);

    const pipeline = [];
    
  if (searchQuery) {
    const searchMatch = {
      $match: {
        $or: [
          {
            serial_no: {
              $regex: new RegExp(`${searchQuery}`, "i"),
            },
          },
          {
            "personal_details.fullname": {
              $regex: new RegExp(`${searchQuery}`, "i"),
            },
          },
          {
            "professional_details.work_city": {
              $regex: new RegExp(`${searchQuery}`, "i"),
            },
          },
        ],
      },
    };
    pipeline.push(searchMatch);
  }

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
              { $eq: ["$personal_details.height_cm", ""] },
              {
                $gte: [{ $toDouble: "$personal_details.height_cm" }, minHeight],
              },
            ],
          },
        },
        {
          $expr: {
            $or: [
              { $eq: [maxHeight, undefined] },
              { $eq: ["$personal_details.height_cm", ""] },
              {
                $lte: [{ $toDouble: "$personal_details.height_cm" }, maxHeight],
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
          $expr: {
            $and: [
              {
                $or: [
                  { $eq: [maxAge, undefined] },
                  {
                    $gte: [
                      { $toDouble: maxAge },
                      {
                        $divide: [
                          { $subtract: [new Date(), { $dateFromString: { dateString: "$personal_details.birth_date", format: "%Y-%m-%d" } }] },
                          31536000000, // milliseconds in a year
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                $or: [
                  { $eq: [minAge, undefined] },
                  {
                    $lte: [
                      { $toDouble: minAge },
                      {
                        $divide: [
                          { $subtract: [new Date(), { $dateFromString: { dateString: "$personal_details.birth_date", format: "%Y-%m-%d" } }] },
                          31536000000, // milliseconds in a year
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
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
          "professional_details.work_city": {
            $regex: new RegExp(`${location}`, "i"),
          },
        },
      };
      pipeline.push(locationMatch);
    }

    if (profession !== undefined && profession.length > 0) {
      const professionMatch = {
        $match: {
          "professional_details.profession": {
            $in: profession.map((g) => new RegExp(`^${g}$`, "i")),
          },
        },
      };
      pipeline.push(professionMatch);
    }

   if (gotra !== undefined && gotra.length > 0) {
     const gotraMatch = {
       $match: {
         "personal_details.gotra": {
           $in: gotra.map((g) => new RegExp(`^${g}$`, "i")),
         },
       },
     };
     pipeline.push(gotraMatch);
   }

   if (
     education_level_completed !== undefined &&
     education_level_completed.length > 0
   ) {
     const educationMatch = {
       $match: {
         "educational_details.education_level": {
           $in: education_level_completed.map((e) => new RegExp(`^${e}$`, "i")),
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

    const statusMatch = {
      $match: {
        user_status: "active",
      },
    };
    pipeline.push(statusMatch);

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
