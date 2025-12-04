const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");
const { isLoggedIn } = require("../middleware.js");

//middleware function for joi
const validateListing = (req,res,next) =>{
    let { error } = listingSchema.validate(req.body);
    if(error) {
        errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
}

//Index Route: see all listings
router.get("/", wrapAsync(async(req,res)=>{
    allListings = await Listing.find();
    res.render("listings/index.ejs",{ allListings });
}));

//New Route: to get the form to create new listing
router.get("/new", isLoggedIn, (req,res)=>{
    res.render("listings/new.ejs");
});
//Create Route: to add the new listing to the DB
router.post("/", isLoggedIn, validateListing, wrapAsync(async(req,res)=>{
    let newListing = new Listing(req.body.listing);
    await newListing.save();
    req.flash("success","New Listing Created!");//success partial
    res.redirect("/listings");
}));

//NOTE: keep this show route after the new route of else the code will mistake new as ':id' as it'll first check for id and then for new
//Show Route: see individual listing
router.get("/:id", wrapAsync(async(req,res)=>{
    let { id } = req.params;
    const listing = await Listing.findById(id).populate('reviews');
    if(!listing){
        req.flash("failure","Requested Listing Doesn't Exist!");//failure partial
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs",{ listing });
}));

//Edit Route: to get the form to create edit listing
router.get("/:id/edit", isLoggedIn, wrapAsync(async(req,res)=>{
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if(!listing){
        req.flash("failure","Requested Listing Doesn't Exist!");//failure partial
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
}));
//Update Route: to add the edited listings to the DB
router.put("/:id", isLoggedIn, validateListing, wrapAsync(async(req,res)=>{
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    req.flash("success","Listing Updated!");//success partial
    res.redirect(`/listings/${id}`);
}));

//Destroy Route: to delete the listing
router.delete("/:id", isLoggedIn, wrapAsync(async(req,res)=>{
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success","Listing Deleted!");//success partial
    res.redirect("/listings");
}));

module.exports = router;