var express = require("express");
var session = require("express-session");
var MemcachedStore = require('connect-memcached')(session);
var AWS = require("aws-sdk");
var uuid = require("uuid");
var bcrypt = require("bcrypt");
var cors = require("cors");

var app = express();
//var apiRoutes = require("./routes/api");
//app.use("/api", apiRoutes);

var Validation = require("./Public/Server/Validation.js");
var Registration = require("./Public/Server/Registration.js");

const bcryptSR = 10;
const months = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"];
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

AWS.config = {
    region: "us-east-1"
};
var dynamoDB = new AWS.DynamoDB();

app.use(cors());
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
                                defaultBoardId: item.DefaultBoardId.S,
                                defaultFilterId: item.DefaultFilterId.S
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
    if ("boards" in req.session) res.render("notesView.ejs", {boards: req.session.boards, homeBoardId: req.session.user.defaultBoardId});
    else {
        var queryParams = {
            ExpressionAttributeValues: {
                ":v1": {
                    S: req.session.user.uuid
                },
                ":v2": {
                    S: "0"
                }
            },
            ExpressionAttributeNames: {
                "#N": "Name"
            },
            KeyConditionExpression: "UserId = :v1 AND #N >= :v2",
            TableName: "Planni-Boards",
            ReturnConsumedCapacity: "TOTAL"
        };

        var query = dynamoDB.query(queryParams);
        query.on("complete", function(result){
            if (result.error) {
                console.log(result.error);
                res.send("Error retrieving boards");
            } else {
                req.session.boards = [];
                result.data.Items.forEach(function(item){
                    req.session.boards.push({
                        UserId: item.UserId.S,
                        UUID: item.UUID.S,
                        Name: item.Name.S,
                        Style: item.Style.S,
                        SortingOrder: item.SortingOrder.S,
                        IsLocked: item.IsLocked.S
                    })
                })
                res.render("notesView.ejs", {boards: req.session.boards, homeBoardId: req.session.user.defaultBoardId});
            }
        })
        query.send();
    }
})

app.get("/planner", middleware, function(req, res){
    // If filters are in session, query months and render page, else, query filters first
    if ("filters" in req.session) {
        res.render("plannerView.ejs", {filters: req.session.filters});
    }
    else {
        var queryFiltersParams = {
            ExpressionAttributeValues: {
                ":v1": {
                    S: req.session.user.uuid
                },
                ":v2": {
                    S: "0"
                }
            },
            ExpressionAttributeNames: {
                "#N": "Name"
            },
            KeyConditionExpression: "UserId = :v1 AND #N >= :v2",
            TableName: "Planni-PlannerFilters",
            ReturnConsumedCapacity: "TOTAL"
        };

        var queryFilters = dynamoDB.query(queryFiltersParams);
        queryFilters.on("complete", function(result){
            if (result.error) {
                console.log(result.error);
                res.send("Error retrieving filters");
            } else {
                req.session.filters = [];
                result.data.Items.forEach(function(item){
                    req.session.filters.push({
                        UserId: item.UserId.S,
                        UUID: item.UUID.S,
                        Name: item.Name.S,
                        Style: item.Style.S,
                        IsLocked: item.IsLocked.S
                    })
                })
                res.render("plannerView.ejs", {filters: req.session.filters});
            }
        })

        queryFilters.send();
    }
})

