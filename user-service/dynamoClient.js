const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({ region: "ca-central-1" });

module.exports = client;
