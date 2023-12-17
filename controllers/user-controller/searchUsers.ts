// controllers/profileController.js
import { Request, Response } from "express";
import { z } from "zod";
import User from "../../models/user";

const requestBodySchema = z.object({
  minAge: z.number().optional(),
  maxAge: z.number().optional(),
  minHeight: z.string().optional(),
  maxHeight: z.string().optional(),
  minWeight: z.string().optional(),
  maxWeight: z.string().optional(),
  minIncome: z.number().optional(),
  maxIncome: z.number().optional(),
  manglik: z.string().optional(),
  complexion: z.string().optional(),
  education: z.string().optional(),
  location: z.string().optional(),
  like: z.string().optional(),
});

let searchUsers = async (req: Request, res: Response) => {

  try {
    const {
      minAge,
      maxAge,
      minHeight,
      maxHeight,
      minWeight,
      maxWeight,
      minIncome,
      maxIncome,
      manglik,
      complexion,
      education,
      location,
    } = requestBodySchema.parse(req.body);

    const pipeline = [];

    if (minWeight !== undefined || maxWeight !== undefined) {
      const weightMatch = {
        $match: {
          $and: [
            {
              $expr: {
                $or: [
                  { $eq: [minWeight, undefined] },
                  { $eq: ["$weight", ""] },
                  { $gte: [{ $toDouble: "$weight" }, minWeight] },
                ],
              },
            },
            {
              $expr: {
                $or: [
                  { $eq: [maxWeight, undefined] },
                  { $eq: ["$weight", ""] },
                  { $lte: [{ $toDouble: "$weight" }, maxWeight] },
                ],
              },
            },
          ],
        },
      };
      pipeline.push(weightMatch);
    }

      const result = await User.aggregate(pipeline);

    if (!result) {
      return res.status(200).json({ message: "User not found", result });
    }

    return res.status(200).json({ success:true, result });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default searchUsers;
