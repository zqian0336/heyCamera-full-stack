var mongoose = require("mongoose");

var photoSchema = new mongoose.Schema({
    name: String,
    image: String,
    imageId: String,
    description: String,
    // location: String,
    // lat: Number,
    // lng: Number,
    createdAt: {type: Date, default: Date.now},
    author : {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref : "User"
        },
        username: String,
        avatar: String
    },
    comments:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
});


module.exports = mongoose.model("Photo", photoSchema);