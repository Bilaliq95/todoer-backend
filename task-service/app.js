const express = require('express')
const cors = require('cors');
const app = express()
const port = process.env.PORT || 3004;
app.use(cors({
    origin: '*',  // your React frontend origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // allowed HTTP methods
    credentials: true // if you use cookies or auth headers
}));
app.use(express.json());
// Import user routes
const taskRoutes = require('./routes/taskRoutes');
app.use('/tasks', taskRoutes);


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Task service listening on port ${port}`)
})