app.get("/api/month", function(req, res){
    var month = months[req.query.monthIndex];
    var year = req.query.year;

    // Setting up months query
    var queryMonthsParams = {
        ExpressionAttributeNames: {
            "#U": "UserId",
            "#Y": "Year"
        },
        ExpressionAttributeValues: {
            ":v1": {
                S: req.session.user.uuid
            },
            ":v2": {
                S: year.toString()
            }
        },
        KeyConditionExpression: "#U = :v1 AND #Y = :v2",
        TableName: "Planni-PlannerMonths",
        IndexName: "UserId-Year-index",
        ReturnConsumedCapacity: "TOTAL"
    }
    var queryMonths = dynamoDB.query(queryMonthsParams);
    queryMonths.on("complete", function(result){
        if (result.error) {
            console.log(result.error);
            res.send("Error retrieving months");
        } else if (result.data.Items.length > 0){
            var monthsArr = [];
            req.session.months = [];
            result.data.Items.forEach(function(item){
                var itemObj = {
                    UserId: item.UserId.S,
                    UUID: item.UUID.S,
                    Month: item.Month.S,
                    Year: item.Year.S,
                    FilterId: item.FilterId.S
                }
                if (item.MonthlyTasks) itemObj.MonthlyTasks = item.MonthlyTasks.SS;
                req.session.months.push(itemObj);
                if (itemObj.Month == month) monthsArr.push(itemObj);
            })
            if (monthsArr.length > 0) res.send(monthsArr);
            else createMonth(req, res, month, year);
        }
        else createMonth(req, res, month, year);
    })

    var monthsArr = [];
    if (req.session.months != undefined){
        var m = req.session.months;
        for (var i = 0; i < m.length; i++){
            if (m[i].Month == month) {
                monthsArr.push(m[i]);
            }
        }
    }

    if (monthsArr.length == 0) queryMonths.send();
    else res.send(monthsArr);
})

app.put("/api/month", function(req, res){
    console.log(req.body.data);

    var updateParams = {
        ExpressionAttributeNames: {
            "#T": "MonthlyTasks"
        },
        ExpressionAttributeValues: {
            ":v": {
                SS: req.body.data.monthlyTasks
            }
        },
        Key: {
            "UUID": {
                S: req.body.data.monthId
            }
        },
        ReturnValues: "ALL_NEW",
        TableName: "Planni-PlannerMonths",
        UpdateExpression: "SET #T = :v"
    };

    var updateItem = dynamoDB.updateItem(updateParams);
    updateItem.on("complete", function(response){
        if (response.error) {
            console.log(response.error);
            res.send(null);
        }
        else {
            var m = req.session.months;
            for (var i = 0; i < m.length; i++){
                if (m[i].UUID == req.body.data.monthId){
                    req.session.months[i].MonthlyTasks = req.body.data.monthlyTasks;
                    break;
                }
            }
            res.send(response.data);
        }
    })
    updateItem.send();
})

function createMonth(req, res, month, year) {
    var writeParams = {
        RequestItems: {
            "Planni-PlannerMonths": []
        }
    }

    var monthsArr = [];

    req.session.filters.forEach(function(filter){
        var id = uuid.v1();
        monthsArr.push({
            UserId: req.session.user.uuid,
            UUID: id,
            Month: month,
            Year: year.toString(),
            FilterId: filter.UUID
        })
        writeParams.RequestItems["Planni-PlannerMonths"].push({
            PutRequest: {
                Item: {
                    "UserId": {
                        S: req.session.user.uuid
                    },
                    "UUID": {
                        S: id
                    },
                    "Month": {
                        S: month
                    },
                    "Year": {
                        S: year.toString()
                    },
                    "FilterId": {
                        S: filter.UUID
                    }
                }
            }
        })
    })

    var batchWrite = dynamoDB.batchWriteItem(writeParams);
    batchWrite.on("complete", function(response){
        if (response.error) console.log(response.error);
        else {
            if (req.session.months == undefined) req.session.months = [];
            req.session.months.push(monthsArr);
            res.send(monthsArr);
        }
    })

    batchWrite.send();
}

