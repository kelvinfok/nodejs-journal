const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");

const homeStartingContent = "some home content";
const aboutContent = "some about content";
const contactContent = "some contact content";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


let posts = [];


app.get("/", function(req, res) {
    res.render("home", { startingContent: homeStartingContent, posts: posts });
});

app.get("/about", function(req, res) {
    res.render("about", { aboutContent: aboutContent});
});

app.get("/contact", function(req, res) {
    res.render("contact", { contactContent: contactContent});
});

app.get("/compose", function(req, res) {
    res.render("compose");
});

app.post("/compose", function(req, res) {

    const post = {
        title: req.body.postTitle,
        content: req.body.postBody
    };

    posts.push(post);
    res.redirect("/");
});

app.get("/post/:postName", function(req, res) {
    
    const requestedTitle = _.lowerCase(req.params.postName);

    var searchedPost = {
        title: "",
        content: ""
    }

    var isFound = false;

    posts.forEach(function(post) {
        var storedTitle = _.lowerCase(post.title);
        if (storedTitle === requestedTitle) {
            searchedPost.title = post.title;
            searchedPost.content = post.content;
            isFound = true;
        }
    })

    if (isFound === true ) {
        res.render("post", {title: searchedPost.title, content: searchedPost.content});
    } else {
        res.render("notfound");
    }

    console.log(req.params.postName);
})

app.listen(process.env.PORT || 3000, function() {
    console.log("Listening on port 3000");
});