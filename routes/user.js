const express = require("express");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware");
const router = express.Router();
const userController = require("../controllers/userController");

//New User Route: Sign-up Form
router.get("/signup",userController.newUser);

//Create User Route
router.post("/signup", wrapAsync(userController.createUser));

//Log-in Route
router.get("/login", userController.logIn);

//Authenticate Log-in Route
router.post("/login", saveRedirectUrl, passport.authenticate("local", { failureRedirect: '/login', failureFlash: true }), wrapAsync(userController.authenticateUser));

//Log-out Route
router.get("/logout", userController.logOut);

module.exports = router;