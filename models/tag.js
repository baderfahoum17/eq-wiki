var mongoose = require('mongoose');


// Schema setup
var tagSchema = new mongoose.Schema({
  tag: String,
  searchNumber: {
      type: Number, 
      default: 0
  },
  postsNumber: {
      type: Number, 
      default: 0
  },
  previousData: [
    {
      date: {type: Date, default: Date.now()},
      searchNumber: Number,
      postsNumber: Number
    }
  ]
});

tagSchema.index({'$**': 'text'});

module.exports = mongoose.model("Tags", tagSchema);