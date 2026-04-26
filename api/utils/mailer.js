import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';
import { Password_Reset_Email_Template, Verification_Email_Template } from "./EmailTemplate.js";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT || 587;
const emailUser = process.env.SMTP_USER || process.env.EMAIL_USER;
const emailPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

let transporter;

if (smtpHost) {
  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: Number(smtpPort),
    auth: { user: emailUser, pass: emailPass },
    secure: Number(smtpPort) === 465
  });
} else {
  // Fallback to Gmail if no SMTP host is provided
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: emailUser, pass: emailPass }
  });
}

const fromAddress = process.env.MAIL_FROM || process.env.FROM_EMAIL || emailUser;

export const sendOtpEmail = async ({ to, code, expiresAt }) => {
  const mailOptions = {
    from: fromAddress,
    to,
    subject: "Lekhak - Email verification code",
    html: Verification_Email_Template.replace("{verificationCode}", code)
  };

  return transporter.sendMail(mailOptions);
};

export const sendPasswordResetEmail = async ({ to, code }) => {
  const mailOptions = {
    from: fromAddress,
    to,
    subject: "Lekhak - Password reset code",
    html: Password_Reset_Email_Template.replace("{verificationCode}", code)
  };

  return transporter.sendMail(mailOptions);
};


