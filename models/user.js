const { types, required } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email: {
        type:String,
        required: true
    },

});

userSchema.plugin(passportLocalMongoose);//the plugin will add the username and password to the schema, and also add salting, hashing, and methods
//read npm docs of 'passport-local-mongoose' for more

module.exports = mongoose.model('User',userSchema);