const express = require('express')
const cors = require('cors');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const port = process.env.PORT || 3002;
app.use(cookieParser());
app.use(express.json());

app.use(cors({
    origin: '*',  // your React frontend origin
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
    console.log(`Example app listening on port ${port}`)
})