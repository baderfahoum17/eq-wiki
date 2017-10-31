var express     = require("express");
var router      = express.Router();
var post        = require('../models/post');
var User        = require('../models/user');
var middleware  = require('../middleware');


router.get("/reset", function(req, res){
    res.render("user/reset");
});

router.post('/reset', function(req, res) {
 
  User.findOne({ username: req.body.username }, function(err, user) {
    /* istanbul ignore if */
    if(err){
      console.log(err);
    }
    user.setPassword(req.body.password, function(err){
      /* istanbul ignore if */
      if(err){
        console.log(err);
      } else {
        res.redirect('/login');   
      }
    });
  });  
});


router.get("/:user_id", middleware.isLoggedIn, function(req, res){
    User.findById(req.params.user_id, function(err, foundUser){
        if (err) {
            console.log(err);    
        } else {
            post.find({}, function(err, foundPosts){
              if(err){
                console.log(err);
              } else {
                var AuthorPosts = [];
                
                for (var i = 0; i < foundPosts.length; i++) {
                    var postID = foundPosts[i].author.id;
                    var userID = foundUser._id;
                    if (postID.equals(userID)){
                        AuthorPosts.push(foundPosts[i]);
                    }    
                }
                res.render("user/profile", {user:foundUser, posts:AuthorPosts});
              }
            });      
        }
    });
});

router.get("/:user_id/update", middleware.isLoggedIn, function(req, res){
    User.findById(req.params.user_id, function(err, foundUser){
        if (err) {
            console.log(err);    
        } else {
            res.render("user/update", {user:foundUser});
        }
    });
});

// Update user profile
router.put("/:user_id/update", middleware.isLoggedIn, function(req, res){
    var firstName = req.body.firstname;
    var lastName = req.body.lastname;
    var newData = {firstName: firstName, lastName: lastName};
      User.findByIdAndUpdate(req.params.user_id, newData, function(err, updatedPost){
        if(err){
          console.log(err);
          res.redirect("back");
        } else {
          res.redirect("/profile/" + req.params.user_id);
        }
      });
});

module.exports = router;