app.get("/api/dates", function(req, res){
    var queryParams = {
        ExpressionAttributeNames: {
            "#d": "Date"
        },
        ExpressionAttributeValues: {
            ":id": {
                S: req.query.monthId
            },
            ":d": {
                N: "0"
            }
        },
        KeyConditionExpression: "MonthId = :id AND #d > :d",
        TableName: "Planni-PlannerDates"
    }
    var query = dynamoDB.query(queryParams);
    query.on("complete", function(response){
        if (response.error) console.log(response.error);
        else {
            var dateArr = [];
            response.data.Items.forEach(function(item){
                var itemObj = {
                    UserId: item.UserId.S,
                    UUID: item.UUID.S,
                    Date: item.Date.N,
                    MonthId: item.MonthId.S
                }
                if (item.Sticker) itemObj.Sticker = item.Sticker.S;
                if (item.NoteId) itemObj.NoteId = item.NoteId.S;
                if (item.Tasks) {
                    var tasksArr = [];
                    item.Tasks.L.forEach(function(task){
                        var taskObj = {
                            Text: task.M.Text.S,
                            Color: task.M.Color.S,
                            IsUnderlined: task.M.IsUnderlined.BOOL
                        }
                        tasksArr.push(taskObj);
                    })
                    itemObj.Tasks = tasksArr;
                }
                if (item.Reminders) itemObj.Reminders = item.Reminders.L;
                dateArr.push(itemObj);
            })
            res.send(dateArr);
        }
    })
    query.send();
})

app.post("/api/dates", function(req, res){
    var getParams = {
        Key: {
            MonthId: {
                S: req.body.data.monthId
            },
            Date: {
                N: req.body.data.date.toString()
            }
        },
        TableName: "Planni-PlannerDates"
    }
    var getItem = dynamoDB.getItem(getParams);
    getItem.on("complete", function(response){
        if (response.error) console.log(response.error);
        else if (response.data.Item) {
            console.log(response.data);
            var itemObj = {
                UserId: response.data.Item.UserId.S,
                UUID: response.data.Item.UUID.S,
                Date: response.data.Item.Date.N,
                MonthId: response.data.Item.MonthId.S
            }
            if (response.data.Item.Sticker) itemObj.Sticker = response.data.Item.Sticker.S;
            if (response.data.Item.NoteId) itemObj.NoteId = response.data.Item.NoteId.S;
            if (response.data.Item.Tasks) itemObj.Tasks = response.data.Item.Tasks.S;
            if (response.data.Item.Reminders) itemObj.Reminders = response.data.Item.Reminders.S;
            res.send({FoundItem: true, Item: itemObj});
        }
        else {
            putItem.send();
        }
    })
    var id = uuid.v1();
    var putParams = {
        Item: {
            "UserId": {
                S: req.session.user.uuid
            },
            "UUID": {
                S: id
            },
            "Date": {
                N: req.body.data.date.toString()
            },
            "MonthId": {
                S: req.body.data.monthId
            }
        },
        TableName: "Planni-PlannerDates"
    }
    var putItem = dynamoDB.putItem(putParams);
    putItem.on("complete", function(response){
        if (response.error) console.log(response.error);
        else {
            res.send({FoundItem: false, Item: {UUID: id}});
        }
    })
    if (req.body.data.check == true){
        getItem.send();
    }
    else {
        putItem.send();
    }
})

app.put("/api/dates", function(req, res){
    var taskArr = [];
    req.body.data.tasks.forEach(function(task){
        var obj = {
            M: {
                Text: {
                    S: task.Text
                },
                Color: {
                    S: task.Color
                },
                IsUnderlined: {
                    BOOL: task.IsUnderlined
                }
            }
        }
        taskArr.push(obj);
    })
    var updateParams = {
        Key: {
            "MonthId": {
                S: req.body.data.monthId
            },
            "Date": {
                N: req.body.data.date.toString()
            }
        },
        ExpressionAttributeNames: {
            "#T": "Tasks"
        },
        ExpressionAttributeValues: {
            ":t": {
                L: taskArr
            }
        },
        UpdateExpression: "SET #T = :t",
        TableName: "Planni-PlannerDates",
        ReturnValues: "ALL_NEW"
    }
    var updateItem = dynamoDB.updateItem(updateParams);
    updateItem.on("complete", function(response){
        if (response.error) console.log(response.error);
        else {
            res.send(response.data);
        }
    })
    updateItem.send();
})

app.get("*", function(req, res){
    res.send("url not found");
})

app.listen(3000, function(){
	console.log("Server Started...");
});