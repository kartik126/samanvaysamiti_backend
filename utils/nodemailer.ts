import nodemailer from "nodemailer";

// export const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: "amandeepp26@gmail.com",
//     pass: "bnvx gitq cfoh vzfd",
//   },
// });

export const transporter = nodemailer.createTransport({
  host: "us2.smtp.mailhostbox.com",
  port: 587, // Use either 25 or 587 depending on your SMTP server settings
  secure: false, // false for STARTTLS
  auth: {
    user: "info@samanvaysamiti.com", // Your email address
    pass: "hoZKu)c3", // Your email password
  },
});
