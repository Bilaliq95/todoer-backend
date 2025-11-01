const { PutItemCommand, DeleteItemCommand, UpdateItemCommand,GetItemCommand,ScanCommand,QueryCommand} = require("@aws-sdk/client-dynamodb");
const client = require("../dynamoClient"); // adjust path if needed
const { v4: uuidv4 } = require("uuid")
const e = require("express");
const snsClient=require("../snsClient");
const { PublishCommand } = require("@aws-sdk/client-sns");
const { unmarshall } = require("@aws-sdk/util-dynamodb");





const createTask=async(req,res,next)=>{
    try {
        const {user_id, description} = req.body;
        const task_id = uuidv4();
        //const date_created = new Date().toISOString().split('T')[0];
        const date_created = new Date().toISOString();
        const newTask={
            task_id,user_id,date_created,description,
        }
        const command = new PutItemCommand({
            TableName: process.env.DYNAMODB_TASKS_TABLE,
            Item: {
                task_id: {S: task_id},
                user_id: {S: user_id},
                description: {S: description},
                date_created: {S: date_created},
                completed:{BOOL: false},
                deleted:{BOOL:false}

            }
        });
        await client.send(command);
        await snsClient.send(new PublishCommand({
            TopicArn: process.env.SNS_TOPIC_ARN,
            Message: JSON.stringify({
                eventType: "TASK_CREATED",
                task_id,
                description,
                date_created,
                user_id,
            }),
        }));
        return res.status(201).json({message: 'Task created successfully.', newTask});
    }
    catch(err){
        console.error("Error creating task:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

const updateTask=async(req,res,next)=>{
    let task_id=req.params.id;
    let selectedTask=req.body;
    if(task_id===selectedTask.task_id){
    selectedTask={
        task_id: {S: selectedTask.task_id},
        user_id: {S: selectedTask.user_id},
        description: {S: selectedTask.description},
        date_created: {S: selectedTask.date_created},
        completed:{BOOL: selectedTask.completed},
        deleted:{BOOL: selectedTask.deleted}
    }
    try{
        const command= new PutItemCommand({
            TableName: process.env.DYNAMODB_TASKS_TABLE,
            Item:selectedTask
        })
        await client.send(command);
        return res.status(200).json({ message: "Task updated successfully." });
    }
    catch(err){
        console.error("Error updating task:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
    }
    else{
        return res.status(400).json({ error: "Bad Request" });

    }
}

const deleteTask=async(req,res,next)=>{
    const {user_id} = req.body;
 const task_id=req.params.id;
    try{
        const command = new DeleteItemCommand({
            TableName: process.env.DYNAMODB_TASKS_TABLE,
            Key: {
                task_id: { S: task_id }
            }
        })
        await client.send(command);
        // after: await client.send(command);
        await snsClient.send(new PublishCommand({
            TopicArn: process.env.SNS_TOPIC_ARN,
            Message: JSON.stringify({
                eventType: "TASK_DELETED",
                task_id,
                user_id,
            }),
        }));
        return res.status(200).json({ message: "Task deleted successfully." });
    }
    catch(err){
        console.error("Error deleting task:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }

}

const getTask=async(req,res,next)=>{
    const task_id=req.params.id;
    try{
        const command = new GetItemCommand({
            TableName: process.env.DYNAMODB_TASKS_TABLE,
            Key: {
                task_id: { S: task_id }
            }
        })
        const result= await client.send(command);
        if (!result.Item) {
            return res.status(404).json({ message: "Task not found." });
        }
        return res.status(200).json({ task:result.Item, message: "Task retrieved successfully." });
    }
    catch(err){
        console.error("Error deleting task:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

const getAllTasks=async(req,res,next)=>{
    const command = new ScanCommand({
        TableName: process.env.DYNAMODB_TASKS_TABLE
    });
    const result = await client.send(command);
    if (!result.Items) {
        return res.status(404).json({ message: "Tasks not found." });
    }
    return res.status(200).json({ task:result.Items, message: "Tasks retrieved successfully." });
}

const getTasksByUser=async(req,res,next)=>{
    const user_id=req.params.userId;
    try{
        const command = new QueryCommand({
            TableName: process.env.DYNAMODB_TASKS_TABLE,
            IndexName: "user_id-index",
            KeyConditionExpression: "user_id = :uid",
            ExpressionAttributeValues: {
                ":uid": { S: user_id }
            }
        });
        const result= await client.send(command);
        if (!result.Items || result.Items.length === 0) {
            return res.status(404).json({ message: "Task not found." });
        }
        const plainItems=result.Items.map((item)=>unmarshall(item));
        return res.status(200).json({ tasks:plainItems, message: "Tasks retrieved successfully." });
    }
    catch(err){
        console.error("Error getting tasks:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }

}


module.exports = {
createTask,
    updateTask,
    deleteTask,
    getTask,
    getAllTasks,
    getTasksByUser,
};