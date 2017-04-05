// Dependencies

var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var Race = require("./models/Race.js");
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

mongoose.connect("mongodb://localhost/row2kdb");
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

// Make a request call to grab the HTML body from the site of your choice
request('http://www.row2k.com/results/', function (error, response, html) {

  // Load the HTML into cheerio and save it to a variable
  // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
  var $ = cheerio.load(html);

  // An empty array to save the data that we'll scrape
  var result = [];

  // Select each instance of the HTML body that you want to scrape
  // NOTE: Cheerio selectors function similarly to jQuery's selectors, 
  // but be sure to visit the package's npm page to see how it works
  $('ul.list').each(function(i, element){

    var link = $(element).children().children().attr("href");
    var title = $(element).children().children().text();

    // Save these results in an object that we'll push into the result array we defined earlier
    result.push({
      title: title,
      link: link
    });
    });
  console.log(result);
});

// This will get the articles we scraped from the mongoDB
app.get("/stuff", function(req, res) {
  // Grab every doc in the Articles array
  Race.find({}, function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Or send the doc to the browser as a json object
    else {
      res.render("index", {doc});
    }
  });
});

// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});