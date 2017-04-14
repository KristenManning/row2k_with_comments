var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var Rower = require("./models/Rower.js");
// Our scraping tools
var request = require("request");
var cheerio = require("cheerio");
// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

// ------------------------------------------------
// Initialize Express

var app = express();
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(express.static("public"));

// ------------------------------------------------
// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// ------------------------------------------------
// Database configuration with mongoose

mongoose.connect("mongodb://heroku_7006g1f1:u891dr2po2q7lr57k1vgd7qd7@ds161400.mlab.com:61400/heroku_7006g1f1");
var db = mongoose.connection;

db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

db.once("open", function() {
  console.log("Mongoose connection successful.");
});

// ------------------------------------------------

// Snatches HTML from URLs
var request = require('request');
// Scrapes our HTML
var cheerio = require('cheerio');

// execute this function when you want to scrape everything that's currently on the roster page
var scrape_roster = function(){
  request('http://www.mitathletics.com/sports/w-crewop/2016-17/roster', function (error, response, html) {
  var $ = cheerio.load(html);

  $('tr').each(function(i, element){

    var result = {};

    var name = $(element).children(".name")
    result.name = name.text()
    var class_year = name.next()
    result.class_year = class_year.text()
    var height = class_year.next()
    result.height = height.text()
    var hometown = height.next()
    result.hometown = hometown.text()
    var major = hometown.next()
    result.major = major.text()
    result.link = name.children().attr("href")
    result.img = $(element).children(".headshot").children().children().attr("src")

    // Create a new Rower document for each title-link pair 
    var rower_doc = new Rower(result);
    
    Rower.find({name: result.name}, function(error, doc) {
      if (error) {
        console.log(error);
      }
      // save the doc *if it's not already in the db*
      else {
        if (doc.length == 0 && result.name.length > 0){
          rower_doc.save(function(err, doc) {
            if (err) {
              console.log(err);
              }
            });
          }
        }
      });
    });
  });
}

// Each time a user visits the home route, scrape the roster for *new* entries, 
// then render *everything that's in the db* through handlebars
app.get("/", function(req, res) {
  scrape_roster()

  Rower.find({}, function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Or send the doc to the browser as a json object
    else {
      res.render("index", {"rowers": doc});
    }
  });
});

// Update comments on selected rower with whatever is written in textbox
app.post("/cheer/:id", function(req, res) {
  
  Rower.update(
    // update selected rower 
    {_id: req.params.id},
    // push new comment into array of comments 
    {$push:{ comments: req.body.comment } }, 
    function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    else {
      res.redirect("/");
    }
  });
});

// Remove selected comment 
app.post("/remove/:id/:index", function(req, res) {

  Rower.find({_id: req.params.id}, function(error, doc) {
      // Create a new array to splice the selected comment from 
      new_comments = doc[0].comments 
      new_comments.splice(req.params.index, 1)
      // Replace the old comments field value with the new (spliced) comments array in the db 
      Rower.update({_id: req.params.id},{$set:{ comments: new_comments } }, function(error, doc) {
        if (error) {
          console.log(error);
        }
        else {
          res.redirect("/");
        }
    });
  });
});

// Listen on port 3000
app.listen(3101, function() {
  console.log("App running on port 3101!");
});