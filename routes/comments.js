var express = require("express");
var router = express.Router({mergeParams: true});
var Photo = require("../models/photo");
var Comment = require("../models/comment");
var middleware = require("../middleware");
var {isLogged, checkUserComment} = middleware;




router.get("/new", isLogged, function(req,res){
    console.log(req.params.id);
    Photo.findById(req.params.id, function(err, commentedPhoto){
        if(err){
            console.log(err);
        }else{
            res.render("comments/new", {commentedPhoto:commentedPhoto});
        }

    });
});


router.post("/photoboards/:id", isLogged, function(req, res){
    Photo.findById(req.params.id, function(err, commentedPhoto){
        if(err){
            console.log(err);
            res.redirect("/photoboards");
        }else{
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    console.log(err);
                }else{
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.author.avatar = req.user.avatar;
                    comment.save();
                    commentedPhoto.comments.push(comment);
                    commentedPhoto.save();
                    console.log(comment);
                    req.flash('success', 'Created a comment');
                    res.redirect("/photoboards/"+commentedPhoto._id);
                }
            });
        }
    });
});




router.get("/:commentId/edit", isLogged, checkUserComment, function(req, res){
    res.render("comments/editComment", {photoId: req.params.id, comment: req.comment});
});


router.put("/:commentId", function(req, res){
    Comment.findByIdAndUpdate(req.params.commentId ,req.body.comment, function(err){
        if(err){
            console.log(err);
            res.render("comments/editComment");
        }else{
            res.redirect("/photoboards/"+req.params.id); //这里的id是photo的
        }

    });
});


router.delete("/:commentId", isLogged, checkUserComment, function(req, res){

    Photo.findByIdAndUpdate(req.params.id, {$pull : {comments: req.comment.id}}, function(err){
        if(err){
            console.log(err);
            req.flash("error", err.message);
            res.redirect("/photoboards");
        }else{
            req.comment.remove(function(err){
                if(err){
                    req.flash("error", err.message);
                    return res.redirect("/photoboards/"+req.params.id);
                }
                req.flash("error", "Comment deleted");
                res.redirect("/photoboards/"+req.params.id);
            });
        }
    });
});


module.exports = router;