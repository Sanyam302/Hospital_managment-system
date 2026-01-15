const express = require("express")
const dotenv = require("dotenv").config()
const app = express()
const authRoutes = require("./routes/auth.routes")

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use('/auth',authRoutes)
app.post('/test',(req,res)=>{
  console.log("Body sjdbddwq",req.body)
  res.json({body:req.body})
})
const connectDB= require("./db/db")
connectDB()

app.listen(5000, () => {
  console.log("Server running on port 5000")
})
module.exports=app