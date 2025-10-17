const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
const snsClient = new SNSClient({ region: "ca-central-1" });

module.exports = snsClient;