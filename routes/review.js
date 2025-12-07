const express = require("express");
const router = express.Router({mergeParams: true});//so that we can access the params form the whole url and not just what is added here
const wrapAsync = require("../utils/wrapAsync.js");
const { validateReview } = require("../middleware.js");
const reviewController = require("../controllers/reviewController.js");

//POST Review Route
router.post("/", validateReview, wrapAsync(reviewController.createReview));
//DELETE Review Route
router.delete("/:reviewId", wrapAsync(reviewController.deleteReview));

module.exports = router;