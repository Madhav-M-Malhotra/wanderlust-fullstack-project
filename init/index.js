require("dotenv").config();
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

main().then(()=>{
    console.log("connected to DB")
}).catch((err)=>{
    console.log(err)
});

async function main() {
    await mongoose.connect(process.env.MONGODB_URI);
}

const initDB = async() => {
    await Listing.deleteMany();
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
};

initDB();