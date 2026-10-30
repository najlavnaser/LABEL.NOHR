const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/userModel");
const Address=require("../model/addressModel");
const {sendEmail}=require("../utils/sendEmail");
const {OAuth2Client} = require("google-auth-library");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);




//TOKEN generation
const generateToken=(id)=>{
  return jwt.sign(
    {id}, 
    process.env.JWT_SECRET,
    {expiresIn:'30d'}
  );
};

//OTP generation
const generateOTP=()=>{
  return Math.floor(100000+Math.random()*900000).toString();
}





//SIGNUP

const userSignup = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password||!confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All Fields are required!",
      });
    }


    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password do not match!",
      });
    }


    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists!",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp=generateOTP();
    const otpExpires=new Date(Date.now()+5*60*1000);



    const user = await User.create({
        name,
        email,
        password:hashedPassword,
        otp,
        otpExpires,
        isVerified:false

    });
      
    const message=
      `Welcome ${name}! 
      Thank you for Registering!
      Your OTP for Label Nohr Registration is : ${otp} expires in 5 minute`;

     
    
    await sendEmail(email,
      "Welcome to NOHR!Your OTP for Registration ",message);
    

    return res.status(201).json({
        success:true,
        message:"User Registered Successfully!Check Your Email for the OTP"
    });

  }catch(error) {
    console.error("Signup error:",error);
    return res.status(500).json({
        success:false,
        message:"Something went wrong!"
    })
  }
};





//LOGIN

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required!"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password!"
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked!"
      });
    }

    if (user.isGoogleUser) {
      return res.status(400).json({
        success: false,
        message:
          "This account was registered with Google! Please continue with Google Account"
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password!"
      });
    }

    const token = generateToken(user._id);

    res.cookie("token", token, {
  httpOnly: true,
  secure: false,
  sameSite: "strict",
  path: "/"
});

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      }
    });

  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong!"
    });
  }
};






//VERIFY OTP

const verifyOTP=async(req,res)=>{
  try{
    const{email,otp}=req.body;
    if(!email||!otp){
      return res.status(400).json({
        success:false,
        message:"Email and OTP are required!"
      })
    }

    const user=await User.findOne({email});
    if(!user){
      return res.status(404).json({
        success:false,
        message:"User not found!"
      });
    }


    if(user.isVerified){
      return res.status(400).json({
        success:false,
        message:"Email is already verified!"
      });
    }



    if(!user.otp||user.otp!==otp){
      return res.status(400).json({
        success:false,
        message:"Invalid OTP"
      });
    }


    if(!user.otpExpires||user.otpExpires<new Date()){
      return res.status(400).json({
        success:false,
        message:"OTP has expired!"
      });
    }

    user.isVerified=true;
    user.otp=undefined;
    user.otpExpires=undefined;

    await user.save();

    return res.status(200).json({
      success:true,
      message:"Email verified successfully!"
    })

  }catch(error){
    console.error("Error!-Verify OTP");
    return res.status(500).json({
      success:false,
      message:"Something went wrong!"
    });
  }

};






//RESEND OTP

const resendOTP=async(req,res)=>{
  try{
    const {email}=req.body;
    if(!email){
      return res.status(400).json({
        success:false,
        message:"Email is required!"
      });
    }

      const user=await User.findOne({email});

      if(!user){
        return res.status(404).json({
          success:false,
          message:"User not found!"
        });
      }
      if(user.isVerified){
        return res.status(400).json({
          success:false,
          message:"Email is already verified!"
        });
      }

      const otp=generateOTP();
      user.otp=otp;
      user.otpExpires=new Date(Date.now()+5*60*1000);

      await user.save();
      const message=`
      Your new LABEL NOHR verification OTP is ${otp}
      Expires in 5 minute`;

      await sendEmail(
        email,"NOHR-New Verification OTP",
        message
      );
      return res.status(200).json({
        success:true,
        message:"New OTP sent Successfully!"
      });
  }catch(error){
    console.error("Error-Resend OTP");
    return res.status(500).json({
      success:false,
      message:"Something went wrong!"
    })
  }
}







//FORGOT PASSWORD

