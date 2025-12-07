const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

module.exports.createReview = async(req,res)=>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    req.flash("success","New Review Created!");//success partial
    res.redirect(`/listings/${listing._id}`);
}

module.exports.deleteReview = async(req,res)=>{
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
}