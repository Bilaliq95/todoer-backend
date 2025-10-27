require('dotenv').config();
const express = require('express')
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
const port = process.env.PORT || 3002;
app.use(cookieParser());
app.use(express.json());

console.log('CORS_ALLOWED_ORIGIN=', process.env.CORS_ALLOWED_ORIGIN);


app.use(cors({
    origin: process.env.CORS_ALLOWED_ORIGIN,
    methods: ['GET','POST','PUT','DELETE','OPTIONS'], // add OPTIONS
    credentials: true,
    allowedHeaders: ['Content-Type','Authorization']   // safe default
}));

app.options('*', cors({ origin: process.env.CORS_ALLOWED_ORIGIN, credentials: true }));

// Import user routes
const userRoutes = require('./routes/userRoutes');
app.use('/users', userRoutes);


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, '0.0.0.0',() => {
    console.log(`User service listening on port ${port}`)
})