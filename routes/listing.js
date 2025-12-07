const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { validateListing, isLoggedIn, isOwner } = require("../middleware.js");
const listingController = require("../controllers/listingController.js");

//Index Route: see all listings
router.get("/", wrapAsync(listingController.allListings));

//New Route: to get the form to create new listing
router.get("/new", isLoggedIn, listingController.newListing);
//Create Route: to add the new listing to the DB
router.post("/", isLoggedIn, validateListing, wrapAsync(listingController.createListing));

//NOTE: keep this show route after the new route of else the code will mistake new as ':id' as it'll first check for id and then for new
//Show Route: see individual listing
router.get("/:id", isOwner, wrapAsync(listingController.showListing));

//Edit Route: to get the form to create edit listing
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.editListing));
//Update Route: to add the edited listings to the DB
router.put("/:id", isLoggedIn, isOwner, validateListing, wrapAsync(listingController.updateListing));

//Destroy Route: to delete the listing
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));

module.exports = router;