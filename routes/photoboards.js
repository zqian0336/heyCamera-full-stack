const express = require("express");
const router = express.Router();
const Photo = require("../models/photo");
const User = require("../models/user");
const Comment = require("../models/comment");
const middleware = require("../middleware");
//const NodeGeocoder = require('node-geocoder');
const multer = require("multer");
var cloudinary = require('cloudinary');

// var options = {
//     provider: 'google',
//     httpAdapter: 'https',
//     apiKey: process.env.GEOCODER_API_KEY,
//     formatter: null
// };
// var geocoder = NodeGeocoder(options);
// const storage = multer.diskStorage({
//     destination: 'public/uploads',
//     filename: function (req, file, cb) {
//         cb(null, new Date().toISOString() +'-'+ file.originalname);
//     }
// });



var storage = multer.diskStorage({
    filename: function(req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        req.flash('error','Only image files are allowed!(jpg/jpeg/png/gif)');
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter});


cloudinary.config({
    cloud_name: 'heycameracloud',

    api_key:'376791236774896',
    api_secret:'9FMfW8bOifudt50zYXxcDsVE_EQ'
    // api_key: process.env.CLOUDINARY_API_KEY,
    // api_secret: process.env.CLOUDINARY_API_SECRET
});






let {isLogged, checkUserPhoto, checkUserComment} = middleware;


// Define escapeRegex function for search feature
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};




//index page: show all photos
router.get("/", function(req, res){
    if(req.query.search && req.xhr) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        // Get all campgrounds from DB
        Photo.find({name: regex}, function (err, allPhotos) {
            if (err) {
                console.log(err);
            } else {
                res.status(200).json(allPhotos);
            }
        });
    } else {
        Photo.find({}, function (err, allPhotos) {
            if (err) {
                console.log(err);
            } else {
                if(req.xhr) {
                    res.json(allPhotos);
                }else {
                    res.render("photoboards/index", {allPhotos: allPhotos, page: 'photoboards'});
                    // photoboards-> allPhoto, 在index中allPhotos 是一个set，包含了所有的照片对象
                }
            }
        });
    }
});

//create : add new photo

router.post("/", isLogged, upload.single('image'), function (req, res) {

    cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
        if(err) {
            req.flash('error', err.message);
            return res.redirect('back');
        }


        req.body.photoboard.image = result.url;
        req.body.photoboard.imageId = result.public_id;
        req.body.photoboard.author = {
            id: req.user._id,
            username: req.user.username,
            avatar: req.user.avatar
        }
        // var newPhoto = {name: name, image:image, imageId: imageId, description: desc, author: author, location: location, lat: lat, lng: lng};
        Photo.create(req.body.photoboard, function(err, photoboard) {
            if (err) {
                req.flash('error', err.message);
                return res.redirect('back');
            }
            req.user.isOld = true;
            res.redirect('/photoboards/' + photoboard.id);
        });
    });

});

//new : show form to create new photo
router.get("/new",isLogged, function(req, res){
    res.render("photoboards/new");
});

//show : show more info about photo
router.get("/:id" , function(req,res){
    Photo.findById(req.params.id).populate("comments").exec(function(err, foundPhoto){
        if(err || !foundPhoto){
            console.log(err);
            req.flash('error', 'Sorry, the photo does not exist');
            return res.redirect("/photoboards");
        }
        res.render("photoboards/show", {foundPhoto: foundPhoto, page: 'show'}); //这个foundPhoto会在show.ejs 中用到
    });
});


// EDIT - shows edit.ejs form for a campground
router.get("/:id/edit", isLogged, function(req, res){
    Photo.findById(req.params.id, function (err, foundPhoto) {
        if(err){
            console.log(err);
        }else{
            //render edit.ejs template with that campground
            res.render("photoboards/editPhoto", {editedPhoto: foundPhoto});
        }

    });

});

// PUT - updates campground in the database
router.put("/:id", upload.single('image'), function(req, res){
    Photo.findById(req.params.id, async function(err, editedPhoto){
        if(err){
            req.flash("error", err.message);
            res.redirect('back');
        } else{
            // geocoder.geocode(req.body.location, async function (err, data) {
            //     // editedPhoto.lat = data.results[0].geometry.location.lat;
            //     // editedPhoto.lng = data.results[0].geometry.location.lng;
            //     // editedPhoto.location = data.results[0].formatted_address;
            //     editedPhoto.lat = data[0].latitude;
            //     editedPhoto.lng = data[0].longitude;
            //     editedPhoto.location = data[0].formattedAddress;

                if(req.file){
                    try {
                        await cloudinary.uploader.destroy(editedPhoto.imageId); //await
                        var result = await cloudinary.uploader.upload(req.file.path); //await
                        editedPhoto.imageId = result.public_id;
                        editedPhoto.image = result.url;
                    } catch (err) {
                        req.flash("error", err.message);
                        return res.redirect("back");
                    }

                }
                editedPhoto.name = req.body.name;
                editedPhoto.description = req.body.description;
                editedPhoto.save();
                req.flash("success","Successfully Updated!");
                res.redirect("/photoboards/" + editedPhoto._id);


            // });
        }
    });

});

router.delete("/:id", isLogged, checkUserPhoto, function(req, res) {

        Photo.findById(req.params.id, async function (err, foundPhoto) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            try {
                await cloudinary.v2.uploader.destroy(foundPhoto.imageId);
                foundPhoto.remove();
                req.flash("success", "Photo deleted !");
                res.redirect("/photoboards");
            } catch (err) {
                if (err) {
                    req.flash("error", err.message);
                    return res.redirect("back");
                }
            }
        })

});
module.exports = router;