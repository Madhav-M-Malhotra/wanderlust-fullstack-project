const express = require("express");
const router = express.Router({mergeParams: true});//so that we can access the params form the whole url and not just what is added here
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema } = require("../schema.js");

//middleware function for joi
const validateReview = (req,res,next) =>{
    let { error } = reviewSchema.validate(req.body);
    if(error) {
        errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
}

//POST Review Route
router.post("/", validateReview, wrapAsync(async(req,res)=>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    req.flash("success","New Review Created!");//success partial
    res.redirect(`/listings/${listing._id}`);
}));
//DELETE Review Route
router.delete("/:reviewId", wrapAsync(async(req,res)=>{
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if(review.author.equals(req.user._id)){
        await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});//removing the reviewId from the reviews array
        await Review.findByIdAndDelete(reviewId);

        req.flash("success","Review Deleted!");//success partial
    } else {
        req.flash("failure","You Are Not Authorized To Delete This Review!");//failure partial
    }
    res.redirect(`/listings/${id}`);
}));

module.exports = router;