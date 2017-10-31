var middlewareObj = {};
var post        = require('../models/post');
var Comment     = require('../models/comment');

middlewareObj.isLoggedIn = function (req, res, next){
    if(req.isAuthenticated()){
        return next();
    } else {
        req.flash("error", "Please login first!");
        res.redirect("/login");
    }
};

middlewareObj.isAbleToCreatePost = function (req, res, next){
    if(req.isAuthenticated()){
        if(req.user.ranking > 3  || req.user.role === "manager") {
            return next();   
        } else {
            req.flash("error", "You don't have enough rating to create posts!");
            res.redirect("back");
        }
    } else {
        req.flash("error", "Please login first!");
        res.redirect("/login");
    }
};

middlewareObj.isUserAdmin = function (req, res, next){
    if(req.isAuthenticated()){
        if(req.user.role === "manager") {
            return next();   
        } else {
            req.flash("error", "You don't have permissions to perform this action.");
            res.redirect("back");
        }
    } else {
        req.flash("error", "Please login first!");
        res.redirect("/login");
    }
};

middlewareObj.checkPostOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        post.findById(req.params.id, function(err, foundPost){
          if(err){
            console.log(err);
            req.flash("error", "Something whent wrong :(");
            res.redirect("back");
          } else {
            if(foundPost.author.id.equals(req.user._id) || req.user.role === "manager"){
                next();
            } else {
                req.flash("error", "Something whent wrong :(");
                res.redirect("back");
            }    
          }
        });
        
    } else {
        req.flash("error", "You need to be loggedin to do that!");
        res.redirect("back");
    }
};

middlewareObj.checkCommentOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
          if(err){
            req.flash("error", "Something whent wrong :(");
            console.log(err);
            res.redirect("back");
          } else {
            if(foundComment.author.id.equals(req.user._id) || req.user.role === "manager"){
                next();
            } else {
                req.flash("error", "Something whent wrong :(");
                res.redirect("back");
            }    
          }
        });
    } else {
        req.flash("error", "You need to be loggedin to do that!");
        res.redirect("back");
    }
};

middlewareObj.checkPostVoteOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        post.findById(req.params.id, function(err, foundPost){
          if(err){
            console.log(err);
            req.flash("error", "Something whent wrong :(");
            res.redirect("back");
          } else {
            if(!(foundPost.author.id.equals(req.user._id)) && (req.user.role != 'manager')){
                next();
            } else if((req.user.role === 'manager')) {
                req.flash("error", "Manager cannot vote for posts!");
                res.redirect("back");
            } else {
                req.flash("error", "You can't vote for your own post!");
                res.redirect("back");
            }
          }
        });
    } else {
        req.flash("error", "You need to be loggedin to do that!");
        res.redirect("back");
    }
};

middlewareObj.checkCommentVoteOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
          if(err){
            req.flash("error", "Something whent wrong :(");
            console.log(err);
            res.redirect("back");
          } else {
            if(!(foundComment.author.id.equals(req.user._id)) && (req.user.role != 'manager')){
                next();
            } else if((req.user.role === 'manager')) {
                req.flash("error", "Manager cannot vote for comments!");
                res.redirect("back");
            } else {
                req.flash("error", "You can't vote for your own comment!");
                res.redirect("back");
            }   
          }
        });
    } else {
        req.flash("error", "You need to be loggedin to do that!");
        res.redirect("back");
    }
};


module.exports = middlewareObj;