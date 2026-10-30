const express=require('express');
const router=express.Router();
const authMiddleware=require("../middleware/authMiddleware");


const {
    userSignup,
    login,
    logout,
    verifyOTP,
    resendOTP,
    resetPassword,
    forgotPassword,
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
    }=require("../controller/userController");

router.post("/signup",userSignup);
router.post("/login",login);
router.post("/logout",logout);
router.post("/resend-otp",resendOTP);
router.post("/verify-otp",verifyOTP);
router.post("/forgot-password",forgotPassword);
router.post("/reset-password",resetPassword);
router.post('/google-login',googleLogin);
router.get("/profile",authMiddleware,getProfile);
router.put("/profile",authMiddleware,updateProfile);
router.post("/request-email-change",authMiddleware,requestEmailChange);
router.post("/verify-email-change",authMiddleware,verifyEmailChange);
router.put("/change-password",authMiddleware,changePassword);
router.post("/addresses",authMiddleware,addAddress);
router.get("/addresses",authMiddleware,getAddress);
router.put("/addresses/:id",authMiddleware,updateAddress);
router.delete("/addresses/:id",authMiddleware,deleteAddress);
router.patch("/addresses/:id/default",authMiddleware,setDefaultAddress);


// Check whether the user is logged in
router.get("/check-auth", authMiddleware, (req, res) => {
    res.status(200).json({
        success: true,
        isLoggedIn: true
    });
});


module.exports=router;