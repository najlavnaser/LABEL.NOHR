const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    gender:{
      type:String,
      enum:["Male","Female",""],
      default:""
    },

    profileImage: {
      type: String,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
    },
    pendingEmail:{
      type:String,
      default:null,
    },
    emailChangeOTP:{
      type:String,
      default:null,
    },
    emailChangeOTPExpires:{
      type:Date,
      default:null,
    },

    otp:String,
    otpExpires:Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,

    isBlocked: {
      type: Boolean,
      default: false,
    },
    isGoogleUser: {
      type: Boolean,
      default: false,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  },
);
module.exports = mongoose.model("User", userSchema);