const forgotPassword=async(req,res)=>{
  try{
    const{email}=req.body;

    if(!email){
      return res.status(400).json({
        success:false,
        message:"Email is required!"
      });
    }

    const user=await User.findOne({email});

    if(!user){
      return res.status(404).json({
        success:false,
        message:"User not Found!"
      });
    }

    if(user.isGoogleUser){
      return res.status(400).json({
        success:false,
        message:"This account uses Google login.Please continue with Google!"
      });
    }

    const resetOTP=generateOTP();
    user.resetPasswordToken=resetOTP;
    user.resetPasswordExpires=new Date(Date.now()+5*60*1000);

    await user.save();
    const message=`
    Hello ${user.name},
    Your Password reset OTP for LABEL NOHR is : ${resetOTP}
    expires in 5 minutes`;

    await sendEmail(
      email,"NOHR-Password reset OTP",message
    );

    return res.status(200).json({
      success:true,
      message:"Password reset OTP has been sent to your emsail!"
    })

  }catch(error){
    console.error("Error in Forgot password");
    return res.status(500).json({
      success:false,
      message:"Something went wrong!"
    });
  }
};







//RESET PASSWORD

const resetPassword=async(req,res)=>{
  try{
    const {email,otp,password,confirmPassword}=req.body;
    if (!email||!otp||!password||!confirmPassword){
      return res.status(400).json({
        success:false,
        message:"All fields are required!"
      });
    }

    if(password!==confirmPassword){
      return res.status(400).json({
        success:false,
        message:"Passwords do not match!"
      });
    }

    const user=await User.findOne({email});

    if(!user){
      return res.status(404).json({
        success:false,
        message:"User not found!"
      });
    }

    if(
      user.resetPasswordToken!==otp||
      !user.resetPasswordExpires||
      user.resetPasswordExpires<new Date()
    ){
      return res.status(400).json({
        success:false,
        message:"Invalid or Expired OTP!"
      });
    }

    const hashedPassword=await bcrypt.hash(password,10);
    user.password=hashedPassword;
    user.resetPasswordToken=undefined;
    user.resetPasswordExpires=undefined;

    await user.save();

    return res.status(200).json({
      success:true,
      message:"Password Reset Successfully!"
    });

  }catch(error){
    console.error("Reset Password Error!");
    return res.status(500).json({
      success:false,
      message:"Something went Wrong!"
    });
  }
}







//GOOGLE LOGIN

const googleLogin=async (req,res)=>{
  try{

    const{credentials}=req.body;

    if(!credentials){
      return res.status(400).json({
        success:false,
        message:"Google credentials are required!"
      });
    }

    const ticket=await googleClient.verifyIdToken({
      idToken:credentials,
      audience:process.env.GOOGLE_CLIENT_ID
    });

    const payload=ticket.getPayload();

    const{
      sub:googleId,
      name,
      email,
      picture
    }=payload;

    let user=await User.findOne({email});

    if(user){
      if(user.isBlocked){
        return res.status(403).json({
          success:false,
          message:"Your account has been blocked!"
        });
      }

      if(!user.isGoogleUser){
        user.googleId=googleId;
        user.isGoogleUser=true;
        user.isVerified=true;
        if(picture){
          user.profileImage=picture;
        }
        await user.save();
      }

    }else{
      user=await User.create({
        name,
        email,
        password:null,
        googleId,
        profileImage:picture||null,
        isGoogleUser:true,
        isVerified:true,
        isBlocked:false
      });
    }

    const token=generateToken(user._id);

    res.cookie("token",token,{
      httpOnly:true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict"
    });

    return res.status(200).json({
      success:true,
      message:"Google login Successful!",
      user:{
        id:user._id,
        name:user.name,
        email:user.email,
        profileImage:user.profileImage
      }
    });

  }catch(error){
    console.error("Google Login Error!");
    return res.status(500).json({
      success:false,
      message:"Something Went Wrong!"
    });
  }
}







//get Profile

const getProfile=async(req,res)=>{
  try{
    const user=await User.findById(req.user.id).select(
      "-password -otp -otpExpires -verificationToken -resetPasswordToken -resetPasswordExpires"
    );

    if(!user){
      return res.status(404).json({
        success:false,
        message:"User not found",
      });
    }

    return res.status(200).json({
      success:true,
      user:{
        id:user._id,
        name:user.name,
        email:user.email,
        phone:user.phone,
        gender:user.gender,
        profileImage:user.profileImage,
        isVerified:user.isVerified,
        isGoogleUser:user.isGoogleUser,
      },
    });
  }catch(error){
    console.error("Get Profile error:",error);
    return res.status(500).json({
      success:false,
      message:"Failed to get profile",
    });
  }
};








//Update Profile

