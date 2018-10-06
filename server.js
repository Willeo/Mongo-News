const express = require("express");
const mongoose = require("mongoose");
const logger = require("morgan");
const request = require("request");

var bodyParser = require('body-parser');
const rp = require('request-promise');
// Our scraping tools

// qQuery for Node!
const cheerio = require("cheerio");

// Connect to the Mongo DB
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines", {
    useNewUrlParser: true
});
const PORT = 3000;

// Require all models
var db = require("./models");

// Initialize Express
const app = express();

app.use(bodyParser.json());
// Parse request body as JSON
app.use(bodyParser.urlencoded({
    extended: true
}));

// mongoose.Promise = Promise;

var nameSchema = new mongoose.Schema({
    firstName: String,
    lastName: String
});

var User = mongoose.model("newsHeadlines", nameSchema);

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


// Routes

// posting to db
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

// scrapping goodness 
request('https://news.ycombinator.com', function (error, response, html) {
    if (!error && response.statusCode == 200) {
        var $ = cheerio.load(html);
        var parsedResults = [];
        $('span.comhead').each(function (i, element) {
            // Select the previous element
            var a = $(this).prev();
            // Get the rank by parsing the element two levels above the "a" element
            var rank = a.parent().parent().text();
            // Parse the link title
            var title = a.text();
            // Parse the href attribute from the "a" element
            var url = a.attr('href');
            // Get the subtext children from the next row in the HTML table.
            var subtext = a.parent().parent().next().children('.subtext').children();
            // Extract the relevant data from the children
            var points = $(subtext).eq(0).text();
            var username = $(subtext).eq(1).text();
            var comments = $(subtext).eq(2).text();
            // Our parsed meta data object
            var metadata = {
                rank: parseInt(rank),
                title: title,
                url: url,
                points: parseInt(points),
                username: username,
                comments: parseInt(comments)
            };
            // Push meta-data into parsedResults array
            parsedResults.push(metadata);


        });
        // Log our finished parse results in the terminal
        console.log(parsedResults);

        // Route for getting all Articles from the db
        app.get("/articles", function (req, response) {
            // Grab every document in the Articles collection
            db.Article.find({})
                .then(function (dbArticle) {
                    // If we were able to successfully find Articles, send them back to the client
                    res.json(dbArticle);
                })
                .catch(function (err) {
                    // If an error occurred, send it to the client
                    res.json(err);
                });
        });
    }
});



// scrapping the web page
// const options = {
//     uri: `https://www.cnn.com/`,
//     transform: function (body) {
//         return cheerio.load(body);
//     }
// };

// rp(options).then(($) => {
//     console.log("hey hey hey hey!");
//     console.log($.fn);
// }).catch((err) => {
//     console.log("Oops, there was a problem " + err);
// });









// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});