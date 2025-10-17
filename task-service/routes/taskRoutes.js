const { createTask,updateTask,deleteTask,getTask, getAllTasks,getTasksByUser } = require('../controllers/taskControllers');
const express = require('express');
const router = express.Router();

router.post('/', createTask);          // POST   /tasks
router.get('/', getAllTasks);          // GET    /tasks
router.get('/:id', getTask);           // GET    /tasks/:id
router.put('/:id', updateTask);        // PUT    /tasks/:id
router.delete('/:id', deleteTask);     // DELETE /tasks/:id          // (Optional) Get all tasks
router.get('/user/:userId', getTasksByUser);

module.exports = router;
