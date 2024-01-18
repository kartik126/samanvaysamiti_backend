import { Request, Response } from "express";
import User from "../../models/user";

interface MatchingData {
  data: string[];
}

let getCity = async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string | undefined;

    if (query === undefined) {
      return res
        .status(400)
        .json({ status: false, error: "Query parameter 'q' is required." });
    }

    const regexPattern = new RegExp(query, "i");

    const matchingData = await User.aggregate<MatchingData>([
      {
        $match: {
          $or: [
            {
              "professional_details.work_city": {
                $exists: true,
                $ne: null,
                $regex: regexPattern,
              },
            },
            {
              "personal_details.fullname": {
                $exists: true,
                $ne: null,
                $regex: regexPattern,
              },
            },
            {
              serial_no: {
                $exists: true,
                $ne: null,
                $regex: regexPattern,
              },
            },
          ],
        },
      },
      {
        $project: {
          _id: 0,
          data: {
            $concatArrays: [
              {
                $cond: {
                  if: {
                    $regexMatch: {
                      input: "$personal_details.fullname",
                      regex: regexPattern,
                    },
                  },
                  then: ["$personal_details.fullname"],
                  else: [],
                },
              },
              {
                $cond: {
                  if: {
                    $regexMatch: {
                      input: "$professional_details.work_city",
                      regex: regexPattern,
                    },
                  },
                  then: ["$professional_details.work_city"],
                  else: [],
                },
              },
              {
                $cond: {
                  if: {
                    $regexMatch: {
                      input: "$serial_no",
                      regex: regexPattern,
                    },
                  },
                  then: ["$serial_no"],
                  else: [],
                },
              },
            ],
          },
        },
      },
      {
        $unwind: "$data",
      },
      {
        $group: {
          _id: null,
          data: {
            $addToSet: "$data",
          },
        },
      },
      {
        $project: {
          _id: 0,
          data: 1,
        },
      },
    ]);

    res
      .status(200)
      .json({
        status: true,
        data: matchingData.length > 0 ? matchingData[0].data : [],
      });
  } catch (error) {
    console.error("Error fetching matching data:", error);
    res.status(500).json({ status: false, error: "Internal Server Error" });
  }
};

export default getCity;
