var mongoose = require("mongoose");
var Tags = require("./models/tag");

var data = [
        {
            tag: "Volumetrix",
            views: 3,
            searchNumber: 1,
            category: 'Xeleris'
        },
        {
            tag: "Lister",
            views: 13,
            searchNumber: 6,
            category: 'Xeleris'
        },
        {
            tag: "Deafult Application",
            views: 5,
            searchNumber: 2,
            category: 'Xeleris'
        },
        {
            tag: "Optima 540",
            views: 15,
            searchNumber: 10,
            category: 'CT'
        },
        {
            tag: "DMPR",
            views: 2,
            searchNumber: 1,
            category: 'CT'
        },
        {
            tag: "O640",
            views: 15,
            searchNumber: 10,
            category: 'NM'
        },
        {
            tag: "Hybrid Registration",
            views: 3,
            searchNumber: 2,
            category: 'NM'
        },
        {
            tag: "COR Calibration",
            views: 33,
            searchNumber: 14,
            category: 'NM'
        },
        {
            tag: "COR Test",
            views: 3,
            searchNumber: 2,
            category: 'NM'
        }
    ];


function seedDB(){
    Tags.remove({}, function(err){
        if (err){
            console.lo(err);
        } else {
            console.log('removed all tags!');
            data.forEach(function(seed){
                Tags.create(seed, function(err){
                    if(err){console.log(err)}
                    console.log('Added seed: ' + seed.tag);
                });
            });
            
        }
    });
}

module.exports = seedDB;