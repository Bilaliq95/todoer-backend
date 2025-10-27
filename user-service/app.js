require('dotenv').config();
const express = require('express')
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
const port = process.env.PORT || 3002;
app.use(cookieParser());
app.use(express.json());



app.use(cors({
    origin: process.env.CORS_ALLOWED_ORIGIN,  // your React frontend origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // allowed HTTP methods
    credentials: true // if you use cookies or auth headers
}));
// Import user routes
const userRoutes = require('./routes/userRoutes');
app.use('/users', userRoutes);


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, '0.0.0.0',() => {
    console.log(`User service listening on port ${port}`)
})