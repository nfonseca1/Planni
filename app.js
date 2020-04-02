var express = require("express");
var session = require("express-session");
var MemcachedStore = require('connect-memcached')(session);
var AWS = require("aws-sdk");
var uuid = require("uuid");
var bcrypt = require("bcrypt");

var Validation = require("./Public/Server/Validation.js");
var Registration = require("./Public/Server/Registration.js");

const bcryptSR = 10;

AWS.config = {
    region: "us-east-1"
};

var dynamoDB = new AWS.DynamoDB();
var app = express();

app.use(express.json());
app.use(express.urlencoded());
app.use(express.static(__dirname +'/public'));
app.engine('html', require('ejs').renderFile);

app.use(
  session({
    secret: "Tranquil Waters",
    key: "test",
    proxy: "true",
    resave: false,
    saveUninitialized: false
    //store: new MemcachedStore({
    //  hosts: ["planni-memcached.6hesde.cfg.use2.cache.amazonaws.com:11211"],
    //  secret: "123, easy as ABC. ABC, easy as 123" // Optionally use transparent encryption for memcache session data
    //})
  })
);

var middleware = function(req, res, next){
    if (!("user" in req.session)) res.redirect("/");
    else next();
};

app.get("/", function(req, res){
	res.render("login.ejs", {loginMsg: "", errorMsg: ""});
});

// Registering
app.post("/", function(req, res){
    // Server side validation. If failed, re-render and notify
    if (Validation.ValidateRegistration(req.body) == false){
        res.render("login.ejs", {errorMsg: "Inputs were not filled in properly"});
        return;
    }
    // Reformat names, and set username to null if it has no value
    var reformattedBody = Validation.FormatRegistration(req.body);

    // Hash password
    bcrypt.hash(reformattedBody.password, bcryptSR, function(err, hash){
        if (err) {
            console.log(err);
            res.send("Error registering user");
        }
        if (hash) {
            reformattedBody.password = hash;
            // When password hashes, complete registration process
            Registration.RegisterUser(reformattedBody, req, res, function(){
                res.redirect("/home");
            })
        }
    })
});

// Logging In
app.post("/home", function(req, res){
    // DynamoDB query params
    var queryParams = {
        ExpressionAttributeValues: {
            ":v1": {
                S: req.body.username
            }
        },
        KeyConditionExpression: "Username = :v1",
        TableName: "Planni-Users",
        IndexName: "Username-index",
        ReturnConsumedCapacity: "TOTAL"
    };
    var emailRegex = new RegExp(/[\S]{1,}@[\S]{1,}/);
    if (emailRegex.test(req.body.username) == true) { // If logging in with an email, change db parameters
        queryParams.KeyConditionExpression = "Email = :v1";
        queryParams.IndexName = "Email-index";
    }

    var query = dynamoDB.query(queryParams);

    query.on("complete", function(result){
        if (result.error) {
            console.log(result.error);
            res.send("Server could not retrieve user");
        } else if (result.data.Items.length == 0){
            res.render("login.ejs", {loginMsg: "Email/Username and Password combination is incorrect", errorMsg: ""})
        } else {
            bcrypt.compare(req.body.password, result.data.Items[0].Password.S, function(err, hashResult) { // Check hashed password for match
                if (err) {
                    console.log(err);
                    res.send("Error processing data");
                } else if (hashResult == false) {
                    res.render("login.ejs", {loginMsg: "Email/Username and Password combination is incorrect", errorMsg: ""})
                } else {
                    var getParams = {
                        Key: {
                            "UUID": {
                                S: result.data.Items[0].UUID.S
                            }
                        },
                        TableName: "Planni-Users"
                    };
                    var getItem = dynamoDB.getItem(getParams);
                    getItem.on('complete', function(result){
                        if (result.error) {
                            console.log(result.error);
                            res.send("Server could not retrieve user");
                        } else {
                            var item = result.data.Item;
                            req.session.user = {
                                uuid: item.UUID.S,
                                email: item.Email.S,
                                firstname: item.Firstname.S,
                                lastname: item.Lastname.S,
                                defaultBoardId: item.DefaultBoardId.S
                            }
                            res.redirect("/home");
                        }
                    });
                    getItem.send();
                }
            })
        }
    })
    query.send();
});

app.get("/home", middleware, function(req, res){
    res.send("hello");
})

app.listen(3000, function(){
	console.log("Server Started...");
});