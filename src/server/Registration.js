var AWS = require("aws-sdk");
AWS.config = {
    region: "us-east-1"
};
var dynamoDB = new AWS.DynamoDB();
var uuid = require("uuid");

var exportsObj = {}

var validation = {
    firstname: new RegExp(/^[\sa-zA-Z.,'-]{2,}$/),
    lastname: new RegExp(/^[\sa-zA-Z.,'-]{2,}$/),
    email: new RegExp(/^([\S]+)@([a-zA-Z0-9_\-.]+)\.([a-zA-Z]{2,5})$/),
    username: new RegExp(/^[a-zA-Z0-9\-_!?+#$%&*]{4,30}$/),
    password: new RegExp(/^[\S]{7,35}$/)
}

exportsObj.validate = (inputs) => {
    for (var input in inputs){
        if ((input === "username" && inputs[input] === "") === false){
            if (validation[input].test(inputs[input]) === false) return false;
        }
    }
    return true;
}

exportsObj.format = (inputs) => {
    var reformattedBody = inputs;
    var firstname = reformattedBody.firstname.trim().toLowerCase();
    var lastname = reformattedBody.lastname.trim().toLowerCase();
    reformattedBody.firstname = firstname.charAt(0).toUpperCase() + firstname.slice(1);
    reformattedBody.lastname = lastname.charAt(0).toUpperCase() + lastname.slice(1);
    reformattedBody.email = reformattedBody.email.trim();
    if (reformattedBody.username === "") reformattedBody.username = null;

    return reformattedBody;
}

exportsObj.registerUser = (reformattedBody, req, res, callback) => {
    // DynamoDB query params
    var queryParams = {
        ExpressionAttributeValues: {
            ":v1": {
                S: reformattedBody.email
            }
        },
        KeyConditionExpression: "Email = :v1",
        TableName: "Planni-Users",
        IndexName: "Email-index",
        ReturnConsumedCapacity: "TOTAL"
    };

    reformattedBody.uuid = uuid.v1();

    // DynamoDB putItem params
    var putParams = {
        Item: {
            "UUID": {
                S: reformattedBody.uuid
            },
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
    var query = dynamoDB.query(queryParams); // Check to see if email exists
    var putItem = dynamoDB.putItem(putParams); // Create a new user in our database with provided info

    query.send();
    query.on('complete', function(result){
        if (result.error) { // An error getting the item
            console.log(result.error);
            res.send("Error checking user");
        }
        else if (result.data.Items.length !== 0) { // If the data return a user (obj not empty), re-render and notify
            res.render("login.ejs", {loginMsg: "", errorMsg: "Account is already associated with email"});
        }
        else putItem.send(); // Send put item request if no email is found
    });

    putItem.on('complete', function(result){
        if (result.error) {
            console.log(result.error);
            res.send("Error adding user");
        }
        else {
            req.session.user = {
                uuid: reformattedBody.uuid
            };
            //exportsObj.CreateDefaultBoards(req);
            exportsObj.CreateDefaultFilter(req);
            callback();
        }
    });
};
exportsObj.CreateDefaultBoards = (req) => {
    var defaultBoard = {
        UserId: req.session.user.uuid,
        UUID: uuid.v1(),
        Name: "Default",
        Style: "Default",
        SortingOrder: "LastUpdated",
        IsLocked: false
    };

    var putParams = {
        Item: {
            "UserId": {
                S: defaultBoard.UserId
            },
            "Name": {
                S: defaultBoard.Name
            },
            "UUID": {
                S: defaultBoard.UUID
            },
            "Style": {
                S: defaultBoard.Style
            },
            "SortingOrder": {
                S: defaultBoard.SortingOrder
            },
            "IsLocked": {
                BOOL: defaultBoard.IsLocked
            }
        },
        TableName: "Planni-Boards"
    }

    var updateParams = {
        UpdateExpression: "SET DefaultBoardId = :id",
        ExpressionAttributeValues: {
            ":id": {
                S: defaultBoard.UUID
            }
        },
        Key: {
            "UUID": {
                S: req.session.user.uuid
            }
        },
        TableName: "Planni-Users",
        ReturnValues: "ALL_NEW"
    };

    var WriteItem = dynamoDB.putItem(putParams);
    var UpdateItem = dynamoDB.updateItem(updateParams);

    WriteItem.on('complete', function(result){
        if (result.error) console.log(result.error);
        else {
            req.session.boards = [defaultBoard];
            UpdateItem.send();
        }
    });

    UpdateItem.on('complete', function(result){
        if (result.error) console.log(result.error);
        else {
            req.session.user.email = result.data.Attributes.Email.S;
            req.session.user.firstname = result.data.Attributes.Firstname.S;
            req.session.user.lastname = result.data.Attributes.Lastname.S;
            req.session.user.defaultBoardId = result.data.Attributes.DefaultBoardId.S;
        }
    });

    WriteItem.send();
}

exportsObj.CreateDefaultFilter = (req) => {

    var defaultFilter = {
        UserId: req.session.user.uuid,
        Name: "Default",
        UUID: uuid.v1(),
        Style: "Default",
        "IsLocked": false
    }

    var putParams = {
        Item: {
            "UserId": {
                S: defaultFilter.UserId
            },
            "Name": {
                S: defaultFilter.Name
            },
            "UUID": {
                S: defaultFilter.UUID
            },
            "Style": {
                S: defaultFilter.Style
            },
            "IsLocked": {
                BOOL: defaultFilter.IsLocked
            }
        },
        TableName: "Planni-PlannerFilters"
    }

    var updateParams = {
        UpdateExpression: "SET DefaultFilterId = :id",
        ExpressionAttributeValues: {
            ":id": {
                S: defaultFilter.UUID
            }
        },
        Key: {
            "UUID": {
                S: req.session.user.uuid
            }
        },
        TableName: "Planni-Users",
        ReturnValues: "ALL_NEW"
    };

    var putItem = dynamoDB.putItem(putParams);
    var update = dynamoDB.updateItem(updateParams);
    putItem.on("complete", function(result){
        if (result.error) console.log(result.error);
        else {
            req.session.filters = [defaultFilter];
            update.send();
        }
    })

    updateParams.on("complete", function(result){
        if (result.error) console.log(result.error);
        else {
            req.session.user.defaultFilterId = result.data.Attributes.DefaultFilterId.S;
        }
    })

    putItem.send();
}

module.exports = exportsObj;