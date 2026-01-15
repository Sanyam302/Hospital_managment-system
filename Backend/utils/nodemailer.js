const nodemailer = require("nodemailer")

const sendOTPEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // IMPORTANT
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  })

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP Verification Code",
    html: `
      <h2>Email Verification</h2>
      <p>Your OTP is:</p>
      <h1>${otp}</h1>
      <p>This OTP is valid for 10 minutes.</p>
    `
  })

  console.log("OTP email sent successfully")
}

module.exports = sendOTPEmail

