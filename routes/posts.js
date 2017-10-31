var express     = require("express");
var router      = express.Router();
var post        = require('../models/post');
var Comment     = require('../models/comment');
var Tags        = require('../models/tag');
var User        = require('../models/user');
var Stats       = require('../models/stats');
var middleware  = require('../middleware');


// INDEX route - show all data
router.get("/", function(req, res){
    var relevantTags = [];
    post.find({},
            ['name','views', 'created', 'author', 'ranking', 'comments', 'tags'],
            {
                skip:0, limit:10,
                sort:{ ranking: -1 }
            }, function(err, AllPosts){
      if(err){
        console.log(err);
      } else {
        Tags.find({},
            ['tag','searchNumber'],
            {
                skip:0, limit:30,
                sort:{ searchNumber: -1 }
            }, function(err, allTags) {
            if(err){console.log(err);}
            for (var i = 0; i < allTags.length; i++){
                relevantTags.push(allTags[i].tag);
            }
            res.render("post/index", {posts:AllPosts, tags:relevantTags, tags_data:allTags});
        });
      }
    });
});


// SEARCH Route
router.get("/search", function(req, res){
    var search = req.query.search;
    var newSearch = search.split(", ");
    var relevantTags = [];
    Stats.create({ tagSearches: newSearch }, function(err, newStats){
        if(err){ console.log(err); }
        
        post.find({ tags: { "$in" : newSearch} }, function(err, foundPosts){
          if(err){
            console.log(err);
          } else {  
            tagsView(newSearch);
            Tags.find({}, function(err, allTags) {
                if(err){console.log(err);}
                for (var i = 0; i < allTags.length; i++){
                    relevantTags.push(allTags[i].tag);
                }
                res.render("post/searchResult", {posts:foundPosts, tags:relevantTags, search:search});
            });
          }
        });
    });
});

// SEARCH Route
router.get("/search/refine", function(req, res){
    var refine = req.query.refine;
    var search = req.query.search;
    var newSearch = search.split(", ");
    var relevantTags = [];
    Stats.create({ postSearches: refine }, function(err, newStats){
        if(err){ console.log(err); }
        post.find({$and:[
            {"tags":{"$in":newSearch }},
            {$text: {$search:refine }}
        ]}, function(err, foundPosts){
          if(err){
            console.log(err);
          } else {
            Tags.find({}, function(err, allTags) {
                if(err){console.log(err);}
                for (var i = 0; i < allTags.length; i++){
                    relevantTags.push(allTags[i].tag);
                }
                res.render("post/searchResult", {posts:foundPosts, search:search, refine:refine, tags:relevantTags});
            });  
            
          }
        });
    });    
});

router.get("/textq", function(req, res){
    var textSearch = req.query.text_search;
    var relevantTags = [];
    Stats.create({ postSearches: textSearch }, function(err, newStats){
        if(err){ console.log(err); }
        post.find({ "$text": { "$search": textSearch } })
        .select({ "score": { "$meta": "textScore" } })
        .sort({ "score": { "$meta": "textScore" } })
        .exec(function(err, foundPosts){
          if(err){
            console.log(err);
          } else {
            Tags.find({}, function(err, allTags) {
                if(err){console.log(err);}
                for (var i = 0; i < allTags.length; i++){
                    relevantTags.push(allTags[i].tag);
                }
                res.render("post/textSearch", {posts:foundPosts, tags:relevantTags, textSearch:textSearch});
            });
          }
        });
    });    
});

// POST - Create new post
router.post("/", middleware.isAbleToCreatePost, function(req, res){
    var name = req.body.name;
    var descr = req.body.descr;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var ranking = 0;
    var tags = req.body.tag;
    tags = tags.split(", ");
    
    startTagsPostsCount(tags);
    
    var newpost = {name: name, descr: descr, author: author, ranking: ranking, tags:tags};
    //Create a new post and save to DB
    post.create(newpost, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else{
            User.findById(req.user._id, function(err, foundUser){
                if (foundUser.postsNumber == undefined) {
                    foundUser.postsNumber = 0;
                } 
                foundUser.postsNumber++;
                foundUser.save();
            });
            //redirect back to posts page
            res.redirect("/posts");       
        }
    });
});

