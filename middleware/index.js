var Comment = require("../models/comment");
var Photo = require("../models/photo");
module.exports = {
    isLogged: function (req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        req.flash('error', 'Please sign in first');
        res.redirect('/signin');
    },
    checkUserPhoto: function (req, res, next) {
        Photo.findById(req.params.id, function (err, foundPhoto) {
            if (err || !foundPhoto) {
                console.log(err);
                req.flash('error', 'Sorry, that Photo does not exist!');
                res.redirect('/photoboards');
            } else if (foundPhoto.author.id.equals(req.user._id)) {
                req.photoboard = foundPhoto;
                next();
            } else {
                req.flash('error', 'You don\'t have permission to do that!');
                res.redirect('/photoboards/' + req.params.id);
            }
        });
    },
    checkUserComment: function (req, res, next) {
        Comment.findById(req.params.commentId, function (err, foundComment) {
            if (err || !foundComment) {
                console.log(err);
                req.flash('error', 'Sorry, that comment does not exist!');
                res.redirect('/photoboards');
            } else if (foundComment.author.id.equals(req.user._id)) {
                req.comment = foundComment;
                next();
            } else {
                req.flash('error', 'You don\'t have permission to do that!');
                res.redirect('/photoboards/' + req.params.id);
            }
        });
    }


};