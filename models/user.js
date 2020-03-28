var mongoose = require("mongoose");

var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
    username: String,
    email: String,
    avatar: {type: String, default: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"},
    avatarId: String,
    password: String,
    isAdmin: {type: Boolean, default: false},
    bio: String

});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User",userSchema);