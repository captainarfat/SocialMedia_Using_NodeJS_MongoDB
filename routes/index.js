const express = require('express');
const router = express.Router();
const homeController = require('../controllers/home_controllers');


console.log('Yes Its Running');

router.get('/', homeController.home);
router.use('/users', require('./users'));
router.use('/posts', require('./posts'));
router.use('/comments', require('./comments'));



module.exports = router;