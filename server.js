const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
var bodyParser = require('body-parser');
const rp = require('request-promise');
// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
const cheerio = require("cheerio");
const app = express();

// Require all models
var db = require("./models");

const PORT = 3000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
// Initialize Express

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({
    extended: true
}));

app.use(express.json());

// Make public a static folder
app.use(express.static("public"));
// Connect to the Mongo DB
// mongoose.connect("mongodb://localhost/mongoHeadlines", {
//     useNewUrlParser: true
// });

// Routes

var nameSchema = new mongoose.Schema({
    firstName: String,
    lastName: String
});

var User = mongoose.model("User", nameSchema);

app.post("/addname", (req, res) => {
    var myData = new User(req.body);
    myData.save()
        .then(item => {
            res.send("item saved to database");
        })
        .catch(err => {
            res.status(400).send("unable to save to database");
        });
});

const options = {
    uri: `https://www.polygon.com`,
    transform: function (body) {
        return cheerio.load(body);
    }
};

rp(options).then(($) => {
        console.log($);
    })
    .catch((err) => {
        console.log(err);
    });



// 
// 
// 

// app.use("/", (req, res) => {
//     res.sendFile(__dirname + "/index.html");
// });

// // A GET route for scraping the washington Post website
// app.get("/scrape", function (req, res) {
//     // First, we grab the body of the html with request
//     axios.get("https://www.polygon.com/").then(function (response) {
//         // Then, we load that into cheerio and save it to $ for a shorthand selector
//         console.log(response);
//         var $ = cheerio.load(response.data);

//         // Now, we grab every h2 within an article tag, and do the following:
//         $("article h2").each(function (i, element) {
//             // Save an empty result object
//             var result = {};

//             // Add the text and href of every link, and save them as properties of the result object
//             result.title = $(this)
//                 .children("a")
//                 .text();
//             result.link = $(this)
//                 .children("a")
//                 .attr("href");

//             // Create a new Article using the `result` object built from scraping
//             db.Article.create(result)
//                 .then(function (dbArticle) {
//                     // View the added result in the console
//                     console.log(dbArticle);
//                 })
//                 .catch(function (err) {
//                     // If an error occurred, send it to the client
//                     return res.json(err);
//                 });
//         });

//         // If we were able to successfully scrape and save an Article, send a message to the client
//         res.send("Scrape Complete");
//     });
// });

// // Route for getting all Articles from the db
// app.get("/articles", function (req, res) {
//     // TODO: Finish the route so it grabs all of the articles
// });

// // Route for grabbing a specific Article by id, populate it with it's note
// app.get("/articles/:id", function (req, res) {
//     // TODO
//     // ====
//     // Finish the route so it finds one article using the req.params.id,
//     // and run the populate method with "note",
//     // then responds with the article with the note included
// });

// // Route for saving/updating an Article's associated Note
// app.post("/articles/:id", function (req, res) {
//     // TODO
//     // ====
//     // save the new note that gets posted to the Notes collection
//     // then find an article from the req.params.id
//     // and update it's "note" property with the _id of the new note
// });

// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});