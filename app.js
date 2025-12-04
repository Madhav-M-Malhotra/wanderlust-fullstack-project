require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const mongoose = require("mongoose");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
//Router imports
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"/public")));
//Express Sessions
const sessionOptions = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7*24*60*60*1000,//value in miliseconds
        maxAge: 7*24*60*60*1000,
        httpOnly: true//ByDefault do this for security. To protect from Cross-site Scripting Attacks (XSS)
    }
};
app.use(session(sessionOptions));
app.use(flash());//place flash before defining routes

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());//storing info of user into the session
passport.deserializeUser(User.deserializeUser());//removing info of user from the session

app.engine("ejs", ejsMate);

main().then(()=>{
    console.log("connected to DB");
}).catch((err)=>{
    console.log(err);
});

async function main() {
    await mongoose.connect(process.env.MONGODB_URI);
}

app.listen(process.env.PORT,()=>{
    console.log("Server listening");
});

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.failure = req.flash("failure");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})

//Listing Routes
app.use("/listings", listingRouter);
//Review Routes
app.use("/listings/:id/reviews", reviewRouter);
//User Routes
app.use("/", userRouter);

//if a requrest is sent to a route that doesn't exist then the below code will raise an error of Page Not Found
app.use((req,res,next)=>{
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err,req,res,send)=>{
    let { status=500, message="Something went wrong!" } = err;
    res.status(status).render("error.ejs",{ message });
});