const express=require("express")
const bcrypt = require("bcryptjs")
const router = express.Router()
const User = require("../models/register.model")
const crypto = require("crypto")
const sendOTPEmail=require("../utils/nodemailer")
const jwt = require("jsonwebtoken")
const ApiResponse=require("../utils/ApiResponse")
const { access } = require("fs")
const verifyJWT=require("../middleware/authmiddleware")
const { asyncHandler } = require("../utils/asyncHandler")
const generateAccessAndRefreshToken = async(userId)=>{
  try{
   const user = await User.findById(userId)
   const accessToken= jwt.sign({id:user._id},process.env.JWT_SECRET_KEY,{expiresIn:'15m'})
   const refreshToken= jwt.sign({id:user._id},process.env.JWT_SECRET_KEY,{expiresIn:'15d'})
   user.refreshToken=refreshToken
   user.save({validateBeforeSave:false})
   return {accessToken,refreshToken}
  }
  catch(error){
    throw new ApiError(500,error)
  }
}
router.post("/register", async (req,res)=>{
  console.log("reqeststarted")
    try{
        const { name, email, password, gender, age ,role} = req.body
         if (!email) {
      return res.status(400).json({ message: "Email is required" })
    }
        console.log("REQ BODY:", req.body)
      console.log("EMAIL:", email)

         const existingUser = await User.findOne({ email })
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: "User already exists " })
    }
    
   const otp = crypto.randomInt(100000, 1000000).toString()
    const otpExpiry = Date.now() + 10 * 60 * 1000 // 10 minutes 
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
        try {
  await sendOTPEmail(email, otp)
} catch (err) {
  console.error("Email error:", err)
  return res.status(500).json({ message: "Email sending failed" })
}
    const user = new User({
      name,
      email,
      password: hashedPassword,
      gender,
      age,
      role,
      isVerified:false,
      otp,
      otpExpiry
    })

    await user.save()
     

     res.status(201).json({
      message: "User registered successfully"
    })
}
    catch (error) {
    res.status(500).json({ error })
  }

})


router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // 1️⃣ Check email
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({message:"user not found"})
      
    }

    // 2️⃣ Compare password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" })
    }
   
   
    const { accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id)
    res.status(200).cookie("accessToken",accessToken , {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    maxAge: 15 * 60 * 1000
  }).cookie("refreshToken",refreshToken,{
     httpOnly: true,
    secure: true,
    sameSite: "Strict",
    maxAge: 15*24*60 * 60 * 1000
  })
 .json(
  new ApiResponse(
    200,
    {
      user:user,accessToken,refreshToken
    },
    "user logged in succesfully"
  )
 ) 
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: "User not found" })
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified" })
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" })
    }

    if (user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "OTP expired" })
    }

    user.isVerified = true
    user.otp = undefined
    user.otpExpiry = undefined
    await user.save()

    res.json({ message: "Email verified successfully" })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post("/logout",verifyJWT,asyncHandler(async (req,res)=>{
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset:{
        refreshToken:1
      }
      },
      {
          new: true
      }
    )
    const options={
      httpOnly:true,
      secure:true
    }
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"user logged out"))
    })
  )





module.exports=router