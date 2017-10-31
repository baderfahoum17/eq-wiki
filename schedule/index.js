var cronJob = {};

var User        = require('../models/user'),
    Post        = require('../models/post'),
    Tags        = require('../models/tag');
    
/* istanbul ignore next */
cronJob.job = function(){
    
    Post.find({}, function(err, allPosts){
        if(err){console.log(err)}
    
        for (var i = 0; i < allPosts.length; i++) {
            // Add data object to previousData array
            allPosts[i].previousData.push({views: allPosts[i].views});
            
            // Change current views number to zero
            allPosts[i].views = 0;
            allPosts[i].save();
        }
        
        Tags.find({}, function(err, allTags){
            if(err){console.log(err)}
        
            for (var u = 0; u < allTags.length; u++) {
                // Add data object to previousData array
                allTags[u].previousData.push({ searchNumber: allTags[u].searchNumber, postsNumber: allTags[u].postsNumber });
                
                // Change current views number to zero
                allTags[u].searchNumber = 0;
                allTags[u].searchNumber = 0;
                allTags[u].save();
            }
            
        });
    });
    
};

module.exports = cronJob;