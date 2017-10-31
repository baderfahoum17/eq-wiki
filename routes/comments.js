var express     = require("express");
var router      = express.Router({mergeParams: true});
var post        = require("../models/post");
var Comment     = require("../models/comment");
var User        = require('../models/user');
var middleware  = require('../middleware');


//NEW - show form to add new comment/review
router.get('/new', middleware.isLoggedIn,  function(req, res) {
    post.findById(req.params.id, function(err, post){
      if(err){
        console.log(err);
      } else {
        res.render("comments/new", {post: post});
      }
    });
    
});


// CREATE route - add new comment to relevant post
router.post('/', middleware.isLoggedIn, function(req, res) {
    
    post.findById(req.params.id, function(err, post){
      if(err){
        console.log(err);
        res.redirect("/posts");
      } else {
        //create new comment
        Comment.create(req.body.comment, function(err, comment){
          if(err){
            console.log(err);
          } else {
            //add useraname and id to comments
            comment.author.id = req.user._id;
            comment.author.username = req.user.username;
            comment.ranking = 0;
            //connect new comment to post
            comment.save();
            post.comments.push(comment);
            post.save();
            
            User.findById(req.user._id, function(err, foundUser){
                if (foundUser.commentsNumber == undefined) {
                    foundUser.commentsNumber = 0;
                } 
                foundUser.commentsNumber++;
                foundUser.save();
            });
            //redirect to post
            res.redirect("/posts/" + post._id);
          }
        });
      }
    });
});

// EDIT route - edit comment/review
router.get('/:comment_id/edit', middleware.checkCommentOwnership, function(req, res) {
   post.findById(req.params.id).populate("comments").exec(function(err, foundPost){
        if(err){
          console.log(err);
        } else {
        Comment.findById(req.params.comment_id, function(err, foundComment){
          if(err){
            console.log(err);
          } else {
            res.render("comments/edit", {post:foundPost, comment:foundComment});
          }
        });
      }
    }); 
});

//UPDATE Comment route
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
  var commentText = {
     text : req.body.text
  };
  Comment.findByIdAndUpdate(req.params.comment_id, commentText, function(err, updatedComment){
    if(err){
      console.log(err);
      res.redirect("back");
    } else {
      res.redirect("/posts/" + req.params.id);
    }
  });
});

//DELETE Comment route
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
   // remove comments
   post.findById(req.params.id).populate('comments').exec(function(err, foundPost){
      if(err){
        console.log(err);
        res.redirect("/posts");
      } else {
      for(var i = 0; i < foundPost.comments.length; i++) {
        if(foundPost.comments[i]._id == req.params.comment_id) {
            foundPost.comments.splice(i, 1);
            foundPost.save();
        }
      }  
      Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if (err) {
           req.flash("error", "Something whent wrong :(");
           console.error(err);
        } else {
            User.findById(req.user._id, function(err, foundUser){
              foundUser.commentsNumber--;
              foundUser.save();
            });
            res.redirect("/posts/" + req.params.id);
        }        
      });
      } 
   });     
});


//Add comment ranking - put route (update route)
router.post("/:comment_id/RankUp", middleware.checkCommentVoteOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment){
    if (err) {
        console.error(err);
      } else {
        var indexRanked = foundComment.rankedBy.indexOf(req.user._id);
        if(indexRanked == -1){
             foundComment.ranking++;
             foundComment.rankedBy.push(req.user._id);
             foundComment.save();
             User.findById(foundComment.author.id, function(err, foundUser){
                if (foundUser.ranking == undefined) {
                    foundUser.ranking = 0;
                } 
                foundUser.ranking++;
                foundUser.save();
             });
             res.redirect("back");
        } else {
            req.flash("error", "You already voted for this comment!");
            res.redirect("back");
        } 
      }
   });
});

//Remove comment ranking - put route (update route)
router.post("/:comment_id/RankDown", middleware.checkCommentVoteOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment){
    if (err) {
        console.error(err);
      } else {
        var indexRanked = foundComment.rankedBy.indexOf(req.user._id);
        if(indexRanked != -1){
             foundComment.rankedBy.splice(indexRanked, 1);
        }
        foundComment.ranking--;
        foundComment.rankedBy.push(req.user._id);
        foundComment.save();
        User.findById(foundComment.author.id, function(err, foundUser){
            if (foundUser.ranking == undefined) {
                foundUser.ranking = 0;
            } 
            foundUser.ranking--;
            foundUser.save();
        });
        res.redirect("back");
      }
   });
});

module.exports = router;