import { Request, Response } from "express";
var express = require("express");
var router = express.Router();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "lavi9921@gmail.com",
    pass: "daig ekpf tblh hbxv",
  },
});

const sendMail = (data: any, callback: (error: Error | null, info: any) => void) => {
  const mailOptions = {
    from: data.email,
    to: "lavi9921@gmail.com",
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
