var express = require("express");
var router = express.Router();
var AWS = require("aws-sdk");

AWS.config = {
    region: "us-east-1"
};
var dynamoDB = new AWS.DynamoDB();
var middleware = function(req, res, next){
    if (!("user" in req.session)) res.redirect("/");
    else next();
};

router.get("/month", function(req, res){
    console.log("yessss");
    console.log(req.session);
    console.log(req.query);
})

module.exports = router;