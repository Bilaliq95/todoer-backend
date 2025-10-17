const { login,register,validateAccessToken,refreshAccessToken,logout } = require('../controllers/userControllers');
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('List of users');
});
router.post('/login',login);
router.post('/logout',logout);
router.post('/register',register);
router.post('/validate',validateAccessToken);
router.post('/refresh',refreshAccessToken);

module.exports = router;
