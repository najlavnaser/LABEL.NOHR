const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../model/adminModel");
const User = require("../model/userModel");

//LOGIN
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and Password Required!",
      });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid Email!",
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, admin.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "PAssword do not match",
      });
    }

    const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.cookie("adminToken", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Admin login Successful!!",
      admin: {
        id: admin._id,
        email: admin.email,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong!",
    });
  }
};

//LOGOUT

const adminLogout = async (req, res) => {
  try {
    res.clearCookie("adminToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({
      success: true,
      message: "Admin logout API is working!",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong!",
    });
  }
};

//GET USERS

const getUsers = async (req, res) => {
  const { search, page = 1, limit = 10 } = req.query;
  try {
    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};
    const skip = (page - 1) * limit;

    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / Number(limit));

    const users = await User.find(query)
      .select(
        "-password -otp -otpExpires -resetPasswordToken -resetPasswordExpires",
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully!",
      users: users,
      pagination:{
        currentPage:Number(page),
        totalPages:totalPages,
        totalUsers:totalUsers,
        limit:Number(limit)
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error in Get Users!",
    });
  }
};

//BLOCK/UNBLOCK
const blockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not Found!",
      });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    return res.status(200).json({
      success: true,
      message: user.isBlocked
        ? "User Blocked Successfully!"
        : "User Unblocked Successfully!",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isBlocked: user.isBlocked,
      },
    });
  } catch (error) {
    console.error("Error in blocking!", error);

    return res.status(500).json({
      success: false,
      message: "Error while uploading status!",
    });
  }
};

module.exports = {
  adminLogin,
  adminLogout,
  getUsers,
  blockUser,
};
