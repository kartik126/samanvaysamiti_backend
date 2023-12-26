import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "amandeepp26@gmail.com",
    pass: "bnvx gitq cfoh vzfd",
  },
});
