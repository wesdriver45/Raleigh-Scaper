//dependencies
const axios = require("axios");
const bodyParser = require("body-parser");
const cheerio = require("cheerio");
const express = require("express");
const exphbs = require("express-handlebars");
const mongojs = require("mongojs");
const mongoose = require("mongoose");
const logger = require("morgan");
const request = require("request");
const sequelize = require("sequelize");

//require all models
var db = require("./models");

var PORT = 3000;

//express
var app = express();

//morgan logger
app.use(logger("dev"));
//body-parser
app.use(bodyParser.urlencoded({ extended: false }));
//express.static for public folder
app.use(express.static("public"));

//mongoose promise to use .then
mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/scraperdb");

//Routes
//Get for scraping site
app.get("/scrape", function(req, res) {
  axios.get("http://www.newsobserver.com/news/local").then(function(response) {
    //cheerio with $ selector
    var $ = cheerio.load(response.data);
    console.log(response);
    //grab article headings
    $("h4 .title").each(function(i, element) {
      var result = {};

      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
      .children("a")
      .attr("href");
      console.log(result);

    //   //create a new article
    //   db.Article.create(result)
    //     .then(function(dbArticle) {
    //       console.log(dbArticle);
    //     })
    //     .catch(function(err) {
    //       return res.json(err);
    //     });
       
     });
    //signal the client scrape complete
        res.send("Scrape Complete"); 
  });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  // db.Article.findOne({ _id: req.params.id })
  //   // ..and populate all of the notes associated with it
  //   .populate("note")
  //   .then(function(dbArticle) {
  //     // If we were able to successfully find an Article with the given id, send it back to the client
  //     res.json(dbArticle);
  //   })
  //   .catch(function(err) {
  //     // If an error occurred, send it to the client
  //     res.json(err);
  //   });
  res.json(true);
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});

