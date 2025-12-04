const express = require("express");
const wrapAsync = require("../utils/wrapAsync");
const User = require("../models/user");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware");
const router = express.Router();

//New User Route: Sign-up Form
router.get("/signup",(req,res)=>{
    res.render("../views/users/signup.ejs");
});

//Create User Route
router.post("/signup", wrapAsync(async(req,res)=>{
    try{
        let { username, email, password } = req.body;
        const newUser = new User({email,username});
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, (err)=>{
            if(err){
                return next(err);
            }
            req.flash("success", "Welcome to WanderLust!");
            res.redirect("/listings");
        });
    } catch(e){
        req.flash("failure",e.message);
        res.redirect("/signup");
    }

}));

//Log-in Route
router.get("/login", (req,res)=>{
    res.render("../views/users/login.ejs");
})

//Authenticate Log-in Route
router.post("/login", saveRedirectUrl, passport.authenticate("local", { failureRedirect: '/login', failureFlash: true }), wrapAsync(async(req,res)=>{
    req.flash("success","Welcome back to WanderLust!");
    res.redirect(res.locals.redirectUrl);
}));

//Log-out Route
router.get("/logout", (req,res,next) => {
    req.logOut((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success", "Logout successful. See you next time!");
        res.redirect("/listings");
    });
});

module.exports = router;