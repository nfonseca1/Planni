var AWS = require("aws-sdk");
AWS.config = {
    region: "us-east-1"
};

var dynamoDB = new AWS.DynamoDB();
var uuid = require("uuid");

var exportsObj = {}

exportsObj.RegisterUser = function (reformattedBody, req, res){
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
        else if (result.data.Items.length != 0) { // If the data return a user (obj not empty), re-render and notify
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
            req.session.UUID = reformattedBody.uuid;
            exportsObj.CreateDefaultBoards(req);
        }
    });
};
exportsObj.CreateDefaultBoards = function (req){
    var allBoard = {
        UserId: req.session.UUID,
        UUID: uuid.v1(),
        Name: "ALL",
        Style: "Default",
        SortingOrder: "LastUpdated",
        IsLocked: false
    };

    var homeBoard = {
        UserId: req.session.UUID,
        UUID: uuid.v1(),
        Name: "Home Board",
        Style: "Default",
        SortingOrder: "LastUpdated",
        IsLocked: false
    };

    var writeParams = {
        RequestItems: {
            "Planni-Boards": [
                {
                    PutRequest: {
                        Item: {
                            "UserId": {
                                S: allBoard.UserId
                            },
                            "Name": {
                                S: allBoard.Name
                            },
                            "UUID": {
                                S: allBoard.UUID
                            },
                            "Style": {
                                S: allBoard.Style
                            },
                            "SortingOrder": {
                                S: allBoard.SortingOrder
                            },
                            "IsLocked": {
                                BOOL: allBoard.IsLocked
                            }
                        }
                    },
                    PutRequest: {
                        Item: {
                            "UserId": {
                                S: homeBoard.UserId
                            },
                            "Name": {
                                S: homeBoard.Name
                            },
                            "UUID": {
                                S: homeBoard.UUID
                            },
                            "Style": {
                                S: homeBoard.Style
                            },
                            "SortingOrder": {
                                S: homeBoard.SortingOrder
                            },
                            "IsLocked": {
                                BOOL: homeBoard.IsLocked
                            }
                        }
                    }
                }
            ]
        }
    }

    var updateParams = {
        UpdateExpression: "SET DefaultBoardId = :id",
        ExpressionAttributeValues: {
            ":id": {
                S: homeBoard.UUID
            }
        },
        Key: {
            "UUID": {
                S: req.session.UUID
            }
        },
        TableName: "Planni-Users",
        ReturnValues: "ALL_NEW"
    };

    var WriteItem = dynamoDB.batchWriteItem(writeParams);
    var UpdateItem = dynamoDB.updateItem(updateParams);

    WriteItem.on('complete', function(result){
        if (result.error) console.log(result.error);
        else {
            req.session.boards = [allBoard, homeBoard];
            UpdateItem.send();
        }
    });

    UpdateItem.on('complete', function(result){
        if (result.error) console.log(result.error);
        else {
            console.log(result.data);
            req.session.user = result.data.Attributes;
            console.log(req.session);
        }
    });

    WriteItem.send();
}

module.exports = exportsObj;