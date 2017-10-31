var express     = require("express");
var router      = express.Router();
var Tags        = require('../models/tag');
var middleware  = require('../middleware');


//NEW - show form to add new item to the db
router.get("/new", middleware.isLoggedIn, function(req, res){
    var relevantTags = [];
    
    Tags.find({}, function(err, allTags) {
        if(err){console.log(err);}
        
        for (var i = 0; i < allTags.length; i++){
            relevantTags.push(allTags[i].tag);
        }
        
        res.render("tags/new", {tags:allTags, allTags:relevantTags});
    });
});

//NEW - show form to add new item to the db
router.post("/new", middleware.isLoggedIn, function(req, res){
    
    var newTags = req.body.tags.split(', ');
    var deletedTags = req.body.deletedTags.split(', ');
    
    for(var w = 0; w < deletedTags.length; w++) {
        Tags.remove({ tag: deletedTags[w] }, function(err, result){
            if(err){console.log(err)}
        });
    }
    
    Tags.find({}, function(err, allTags) {
        if(err){console.log(err);}
        
        for(var q = 0; q < newTags.length; q++) {
            if (!(allTags.some(function(e){ return (e.tag  == newTags[q]) }))) {
                var addTag = {tag: newTags[q], views: 0};
                Tags.create(addTag, function(err, createdTag){
                   if(err){console.log(err)}
                });
                
            }
        }   
        res.redirect("/tags/new");
    });
});


module.exports = router;