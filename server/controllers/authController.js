const User = require('../models/User');
const OTP = require('../models/OTP');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {sendOTPEmail} = require('../utils/email');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

//Register User
exports.registerUser = async (req , res)=>{
   const {name , email , password} = req.body;

   let userExists = await User.findOne({email});
   if(userExists){ 
    return res.status(400).json({error: 'user already exists'});
   } 

   const salt = await bcrypt.genSalt(10);
   const hashedPassword = await bcrypt.hash(password , salt);


   try{

    const user =   await User.create ({name , email , password: hashedPassword , role: 'user' , isVerified: false});
    

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`otp for ${email}: ${otp}`);
    await OTP.create({email , otp , action: 'account_verification'});
    await sendOTPEmail(email , otp , 'account_verification');


    res.status(201).json({
      message: "User registerd successfully. please check your email for otp to verify your account",
      email: user.email
      
   });

     
   } catch(error){
    res.status(400).json({error: error.message});
   }
};

//Login User

exports.loginUser = async (req ,res) =>{
   const {email , password} = req.body;

   let user = await User.findOne({email});
   if(!user){
      return res.status(400).json({error: 'Invalid credential , please sign up first'});
   }

   const isMatch = await bcrypt.compare(password , user.password);
   if(!isMatch){
      return res.status(400).json({error: 'Invalid credentials'});
   }

   if(!user.isVerified){
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await OTP.findOneAndDelete({ email: user.email, action: 'account_verification' });
      await OTP.create({email , otp , action: 'account_verification'});
      await sendOTPEmail(email , otp , 'account_verification');
      return res.status(400).json({
         error: 'Account not verified. A new OTP has been sent to your email.'
      });
   }

   res.status(200).json({
      message: 'Login successful',
         _id: user._id,
         name: user.name,
         email: user.email,
         role: user.role,
         token: generateToken(user._id , user.role)
   });


}

//verify otp
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const validOTP = await OTP.findOne({ email, otp, action: 'account_verification' });

        if (!validOTP) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        const user = await User.findOneAndUpdate({ email }, { isVerified: true }, { new: true });
        await OTP.deleteOne({ _id: validOTP._id }); // Delete OTP after usage

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user.id, user.role)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};




