const express = require('express')
const router = express.Router();
const { registerUser, authUser, allUsers } = require('../controllers/userControllers');
const { protect } = require("../middlewares/authMiddleware");


//router.route('/').post(registerUser)
router.post('/', registerUser);
router.post('/login', authUser);
router.get("/", protect, allUsers);



module.exports = router;