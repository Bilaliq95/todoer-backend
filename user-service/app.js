require('dotenv').config();
const express = require('express')
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
const port = process.env.PORT || 3002;
app.use(cookieParser());
app.use(express.json());

console.log('CORS_ALLOWED_ORIGIN=', process.env.CORS_ALLOWED_ORIGIN);


const corsOptions = {
    origin: process.env.CORS_ALLOWED_ORIGIN,   // "http://localhost:3000"
    credentials: true,
    methods: ['GET','POST','PUT','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Import user routes
const userRoutes = require('./routes/userRoutes');
app.use('/users', userRoutes);


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, '0.0.0.0',() => {
    console.log(`User service listening on port ${port}`)
})