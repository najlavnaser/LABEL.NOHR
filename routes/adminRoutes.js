const express=require('express');
const router=express.Router();

const {adminLogin,adminLogout,getUsers,blockUser}=require("../controller/adminController.js");

const adminMiddleware = require("../middleware/adminMiddleware");

router.post("/login", adminLogin);
router.post("/logout",adminLogout);
router.get("/users", adminMiddleware, getUsers);


router.patch("/users/:userId/toggle-block",adminMiddleware,blockUser);



module.exports=router;