const updateProfile=async (req,res)=>{
  try{
    const {name,phone,profileImage,gender}=req.body;

    if(name!==undefined && !name.trim()){
      return res.status(400).json({
        success:false,
        message:"Name cannot be empty!"
      });
    }

    const updates={};
    if(name!==undefined){
      updates.name=name.trim();
    }
    if(phone!==undefined){
      updates.phone=phone.trim();
    }
    if(profileImage!==undefined){
      updates.profileImage=profileImage;
    }
    if (gender !== undefined) {
  if (!["Male", "Female", ""].includes(gender)) {
    return res.status(400).json({
      success: false,
      message: "Invalid gender value!"
    });
  }

  updates.gender = gender;
}


    if(Object.keys(updates).length===0){
      return res.status(400).json({
        success:false,
        message:"No profile updation details provided!"
      });
    }

    const user=await User.findByIdAndUpdate(
      req.user.id,
      {$set:updates},
      {returnDocumennt,runValidators:true,}
    ).select("-password -otp -otpExpires -verificationToken -resetPasswordToken -resetPasswordExpires");

    if(!user){
      return res.status(400).json({
        success:false,
        message:"User not found!",
      });
    }

    return res.status(200).json({
      success:true,
      message:"Profile Updated Successfully!",
      user:{
        id:user._id,
        name:user.name,
        email:user.email,
        phone:user.phone,
        gender:user.gender,
        profileImage:user.profileImage,
        isVerified:user.isVerified,
        isGoogleUser:user.isGoogleUser,
      }
    })

  }catch(error){
    console.error("Error in update Profile",error);
    return res.status(500).json({
      success:false,
      message:"Update Profile Failed!"
    });
  }
};





//Email change request


const requestEmailChange= async (req,res)=>{
  try{
    const {newEmail}=req.body;
    if(!newEmail || !newEmail.trim()){
    return res.status(400).json({
      success:false,
      message:"Email Required"
    });
  }

  const user=await User.findById(req.user.id);
  if(!user){
    return res.status(404).json({
      success:false,
      message:"User not Found!"
    });
  }

  const normalizedEmail=newEmail.trim().toLowerCase();
  const currentEmail=user.email.trim().toLowerCase();

  if(normalizedEmail === currentEmail){
    return res.status(400).json({
      success:false,
      message:"This is current email!"
    });
  }
  const duplicateEmail=await User.findOne({
    email:normalizedEmail,
    _id:{$ne:req.user.id}
  });
  if(duplicateEmail){
    return res.status(400).json({
      success:false,
      message:"This Email is already registered!"
    });
  }
  const otp=generateOTP();
  user.pendingEmail=normalizedEmail;
  user.emailChangeOTP=otp;
  user.emailChangeOTPExpires=new Date(Date.now()+5*60*1000);

  await user.save();

  const message = `
  Your LABEL NOHR email change verification OTP is ${otp}.
  This OTP expires in 5 minutes.
  If you did not request this change, please ignore this email.`;

  await sendEmail(
   normalizedEmail,
    "LABEL NOHR - Email Change Verification",
    message
  );

  return res.status(200).json({
    success: true,
    message: "Verification OTP sent to your new email address!"
  });


  }catch(error){
    console.error("Error in requesting email change!",error);
    return res.status(500).json({
      success:false,
      message:"Something went wrong!"
    });
  }
  };





//Verify Email Change Request

const verifyEmailChange=async (req,res)=>{
  try{

    const {otp}=req.body;

    if(!otp){
      return res.status(400).json({
        success:false,
        message:"OTP is required!"
      });
    }
    const user= await User.findById(req.user.id);

    if(!user){
      return res.status(404).json({
        success:false,
        message:"User not found!"
      });
    }

    if(!user.pendingEmail || !user.emailChangeOTP){
      return res.status(400).json({
        success:false,
        message:"No Pending requests!"
      });
    } 

    if(user.emailChangeOTP!== otp.toString().trim()){
      return res.status(400).json({
        success:false,
        message:"Invalid OTP"
      });
    }

    if(!user.emailChangeOTPExpires || user.emailChangeOTPExpires<new Date()){
      return res.status(400).json({
        success:false,
        message:"OTP expired! Request new OTP! "
      });
    }

    user.email=user.pendingEmail;
    user.isVerified=true;

    user.pendingEmail=null;
    user.emailChangeOTP=null;
    user.emailChangeOTPExpires=null;

    await user.save();

    return res.status(200).json({
      success:true,
      message:"Email Updated Successfully!",
      user:{
        email:user.email,
        isVerified:user.isVerified
      }
    });

  }catch(error){
    console.error("Email change verification errro");

    return res.status(500).json({
      success:false,
      message:"Something went wrong!"
    });
  }
}






