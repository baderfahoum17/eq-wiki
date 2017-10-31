var express     = require("express");
var router      = express.Router();
var passport    = require("passport");
var User        = require('../models/user');
var Tags        = require('../models/tag');
var middleware  = require('../middleware');


//root route
router.get("/", function(req, res){
    res.redirect("/posts");
});

//NEW - show form to register new user
router.get("/register", function(req, res){
    res.render("register");
});

//CREATE - register new user
router.post("/register", function(req, res){
    var newUser = new User({
            username: req.body.username,
            ranking: 0
        });
    
    if (req.body.username === "Admin" || req.body.username === "admin"){
            newUser.role = "manager";
    }
    
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("register",{"error": err.message});
        } else {
            passport.authenticate("local")(req, res, function(){
                req.flash("success", "Welcome a board! You have successfully registred!");
                res.redirect("/posts"); 
            });
        }
    });
});

//SHOW - Login form
router.get("/login", function(req, res){
    res.render("login");    
});

//LOGIN to system - middleware
router.post("/login", passport.authenticate("local", {
       successRedirect: "/posts",
       failureRedirect: "/login"
    }), function(req, res){
});

//LOGOUT
router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "You have successfully logged out!");
    res.redirect("/posts");
});

module.exports = router;