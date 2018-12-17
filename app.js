const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const firebase = require("firebase");
const admin = require('firebase-admin');
const serviceAccount = require("./config/serviceAccountKey.json");
const textbank = require(__dirname + "/textbank.js");

var PORT = process.env.PORT || 3000;

const homeStartingContent = textbank.headerText();
const aboutContent = textbank.aboutText();
const contactContent = textbank.contactText();

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://whatsappclone-d467c.firebaseio.com"
});

const db = admin.firestore();
const postsCollection = db.collection('posts');

app.get("/", function(req, res) {
    let posts = [];
    postsCollection.get()
    .then(function(snapshot) {
        snapshot.forEach(function(snapshot) {
            var post = {
                title: snapshot.data().title,
                content: snapshot.data().content,
                id: snapshot.id
            }
            posts.push(post);
        })
        res.render("home", { startingContent: homeStartingContent, posts: posts });
    }).catch(function(error) {
        console.log('Error getting documents', error);
    })
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
    postsCollection.add({
        title: req.body.postTitle,
        content: req.body.postBody
    }).then(function(ref) {
        console.log('Added document with ID: ', ref.id);
        res.redirect("/");
    }).catch(function(error) {
        console.log("error: " + error);
    })
});

app.post("/delete", function(req, res) {
    const postId = req.body.postId;
    postsCollection.doc(postId).delete()
    .then(function(value) {
        console.log(value);
        res.redirect("/");
    }).catch(function(error) {
        console.log("error: " + error);
    })
})

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

app.listen(PORT, function() {
    console.log("Listening on port 3000");
});