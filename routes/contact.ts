import { Request, Response } from "express";
import { transporter } from "../utils/nodemailer";
var express = require("express");
var router = express.Router();

const sendMail = (
  data: any,
  callback: (error: Error | null, info: any) => void
) => {
  // Add the user's email as a CC recipient
  const mailOptions = {
    from: "info@samanvaysamiti.com",
    to: "contact@samanvaysamiti.com",
    cc: data.email, // CC the user's email
    subject: data.subject,
    text: `Name: ${data.name}\nEmail: ${data.email}\nMessage: ${data.message}`,
  };

  transporter.sendMail(mailOptions, (error: Error | null, info: any) => {
    callback(error, info);
  });
};

router.post("/", async (req: Request, res: Response) => {
  try {
    const formData = req.body;

    // Call sendMail with a callback function
    sendMail(formData, (error, info) => {
      if (error) {
        console.error(error);
        return res.status(500).send({
          success: false,
          message: "Error sending email",
        });
      } else {
        console.log("Email sent: " + info.response);
        return res.status(200).send({
          success: true,
          message: "Message successfully sent",
        });
      }
    });
  } catch (error) {
    console.error({ error: error });
    res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  }
});

module.exports = router;
