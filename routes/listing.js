const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");
const { isLoggedIn, isOwner } = require("../middleware.js");

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
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success","New Listing Created!");//success partial
    res.redirect("/listings");
}));

//NOTE: keep this show route after the new route of else the code will mistake new as ':id' as it'll first check for id and then for new
//Show Route: see individual listing
router.get("/:id", isOwner, (req,res)=>{
    let listing = req.listing;
    res.render("listings/show.ejs",{ listing, isOwner: req.isOwner });
});

//Edit Route: to get the form to create edit listing
router.get("/:id/edit", isLoggedIn, isOwner, (req,res)=>{
    if(req.isOwner){
        let listing = req.listing;
        res.render("listings/edit.ejs", { listing });
    }else {
        req.flash("failure","You Are Not Authorized To Edit This Listing!");//failure partial
        return res.redirect("/listings");
    }
});
//Update Route: to add the edited listings to the DB
router.put("/:id", isLoggedIn, isOwner, validateListing, wrapAsync(async(req,res)=>{
    if(req.isOwner){
        await Listing.findByIdAndUpdate(req.params.id, {...req.body.listing});
        req.flash("success","Listing Updated!");//success partial
        res.redirect(`/listings/${id}`);
    } else {
        req.flash("failure","You Are Not Authorized To Edit This Listing!");//failure partial
        return res.redirect("/listings");
    }
}));

//Destroy Route: to delete the listing
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(async(req,res)=>{
    if(req.isOwner){
        await Listing.findByIdAndDelete(req.params.id);
        req.flash("success","Listing Deleted!");//success partial
        res.redirect("/listings");
    }else {
        req.flash("failure","You Are Not Authorized To Delete This Listing!");//failure partial
        return res.redirect("/listings");
    }
}));

module.exports = router;