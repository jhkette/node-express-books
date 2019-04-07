var Vocabulary = require('../models/vocabulary');
var Book = require('../models/book');
var async = require('async');
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display list of all Genre.
// exports.genre_list = function (req, res) {
//     Genre.find()
//         .then((list_genre) => {
//             res.render('genre_list', {
//                 title: 'Genre list',
//                 genre_list: list_genre
//             })
//         })
//         .catch(err => console.log(err));
// };


// Display detail page for a specific Genre.
exports.vocabulary_detail = function (req, res, next) {

    async.parallel({
        vocabulary: (callback) => {
            Vocabulary.findById(req.params.id)
                .exec(callback);
        },

    }, (err, results) => {
        if (err) {
            return next(err);
        }
        if (results.vocabulary == null) { // No results.
            var err = new Error('Genre not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render
        res.render('vocabulary_detail', {
            title: 'vocab Detail',
            vocabulary: results.vocabulary,
           
        });
    });
};


// Display Genre create form on GET.
exports.vocabulary_create_get = function(req, res, next) {     
    res.render('vocabulary_form', { title: 'Create Vocab' });
    res.render('vocabulary_form', { title: 'Create Vocabulary', vocabulary: vocabulary, errors: errors.array()});
  };

// Handle Genre create on POST.
// Handle Genre create on POST.
// Handle Genre create on POST.
exports.vocabulary_create_post =  [
    
    // Validate that the name field is not empty.
    body('name', 'Genre name required').isLength({ min: 1 }).trim(),
    
    // Sanitize (escape) the name field.
    sanitizeBody('name').escape(),
  
    // Process request after validation and sanitization.
    (req, res, next) => {
          
      // Extract the validation errors from a request.
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        // There are errors. Render the form again with sanitized values/error messages.
        res.render('vocabulary_form', { title: 'Create Genre', errors: errors.array()});
        return;
      }
      else {
          // Create a genre object with escaped and trimmed data.
        var vocabulary = new Vocabulary(
            { name: req.body.name }
          ); 
        // Data from form is valid.
        // Check if Genre with same name already exists.
        Vocabulary.findOne({ 'name': req.body.name })
          .then(( found_vocabulary) => {
             
             if (found_vocabulary) {
               // Genre exists, redirect to its detail page. 
               res.render('vocabulary_form', { title: 'Create Genre', vocabulary: vocabulary, errors: errors.array()});
             }
             else {    
               vocabulary.save()
               .then((vocabulary) => {
                res.redirect(vocabulary.url);
               
               })
             }
           })
           .catch(err => console.log(err));
      }
    }
  ];
// // Display Genre delete form on GET.
// exports.genre_delete_get = function (req, res) {
//     res.send('NOT IMPLEMENTED: Genre delete GET');
// };

// // Handle Genre delete on POST.
// exports.genre_delete_post = function (req, res) {
//     res.send('NOT IMPLEMENTED: Genre delete POST');
// };

// // Display Genre update form on GET.
// exports.genre_update_get = function (req, res) {
//     res.send('NOT IMPLEMENTED: Genre update GET');
// };

// // Handle Genre update on POST.
// exports.genre_update_post = function (req, res) {
//     res.send('NOT IMPLEMENTED: Genre update POST');
// };