//password change 


const changePassword = async (req, res) => {
  try {
    const {
      currentPassword,
      newPassword,
      confirmNewPassword
    } = req.body;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "All password fields are required!"
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "New passwords do not match!"
      });
    }

    // Password strength validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least 8 characters, an uppercase letter, a lowercase letter, a number, and a special character."
      });
    }

    // Find the logged-in user
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found!"
      });
    }

    // Google users cannot change passwords here
    if (user.isGoogleUser) {
      return res.status(400).json({
        success: false,
        message: "Please continue using Google to sign in."
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect!"
      });
    }

    // Prevent reusing the current password
    const samePassword = await bcrypt.compare(
      newPassword,
      user.password
    );

    if (samePassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from the current password!"
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully!"
    });

  } catch (error) {
    console.error("Change password error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong!"
    });
  }
};





//LOGOUT



const logout = (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/"
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful!"
    });
  } catch (error) {
    console.error("Logout error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong!"
    });
  }
};



//add address


const addAddress = async (req, res) => {
  try {
    const { label, fullName, phone, address, isDefault } = req.body;

    if (!label || !fullName || !phone || !address) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required address fields!"
      });
    }

    const newAddress = new Address({
      userId: req.user.id,
      label: label.trim(),
      fullName: fullName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      isDefault: Boolean(isDefault)
    });

    if (newAddress.isDefault) {
      await Address.updateMany(
        { userId: req.user.id },
        { $set: { isDefault: false } }
      );
    }

    await newAddress.save();

    return res.status(201).json({
      success: true,
      message: "Address saved successfully!",
      address: newAddress
    });
  } catch (error) {
    console.error("Add Address Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to save address. Please try again."
    });
  }
};



//save address
const getAddress=async (req,res)=>{
  try{
    const address=await Address.find({
      userId:req.user.id
  }).sort({createdAt:-1});

  return res.status(200).json({
    success:true,
    addresses:address
  });


  }catch(error){
    console.error("Error in saving Address!");

    return res.ststus(500).json({
      success:false,
      message:"Unable to load Addresses!"
    })
  }
}


 // update address




const updateAddress = async (req, res) => {
  try {
    const { label, fullName, phone, address, isDefault } = req.body;
    const { id } = req.params;

    if (!label || !fullName || !phone || !address) {
      return res.status(400).json({
        success: false,
        message: "All address fields are required!"
      });
    }

    const existingAddress = await Address.findOne({
      _id: id,
      userId: req.user.id
    });

    if (!existingAddress) {
      return res.status(404).json({
        success: false,
        message: "Address not found!"
      });
    }

    if (isDefault) {
      await Address.updateMany(
        { userId: req.user.id, _id: { $ne: id } },
        { $set: { isDefault: false } }
      );
    }

    existingAddress.label = label.trim();
    existingAddress.fullName = fullName.trim();
    existingAddress.phone = phone.trim();
    existingAddress.address = address.trim();
    existingAddress.isDefault = Boolean(isDefault);

    await existingAddress.save();

    return res.status(200).json({
      success: true,
      message: "Address updated successfully!",
      address: existingAddress
    });
  } catch (error) {
    console.error("Update address error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update address. Please try again."
    });
  }
};



 // delete address


const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedAddress = await Address.findOneAndDelete({
      _id: id,
      userId: req.user.id
    });

    if (!deletedAddress) {
      return res.status(404).json({
        success: false,
        message: "Address not found!"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Address removed successfully!"
    });
  } catch (error) {
    console.error("Delete address error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to remove address. Please try again."
    });
  }
};

//setdefault


const setDefaultAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const address = await Address.findOne({
      _id: id,
      userId: req.user.id
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found!"
      });
    }

    // Remove default status 
    await Address.updateMany(
      { userId: req.user.id },
      { $set: { isDefault: false } }
    );

  
    address.isDefault = true;
    await address.save();

    return res.status(200).json({
      success: true,
      message: "Default address updated successfully!",
      address
    });
  } catch (error) {
    console.error("Set default address error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to set default address. Please try again."
    });
  }
};




module.exports={
  userSignup,
  login,
  logout,
  resendOTP,
  forgotPassword,
  resetPassword,
  verifyOTP,
  googleLogin,
  getProfile,
  updateProfile,
  requestEmailChange,
  verifyEmailChange,
  changePassword,
  addAddress,
  getAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
}