var express = require('express');
var router = express.Router();
var user_controller = require('../controllers/userController');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});



router.get('/register',  user_controller.user_register_get)

router.post('/register', user_controller.user_register_post)


router.get('/login',  user_controller.user_login)

router.post('/login',  user_controller.user_login_post)


router.get('/logout',user_controller. user_logout_post)

module.exports = router;