import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "lavi9921@gmail.com",
    pass: "daig ekpf tblh hbxv",
  },
});
