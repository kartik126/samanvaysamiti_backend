import { Request, Response } from "express";
import { z } from "zod";
import Mandal from "../models/mandal";
import { uploadToS3 } from "../utils/uploadToS3";

var express = require("express");
var router = express.Router();

const multer = require("multer");

const storage = multer.memoryStorage(); // Store the image in memory
const upload = multer({ storage: storage, limits: { files: 5 } });

const mandalSchema = z.object({
  phone: z.string(),
  email: z.string().email(),
  mandal_name: z.string(),
  member_name: z.string(),
});

router.post(
  "/register",
  upload.single("photo"),
  async (req: Request, res: Response) => {
    try {
      let requestBody = mandalSchema.parse(req.body);

      const existingUser = await Mandal.findOne({
        $or: [{ email: requestBody.email }, { phone: requestBody.phone }],
      });

      if (existingUser) {
        return res
          .status(400)
          .json({ message: "Email or phone already exists" });
      }

      const imageBuffer: any = req.file?.buffer;

      const imageUrl = await uploadToS3(requestBody.email, imageBuffer);

      if (!imageBuffer) {
        return res
          .status(404)
          .json({ message: "please provide an profile image" });
      }

      let mandal = new Mandal({
        phone: requestBody.phone,
        email: requestBody.email,
        mandal_name: requestBody.mandal_name,
        member_name: requestBody.member_name,
        photo: imageUrl,
      });

      await mandal.save();

      return res.status(200).send({
        message: "User created successfully",
        user: mandal,
      });
    } catch (error) {
      res.status(500).send(error);
      console.log({ error: error });
    }
  }
);

module.exports = router;
