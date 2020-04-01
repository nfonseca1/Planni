var express = require("express");
var session = require("express-session");
var MemcachedStore = require('connect-memcached')(session);
var AWS = require("aws-sdk");

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

app.get("/", function(req, res){
	res.render("login.ejs");
});

function ValidateRegistration(inputs){

    var regex = [new RegExp(/^[\sa-zA-Z.,'-]{2,}$/),
        new RegExp(/^[\sa-zA-Z.,'-]{2,}$/),
        new RegExp(/^([\S]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/),
        new RegExp(/^[a-zA-Z0-9\-_!?+#$%&*]{4,30}$/),
        new RegExp(/^[\S]{7,35}$/),
    ];
    var noErrors = true;

    if (!regex[0].test(inputs.firstname)){
        noErrors = false;
    }
    if (!regex[1].test(inputs.lastname)){
        noErrors = false;
    }
    if (!regex[2].test(inputs.email)){
        noErrors = false;
    }
    if (!regex[3].test(inputs.username) && inputs.username != ""){
        noErrors = false;
    }
    if (!regex[4].test(inputs.password)) {
        noErrors = false;
    }
    if (noErrors) return true;
    else return false;
};

function FormatRegistration(inputs){
    var reformattedBody = inputs;
    var firstname = reformattedBody.firstname.trim().toLowerCase();
    var lastname = reformattedBody.lastname.trim().toLowerCase();
    reformattedBody.firstname = firstname.charAt(0).toUpperCase() + firstname.slice(1);
    reformattedBody.lastname = lastname.charAt(0).toUpperCase() + lastname.slice(1);
    reformattedBody.email = reformattedBody.email.trim();
    if (reformattedBody.username == "") reformattedBody.username = null;

    return reformattedBody;
}

app.post("/", function(req, res){
    // Server side validation. If failed, re-render and notify
    if (ValidateRegistration(req.body) == false){
        res.render("login.ejs", {errorMsg: "Inputs were not filled in properly"});
        return;
    }
    // Reformat names, and set username to null if it has no value
    var reformattedBody = FormatRegistration(req.body);

    // DynamoDB getItem params
    var getParams = {
        Key: {
            "Email": {
                S: reformattedBody.email
            }
        },
        TableName: "Planni-Users",
        ReturnConsumedCapacity: "TOTAL"
    };

    // DynamoDB putItem params
    var putParams = {
        Item: {
            "Firstname": {
                S: reformattedBody.firstname
            },
            "Lastname": {
                S: reformattedBody.lastname
            },
            "Email": {
                S: reformattedBody.email
            },
            "Username": {},
            "Password": {
                S: reformattedBody.password
            }
        },
        TableName: "Planni-Users",
        ReturnConsumedCapacity: "TOTAL"
    };
    // Delete or add username to putItem params based on whether it's null or not
    if (reformattedBody.username == null) delete putParams.Item.Username;
    else putParams.Item.Username.S = reformattedBody.username;

    // Setup DynamoDB requests
    var getItem = dynamoDB.getItem(getParams); // Check to see if email exists
    var putItem = dynamoDB.putItem(putParams); // Create a new user in our database with provided info

    getItem.send();
    getItem.on('complete', function(result){
        if (result.error) { // An error getting the item
            console.log(result.error);
            res.send("Error checking user");
        }
        else if ("Item" in result.data) { // If the data return a user (obj not empty), re-render and notify
            res.render("login.ejs", {errorMsg: "Account is already associated with email"});
        }
        else putItem.send(); // Send put item request if no email is found
    });

    putItem.on('complete', function(result){
        if (result.error) {
            console.log(result.error);
            res.send("Error adding user");
        }
        else {
            console.log(result.data);
        }
    });
});



app.post("/home", function(req, res){

    var getParams = {
        ExpressionAttributeValues: {
            ":v1": {
                S: req.body.username
            },
            ":v2" : {
                S: req.body.password
            }
        },
        KeyConditionExpression: "Username = :v1 AND Password = :v2",
        TableName: "Planni-Users",
        IndexName: "Username-index",
        ReturnConsumedCapacity: "TOTAL"
    };
    var emailRegex = new RegExp(/[\S]{1,}@[\S]{1,}/);
    if (emailRegex.test(req.body.username) == true) {
        getParams.KeyConditionExpression = "Email = :v1 AND Password = :v2";
        delete getParams.IndexName;
    }

    console.log(getParams);
    var query = dynamoDB.query(getParams);
    query.on("complete", function(result){
        if (result.error) {
            console.log(result.error);
            res.send("Server could not retrieve user");
        } else {
            console.log(result.data);
        }
    })
    query.send();
})

app.listen(3000, function(){
	console.log("Server Started...");
});