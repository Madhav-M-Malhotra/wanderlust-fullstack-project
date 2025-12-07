const Listing = require("../models/listing.js");

module.exports.allListings = async(req,res)=>{
    const allListings = await Listing.find();
    res.render("listings/index.ejs",{ allListings });
}

module.exports.newListing = (req,res)=>{
    res.render("listings/new.ejs");
}

module.exports.createListing = async(req,res)=>{
    let newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success","New Listing Created!");//success partial
    res.redirect("/listings");
}

module.exports.showListing = async(req,res)=>{
    let listing = req.listing;
    res.render("listings/show.ejs",{ listing, isOwner: req.isOwner, currUser: req.user });
}

module.exports.editListing = async(req,res)=>{
    if(req.isOwner){
        let listing = req.listing;
        res.render("listings/edit.ejs", { listing });
    }else {
        req.flash("failure","You Are Not Authorized To Edit This Listing!");//failure partial
        return res.redirect("/listings");
    }
}

module.exports.updateListing = async(req,res)=>{
    if(req.isOwner){
        const { id } = req.params;
        await Listing.findByIdAndUpdate(id, {...req.body.listing});
        req.flash("success","Listing Updated!");//success partial
        res.redirect(`/listings/${id}`);
    } else {
        req.flash("failure","You Are Not Authorized To Edit This Listing!");//failure partial
        return res.redirect("/listings");
    }
}

module.exports.deleteListing = async(req,res)=>{
    if(req.isOwner){
        await Listing.findByIdAndDelete(req.params.id);
        req.flash("success","Listing Deleted!");//success partial
        res.redirect("/listings");
    }else {
        req.flash("failure","You Are Not Authorized To Delete This Listing!");//failure partial
        return res.redirect("/listings");
    }
}