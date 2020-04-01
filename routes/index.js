var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Photo = require("../models/photo");
const multer = require("multer");
var cloudinary = require('cloudinary');


var storage = multer.diskStorage({
    filename: function (req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({storage: storage, fileFilter: imageFilter});


cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


router.get("/", function (req, res) {
    res.render("landing");
});

//show sign up form
router.get("/signup", function (req, res) {
    res.render("signup", {page: 'signup'});
});


//handle sign up logic
router.post("/signup", function (req, res) {
    var newUser = new User({username: req.body.username, email: req.body.email});

    User.register(newUser, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            return res.render("signup", {error: err.message});
        }
        passport.authenticate("local")(req, res, function () {
            req.flash("success", "Successfully Signed Up! Nice to meet you " + req.body.username);
            res.redirect("/photoboards");
        });
    });
});
//passport.authenticate()就像公司给你授权，sign in时只有建立完成时，最后给你授权，login是在登陆途中检验你是否授权
//用local的方式
//SIGN UP::passport.authenticate("local")(req,res,function(){res.redirect("/index")});
//SIGN  IN::passport.authenticate("local",{success? or failure})

// //app.post(/login,middleware,callback);middleware就是三岔口，前面有两条路
// app.post("/signin",passport.authenticate("local", {  //会调用28:passport.use(new LocalStrategy(User.authenticate()));
//     successRedirect: "/index",                     //会自动联系数据库查找以前有没有sign in，数据库里面有没有
//     failureRedirect: "/signin"
// }),function(req, res){
// });


router.get("/signin", function (req, res) {
    res.render("signin", {page: 'signin'});
});


// Login
router.post('/signin',
    passport.authenticate('local', {
        successRedirect: '/photoboards',
        failureRedirect: '/signin',
        failureFlash: 'Invalid username or password',
        successFlash: 'Welcome'
    }), function (req, res) {
    });

// app.get('/signin', function(req, res, next) {
//     passport.authenticate('local', function(err, user, info) {
//         if (err) {
//             alert("Invalid username or password")
//             return next(err);
//         }
//         if (!user) {
//             alert("Invalid username or password")
//             return res.redirect('/signin');
//         }
//         req.logIn(user, function(err) {
//             if (err) {
//                 alert("Invalid username or password")
//                 return next(err); }
//             req.flash('Welcome');
//             return res.redirect('/photoboards');
//         });
//     })(req, res, next);
// });


router.get("/logout", function (req, res) {
    req.logout();
    req.flash('success', 'Good bye');
    res.redirect("/photoboards");
});


router.get("/users/:id", function (req, res) {
    User.findById(req.params.id, function (err, foundUser) {
        if (err) {
            req.flash("error", "Something went wrong.");
            return res.redirect("/photoboards");
        }
        Photo.find().where('author.id').equals(foundUser._id).exec(function (err, postedPhoto) {
            if (err) {
                req.flash("error", "Something went wrong.");
                return res.redirect("/photoboards");
            }
            res.render("users/show", {user: foundUser, postedPhotos: postedPhoto});
        });
    });
});


router.get("/users/:id/edit", function (req, res) {
    User.findById(req.params.id, function (err, editedUser) {
        if (err) {
            req.flash("error", "You cannot edit.ejs your profile");
            return res.redirect("back");
        }
        res.render("users/editProfile", {editedUser: editedUser});

    })
});


router.put("/users/:id", upload.single('avatar'), function (req, res) {
    User.findById(req.params.id, async function (err, editedUser) {
        if (err) {
            req.flash("error", err.message);
            res.redirect('back');
        } else {
            if (req.file) {
                try {
                    await cloudinary.config({
                        cloud_name: process.env.CLOUD_NAME,
                        api_key: process.env.CLOUDINARY_API_KEY,
                        api_secret: process.env.CLOUDINARY_API_SECRET
                    });

                    //await cloudinary.uploader.destroy(editedUser.avatarId); //await
                    var result = await cloudinary.uploader.upload(req.file.path);
                    editedUser.avatarId = result.public_id;
                    editedUser.avatar = result.url;
                } catch (err) {
                    req.flash("error", err.message);
                    return res.redirect("back");
                }

            }
            editedUser.username = req.body.username;
            editedUser.email = req.body.email;
            editedUser.bio = req.body.bio;
            editedUser.save();

            Photo.find().where('author.id').equals(editedUser._id).exec(await function (err, postedPhoto) {
                if (err) {
                    req.flash("error", "Something went wrong.");
                    return res.redirect("/photoboards");
                }
                postedPhoto.forEach(function (pic) {
                    pic.author.avatar = editedUser.avatar;
                    pic.author.username = editedUser.username;
                    pic.save();

                });
            });


            req.flash("success", "Successfully Updated!");
            res.redirect("/users/" + editedUser._id);


            // });
        }
    });

});


module.exports = router;