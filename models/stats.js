var mongoose = require('mongoose');

// Schema setup
var wikistatsSchema = new mongoose.Schema({
    postSearches: [String],
    tagSearches: [String],
    searchDate: { type: Date, default: Date.now }
});

wikistatsSchema.index({'$**': 'text'});

module.exports = mongoose.model("wikiStats", wikistatsSchema);