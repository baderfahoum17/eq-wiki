var mongoose = require('mongoose');

// Schema setup
var postSchema = new mongoose.Schema({
    name: String,
    descr: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String,
        ranking: Number
    },
    created: {
        type: Date, 
        default: Date.now
    },
    ranking: Number,
    rankedBy: [String],
    tags:[String],
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ],
    views: {
        type: Number, 
        default: 0
    },
    previousData: [
        {
          date: {type: Date, default: Date.now},
          views: Number
        }
    ]
});

postSchema.index({'$**': 'text'});

module.exports = mongoose.model("Post", postSchema);


