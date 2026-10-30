
const express = require("express");
const path = require("path");
const jwt = require("jsonwebtoken");

const router = express.Router();


router.get("/", (req, res) => {
    res.render("user/homepage");
});


router.get("/login", (req, res) => {
    res.render("user/login");
});


router.get("/signup", (req, res) => {
    res.render("user/signup");
});


router.get("/homepage", (req, res) => {
    res.render("user/homepage");
});


// Protect the profile page
router.get(["/profile", "/profile.html"], (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect("/login");
    }

    try {
        jwt.verify(token, process.env.JWT_SECRET);

        return res.render("user/profile");
    } catch (error) {
        return res.redirect("/login");
    }
});


//edit profile
router.get("/edit-profile", (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect("/login");
    }

    try {
        jwt.verify(token, process.env.JWT_SECRET);
        return res.render("user/editProfile");
    } catch (error) {
        return res.redirect("/login");
    }
});


//verify otp
router.get("/verify-otp", (req, res) => {
    res.render("user/verify-otp");
});

module.exports = router;
