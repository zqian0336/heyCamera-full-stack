const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const passport = require("passport");
const LocalStrategy = require("passport-local");

const cookieParser = require("cookie-parser");
const flash = require("connect-flash");

const User = require("./models/user");
const Photo = require("./models/photo");//用这个来给对象倒入数据库模版
const Comment = require("./models/comment");

const session = require("express-session");
const methodOverride = require("method-override");
// var seedDB      = require("./seeds")




require('dotenv').config();

//requiring routes
const routeOfPhotoboards = require("./routes/photoboards");
const routeOfIndex = require("./routes/index");
const routeOfComments = require("./routes/comments");




//mongoose promise library
mongoose.Promise = global.Promise;

const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/local';

mongoose.connect(dbUri, {useNewUrlParser: true, useUnifiedTopology: true})
   .then(() => console.log('DataBase has been connected'))
   .catch(err => console.log('database connection failed'));


// EJS
app.set("view engine", "ejs");



// Express body parser
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride('_method'));
app.use(cookieParser());

// Express session
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: "robin shop"

}));

// Connect flash
app.use(flash());

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());




app.locals.moment = require("moment");
// seedDB();




passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// passport.use(new LocalStrategy(
//     function(username, password, done) {
//         User.findOne({ username: username }, function (err, user) {
//             if (err) { return done(err); }
//             if (!user) { return done(null, false, {message: "username does not exist"}); }
//             if (user.password != passport) { return done(null, false, {message: 'Incorrect Password'}); }
//             return done(null, user);
//         });
//     }
// ));
//
//
// //Sessions
// passport.serializeUser(function(user, done) {
//     done(null, user.id);
// });
//
// passport.deserializeUser(function(id, done) {
//     User.findById(id, function (err, user) {
//         done(err, user);
//     });
// });


app.use(function(req,res,next){
    res.locals.currentUser=req.user; //这一步是为了让全部网页都适用于“login之后就自动登陆这项法则”
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();       //work as middleware,

});
//===============




app.use("/", routeOfIndex); //如何前往下一步, landing
app.use("/photoboards", routeOfPhotoboards);
app.use("/photoboards/:id/comments", routeOfComments);


app.listen(process.env.PORT || 3000  , process.env.IP, function(){
    console.log("HeyCamera Server Started!");
});