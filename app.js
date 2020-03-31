var express = require("express");
var session = require("express-session");
var MemcachedStore = require('connect-memcached')(session);

var app = express();

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
	res.render("login.html");
})

app.listen(3000, function(){
	console.log("Server Started...");
});