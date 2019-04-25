var express = require('express');
var router = express.Router();
var user_controller = require('../controllers/userController');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/cool', function(req, res, next) {
  res.send('you are so cool');
});


router.get('/register',  user_controller.user_register_get)

router.post('/register', user_controller.user_register_post)

module.exports = router;