//NEW - show form to add new item to the db
router.get("/new", middleware.isAbleToCreatePost, function(req, res){
    var relevantTags = [];
    Tags.find({}, function(err, allTags) {
        if(err){console.log(err);}
        for (var i = 0; i < allTags.length; i++){
            relevantTags.push(allTags[i].tag);
        }
        res.render("post/new", {tags:relevantTags});
    });
});


//SHOW - shows more info about posts
router.get("/:id", function(req, res){
    post.findById(req.params.id).populate('comments').exec(function(err, foundPost){
        if(err){
          console.log(err);
        } else {
          if((typeof(req.user) != 'undefined') && (req.user.username != foundPost.author.username && req.user.role != "manager")) {
            foundPost.views++;
            foundPost.save();  
          }
          
          User.findById(foundPost.author.id, function(err, foundAuthor) {
              if(err){console.log(err);}
              var authorRanking = foundAuthor.ranking;
              var userID = [];
              for(var i = 0; i < foundPost.comments.length; i++){
                  userID.push(foundPost.comments[i].author.id);
              }
                User.find({'_id': { $in: userID}}, function(err, foundPosters){
                      if(err){console.log(err);}
                      var tags = foundPost.tags;
                      res.render("post/show", {post:foundPost, commenters:foundPosters, authorRanking:authorRanking, tags:tags});
                });
          }); 
        }
    });
    
});

//EDIT - get route
router.get("/:id/edit", middleware.checkPostOwnership, function(req, res){
    post.findById(req.params.id, function(err, foundPost){
        if(err){console.log(err);}
        var relevantTags = [];
        Tags.find({}, function(err, allTags) {
            if(err){console.log(err);}
            for (var i = 0; i < allTags.length; i++){
                relevantTags.push(allTags[i].tag);
            }
            res.render("post/edit", {post:foundPost, tags:relevantTags});
        });
    });
});

//UPDATE - post route
router.put("/:id", middleware.checkPostOwnership, function(req, res){
    var name = req.body.name;
    var descr = req.body.descr;
    var tags = req.body.tag.split(", ");
    var newpost = {name: name, descr: descr, tags: tags};
    
    post.findById(req.params.id, function(err, foundPost){
        
        if(err){ console.log(err); res.redirect("back"); } 
        var oldTags = foundPost.tags;
        tagsPostsCount(oldTags, tags);
        
        post.findByIdAndUpdate(req.params.id, newpost, function(err, updatedPost){
            if(err){
              console.log(err);
              res.redirect("back");
            } else {
              res.redirect("/posts/" + req.params.id);
            }
        });
    });
});

//DELETE - post route
router.delete("/:id", middleware.checkPostOwnership, function(req, res){
   // remove comments
   post.findById(req.params.id, function(err, foundPost){
      if (err) {
         console.error(err);
      } else {
         removeTagsPostsCount(foundPost.tags); 
         // Remove associated comments
         var foundPosts = foundPost.comments;
         foundPosts.forEach(function(commentID){
            Comment.findByIdAndRemove(commentID, function(err){
               if(err) {
                  console.log("Error removing comment: " + err);
               }
            });
         });
         
         User.findById(req.user._id, function(err, foundUser){
            foundUser.postsNumber--;
            foundUser.save();
         });

         // Remove post
         foundPost.remove(req.params.id, function(err, post){
            if (err) {
               res.redirect("/posts");
            } else {
               res.redirect("/posts/");
            }        
         });
      }      
   });
});


