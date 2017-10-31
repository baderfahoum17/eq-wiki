var express     = require("express");
var router      = express.Router();
var Post        = require('../models/post');
var User        = require('../models/user');
var Tags        = require('../models/tag');
var middleware  = require('../middleware');


router.get("/:user_id", middleware.isUserAdmin, function(req, res){
  
  User.findById(req.params.user_id, function(err, foundUser){
    if (err) {
        console.log(err);    
    } else {
      User.find({ role: { $nin: [ 'manager' ] }}, function(err, foundUsers){
        if(err){
          console.log(err);
        } else {
          Post.find({},
          ['name','created','views', 'ranking'],
          {
              skip:0, limit:10,
              sort:{ ranking: -1 }
          },function(err,postsVotes) {
            
            if(err){console.log(err);}
            Post.find({},
            ['name','created','views', 'ranking','previousData'],
            {
                skip:0, limit:10,
                sort:{ views: -1 }
            },function(err,foundPosts) {
              
              if(err){console.log(err);}
              Tags.find({},
                ['tag','searchNumber','postsNumber','previousData'],
                {
                  skip:0, limit:10,
                  sort:{ searchNumber: -1 }
                }, function(err, allTags) {
                  if(err){console.log(err);}
                  Tags.find({},
                  ['tag','searchNumber','postsNumber','previousData'],
                  {
                    skip:0, limit:10,
                    sort:{ postsNumber: -1 }
                  }, function(err, tags_posts_data) {
                    console.log(tags_posts_data);
                    if(err){console.log(err);}
                      res.render("admin/profile", {user:foundUser, users:foundUsers, tags_data:allTags, posts_data: foundPosts, postsVotes: postsVotes, tags_posts_data: tags_posts_data});
                  });
              });
            });  
          });  
        }
      });      
    }
  });
  
});

module.exports = router;