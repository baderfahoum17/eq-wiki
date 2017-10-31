var express     = require("express");
var router      = express.Router();
var Post        = require('../models/post');
var User        = require('../models/user');
var Tags        = require('../models/tag');
var middleware  = require('../middleware');


router.get("/:user_id", middleware.isUserAdmin, function(req, res){
  var today = new Date();
  var oneWeekAgo = new Date();
  var oneMonthAgo = new Date();
  var threeMonthAgo = new Date();

  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7); 
  oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
  threeMonthAgo.setDate(threeMonthAgo.getDate() - 90); 
  console.log(typeof(oneWeekAgo.toString()));
  console.log(typeof(oneMonthAgo.toString()));
  console.log(typeof(threeMonthAgo.toString()));
  
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
            ['name','created','views', 'ranking'],
            {
                skip:0, limit:10,
                sort:{ views: -1 }
            },function(err,foundPosts) {
              
              if(err){console.log(err);}
              Tags.find({},
                ['tag','searchNumber','postsNumber'],
                {
                  skip:0, limit:10,
                  sort:{ searchNumber: -1 }
                }, function(err, allTags) {
                  if(err){console.log(err);}
                  Tags.find({},
                  ['tag','searchNumber','postsNumber'],
                  {
                    skip:0, limit:10,
                    sort:{ postsNumber: -1 }
                  }, function(err, tags_posts_data) {
                    if(err){console.log(err);}
                    Tags.find({ searchDate:{'$lte':new Date(today.toString()),'$gte': new Date(oneMonthAgo.toString()) } }, function(err, foundStats) {
                      if(err){console.log(err);}
                      console.log(foundStats);
                      res.render("admin/profile", {user:foundUser, users:foundUsers, tags_data:allTags, posts_data: foundPosts, postsVotes: postsVotes, tags_posts_data: tags_posts_data, foundStats: foundStats});
                  });    
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