//Add post ranking - put route (update route)
router.post("/:id/RankUp", middleware.checkPostVoteOwnership, function(req, res){
    post.findById(req.params.id, function(err, foundPost){
    if (err) {
        console.error(err);
      } else {
        var indexRanked = foundPost.rankedBy.indexOf(req.user._id);
        if(indexRanked == -1){
             foundPost.ranking++;
             foundPost.rankedBy.push(req.user._id);
             foundPost.save();
             User.findById(foundPost.author.id, function(err, foundUser){
                if (foundUser.ranking == undefined) {
                    foundUser.ranking = 0;
                } 
                foundUser.ranking++;
                foundUser.save();
             });
             res.redirect("back");
        } else {
            req.flash("error", "You already voted for this post!");
            res.redirect("back");
        } 
      }
   });
});

//Remove post ranking - put route (update route)
router.post("/:id/RankDown", middleware.checkPostVoteOwnership, function(req, res){
    post.findById(req.params.id, function(err, foundPost){
    if (err) {
        console.error(err);
      } else {
        var indexRanked = foundPost.rankedBy.indexOf(req.user._id);
        if(indexRanked != -1){
             foundPost.rankedBy.splice(indexRanked, 1);
        }
        foundPost.rankedBy.push(req.user._id);
        foundPost.ranking--;
        foundPost.save();
        User.findById(foundPost.author.id, function(err, foundUser){
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



// Helpers

var tagsView = function(tags){
    for (var q = 0; q < tags.length; q++) {
        
        Tags.find({tag: tags[q]}, function(err, foundTag) {
            if(err || foundTag == null || foundTag.length == 0){
                console.log(err);
            } else {
                foundTag[0].searchNumber++;
                foundTag[0].save();
            }
        });
        
    }
};

var tagsPostsCount = function(oldTags, newTags){
    var plusTags = tagsDiff(oldTags, newTags);
    var minusTags = ifTagsDeleted(oldTags, newTags);
    
    for (var w = 0; w < plusTags.length; w++) {
        
        Tags.findOne({tag: plusTags[w]}, function(err, foundTag) {
            console.log(foundTag);
            if(err || foundTag == null || foundTag.length == 0){
                console.log(err);
            } else {
                foundTag.postsNumber++;
                foundTag.save();
            }    
        });
        
    }
    
    for (var r = 0; r < minusTags.length; r++) {
        
        Tags.find({tag: minusTags[r]}, function(err, foundTag) {
            console.log(foundTag);
            if(err || foundTag == null || foundTag.length == 0){
                console.log(err);
            } else {
                foundTag[0].postsNumber--;
                foundTag[0].save();
            }
        });
        
    }
};

var startTagsPostsCount = function(tags) {
    
    for (var o = 0; o < tags.length; o++) {
        Tags.find({ tag: tags[o] }, function(err, foundTag) {
            if(err || foundTag == null || foundTag.length == 0){console.log(err);} else {
                foundTag[0].postsNumber++;
                foundTag[0].save();
            }
        });
    }
};

var removeTagsPostsCount = function(tags) {
    
    for (var o = 0; o < tags.length; o++) {
        Tags.find({ tag: tags[o] }, function(err, foundTag) {
            if( err || foundTag == null || foundTag.length == 0){console.log(err);} else {
                foundTag[0].postsNumber--;
                foundTag[0].save();
            }
        });
    }
};

var tagsDiff = function(oldTags, newTags) {
    var a = [], diff = [];

    for (var i = 0; i < oldTags.length; i++) {
        a[oldTags[i]] = true;
    }

    for (var i = 0; i < newTags.length; i++) {
        if (a[newTags[i]]) {
            delete a[newTags[i]];
        } else {
            a[newTags[i]] = true;
        }
    }

    for (var k in a) {
        diff.push(k);
    }

    return diff;
};

var ifTagsDeleted = function (oldTags, newTags) {
    var diff = [];
    for (var h = 0; h < oldTags.length; h++) {
        if (newTags.indexOf(oldTags[h]) == -1){  
            diff.push(oldTags[h]);
        }
    }
    
    return diff;
};

module.exports = router;