const User = require("../models/user");

module.exports.newUser = (req,res)=>{
    res.render("users/signup.ejs");
}

module.exports.createUser = async(req,res,next)=>{
    try{
        const { username, email, password } = req.body;
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

}

module.exports.logIn = (req,res)=>{
    res.render("users/login.ejs");
}

module.exports.authenticateUser = async(req,res)=>{
    req.flash("success","Welcome back to WanderLust!");
    res.redirect(res.locals.redirectUrl);
}

module.exports.logOut = (req,res,next) => {
    req.logOut((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success", "Logout successful. See you next time!");
        res.redirect("/listings");
    });
}