var mongoose = require('mongoose');

var commentSchema = new mongoose.Schema({
  text: String,
  author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String,
        ranking: Number,
        role: String
  },
  ranking: Number,
  rankedBy: [String],
  created: {
        type: Date, 
        default: Date.now
    }
});

module.exports = mongoose.model("Comment", commentSchema);