const client = require("../dynamoClient"); // adjust path if needed
const { PutItemCommand, DeleteItemCommand, GetItemCommand, QueryCommand} = require("@aws-sdk/client-dynamodb");
const { v4: uuidv4 } = require("uuid");
const { unmarshall } = require("@aws-sdk/util-dynamodb");
const jwt = require('jsonwebtoken');


const register = async (req, res) => {
    const { name,email, password,phone_number } = req.body;
    const date_created = new Date().toISOString().split('T')[0];
    const user_id = uuidv4();
try{
    const qcommand = new QueryCommand({
            TableName: process.env.DYNAMODB_USERS_TABLE,
            IndexName: "email-index",
            KeyConditionExpression: "email = :email",
            ExpressionAttributeValues: {
                ":email": {S: email}
            }
        })
    const result = await client.send(qcommand);
    if (result.Items && result.Items.length > 0) {
        return res.status(400).json({ message: 'User Already Exists.' });
    }
        const pcommand = new PutItemCommand({
            TableName: process.env.DYNAMODB_USERS_TABLE,
            Item: {
                user_id: {S: user_id},
                email: {S: email},
                name: {S: name},
                password: {S: password},
                phone_number: {S: phone_number},
                date_created: {S: date_created}
            }
        });
        await client.send(pcommand);
        return res.status(201).json({message: 'User Registered successfully.', user_id});

    }
    catch(err){
        console.error("Error registering user:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

const login = async (req, res) => {
    const isProd = process.env.NODE_ENV === "production";
    const { email, password } = req.body;
    try{
        const command = new QueryCommand({
            TableName: process.env.DYNAMODB_USERS_TABLE,
            IndexName: "email-index",
            KeyConditionExpression: "email = :email",
            FilterExpression: "password = :password",
            ExpressionAttributeValues: {
                ":email": { S: email },
                ":password": { S: password }
            }
        })
        const result= await client.send(command);
        if (!result.Items || result.Items.length === 0) {
            return res.status(404).json({ message: "User not found." });
        }
        const user = unmarshall(result.Items[0]);
        //Need to inject here
        const accessToken = jwt.sign(
            {user_id: user.user_id, name: user.name, email: user.email, role: 'user',task_count: user.task_count },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        // Create refresh token with longer expiry
        const refreshToken = jwt.sign(
            { user_id: user.user_id },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '7d' }
        );

        // Set cookies
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'none' : 'lax', // Correct setting for dev vs. prod
            path: '/',
            maxAge: 15 * 60 * 1000
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'none' : 'lax', // Correct setting for dev vs. prod
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });


        return res.status(200).json({ user:user, message: "User Found" });

    }
    catch(err){
        console.error("Cannot find user:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

const logout = (req, res) => {
    const isProd = process.env.NODE_ENV === 'production';

    res.cookie('accessToken', '', {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        path: '/',
        expires: new Date(0) // expire immediately
    });

    res.cookie('refreshToken', '', {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        path: '/',
        expires: new Date(0)
    });

    res.status(200).json({ message: 'Logged out' });
};


const validateAccessToken = (req, res) => {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
        return res.status(401).json({ message: "No token provided" });
    }

    jwt.verify(accessToken, process.env.JWT_SECRET, (err, payload) => {
        if (err) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }
        // Return minimal user info for the frontend
        return res.status(200).json({
            user: {
                user_id: payload.user_id,
                name: payload.name,   // see note below
                email: payload.email, // see note below
                task_count: payload.task_count,
            }
        });
    });
};


const refreshAccessToken = async (req, res, next) => {
    const isProd = process.env.NODE_ENV === 'production';

    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({ message: "No token provided" });
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, payload) => {
        if (err) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }

        const accessToken = jwt.sign(
            { user_id: payload.user_id, role: 'user' },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'none' : 'lax',
            path: '/',
            maxAge: 15 * 60 * 1000
        });

        return res.status(200).json({ ok: true });
    });
};


module.exports = {
    login,
    register,
    validateAccessToken,
    refreshAccessToken,
    logout
};