const Listing = require("./models/listing.js");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const axios = require("axios");

//middleware functions for joi
module.exports.validateListing = (req,res,next) =>{
    let { error } = listingSchema.validate(req.body);
    if(error) {
        errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
}

module.exports.validateReview = (req,res,next) =>{
    let { error } = reviewSchema.validate(req.body);
    if(error) {
        errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
}

//middleware function for Authentication
module.exports.isLoggedIn = (req,res,next) => {
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error","Please log in to continue.");
        return res.redirect("/login");
    };
    next();
};

module.exports.saveRedirectUrl = (req,res,next) => {
    res.locals.redirectUrl = req.session.redirectUrl || "/listings";
    next();
};

//middleware function for Authorization
module.exports.isOwner = wrapAsync(async(req,res,next) => {
    req.listing = await Listing.findById(req.params.id).populate({path :'reviews',populate :{path :"author", select :"username"}});
    if(!req.listing){
        req.flash("failure","Requested Listing Doesn't Exist!");//failure partial
        return res.redirect("/listings");
    }
    req.isOwner = req.user && req.user._id.equals(req.listing.owner);
    next();
});

//middleware function for GeoCoding
module.exports.geoCode = wrapAsync(async(req,res,next)=>{
    const verifyCountry = await axios.get(`https://nominatim.openstreetmap.org/search?country=${req.body.listing.country}&format=json`);//structured query
    if(verifyCountry.data.length == 0){
        throw new ExpressError(400,"Invalid Country Name!");
    }else{
        req.body.listing.country = verifyCountry.data[0].name;
        const verifyLocation = await axios.get(`https://nominatim.openstreetmap.org/search?q=${req.body.listing.location+", "+req.body.listing.country}&format=json`);//free-form query
        if(verifyLocation.data.length == 0){
            throw new ExpressError(400,"Invalid Location!");
        }else{
            req.body.listing.geometry = {
                type: "Point",
                coordinates: [verifyLocation.data[0].lon,verifyLocation.data[0].lat]
            };//GeoJSON format
        }
    }
    next();
})