
var User = require('../models/user');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');


exports.user_register_get = function(req, res){
    res.render('register');
  };
  

exports.user_login = function(req, res){
    res.render('login');
  };
  

exports.user_register_post = [
 
    body('name', 'Name is required').isLength({ min: 1 }).trim(),
    body('email', 'Email is required').isLength({ min: 1 }).trim(),
    body('email', 'Email is not valid').isEmail(),
    body('username', 'Username is required').isLength({ min: 1 }).trim(),
    body('password', 'Password is required').isLength({ min: 1 }).trim(),
    body('password2').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
    }),
    sanitizeBody('*').escape(),
    (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/errors messages.
        res.render('register', {
            title: 'Create user account',
            errors: errors.array()
        });
        return;
    
    } else {
      let newUser = new User({
        name:req.body.name,
        email:req.body.email,
        username:req.body.username,
        password:req.body.password,
      });

      bcrypt.genSalt(10, function(err, salt){
        bcrypt.hash(newUser.password, salt, function(err, hash){
          if(err){
            console.log(err);
          }
          newUser.password = hash;
          newUser.save(function(err){
            if(err){
              console.log(err);
              return;
            } else {
               console.log(newUser)
               console.log('new user added')
            //   req.flash('success','You are now registered and can log in');
              res.redirect('/users/login');
            }
          });
        });
      });
    }
  },
]


exports.user_login_post = (req, res, next) =>{
  passport.authenticate('local', {
    successRedirect:'/catalog',
   
    failureRedirect:'/catalog/vocabulary',
    // failureFlash: true,
   
    // failureFlash: true
  })(req, res, next);
 
};

exports.user_logout_post = (req, res) => {
  req.logout();
  // req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
};