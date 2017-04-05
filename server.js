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

mongoose.connect("mongodb://localhost/mitcrewdb");
var db = mongoose.connection;

db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

db.once("open", function() {
  console.log("Mongoose connection successful.");
});
db.dropDatabase();

// ------------------------------------------------

// Snatches HTML from URLs
var request = require('request');
// Scrapes our HTML
var cheerio = require('cheerio');

// Make a request call to grab the HTML body from the site of your choice
request('http://www.mitathletics.com/sports/w-crewop/2016-17/roster', function (error, response, html) {

  // Load the HTML into cheerio and save it to a variable
  // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
  var $ = cheerio.load(html);

  $('tr').each(function(i, element){

    var result = {};

    // Add the text and href of every link, and save them as properties of the result object
    // result.name = $(element).children().children().text();
    // result.link = $(element).children().children().attr("href");
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


    // result.link = $(element).children(".name").attr("href")
    // result.hometown = $(element).text();
    // result.major = $(element).text()

    // Create a new Rower document for each title-link pair 
    var rower_doc = new Rower(result);
    
      // Now, save that entry to the db
    if (result.name){
      rower_doc.save(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        // Or log the doc
        else {
          console.log(doc);
        }
        });
    }
    
  });
});

// This will get the articles we scraped from the mongoDB
app.get("/", function(req, res) {
  // Grab every doc in the Articles array
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

// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});