const Listing = require("./models/listing.js");
const wrapAsync = require("./utils/wrapAsync.js");

module.exports.isLoggedIn = (req,res,next) => {
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error","Please log in to continue.");
        return res.redirect("/login");
    };
    next();
};

module.exports.isOwner = wrapAsync(async(req,res,next) => {
    req.listing = await Listing.findById(req.params.id).populate({path :'reviews',populate :{path :"author", select :"username"}});
    if(!req.listing){
        req.flash("failure","Requested Listing Doesn't Exist!");//failure partial
        return res.redirect("/listings");
    }
    req.isOwner = req.user && req.user._id.equals(req.listing.owner);
    next();
});

module.exports.saveRedirectUrl = (req,res,next) => {
    res.locals.redirectUrl = req.session.redirectUrl || "/listings";
    next();
};