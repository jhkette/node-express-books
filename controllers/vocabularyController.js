var Vocabulary = require('../models/vocabulary');
var Book = require('../models/book');
var async = require('async');
const {
    body,
    validationResult
} = require('express-validator/check');
const {
    sanitizeBody
} = require('express-validator/filter');

// Display list of all Genre.
exports.vocabulary_list = function (req, res) {
    Vocabulary.find()
        .then((list_vocabulary) => {
            res.render('vocabulary_list', {
                title: 'Vocabulary list',
                vocabulary_list: list_vocabulary
            })
        })
        .catch(err => console.log(err));
};


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
exports.vocabulary_create_get = function (req, res, next) {
    res.render('vocabulary_form', {
        title: 'Create Vocab'
    });
    res.render('vocabulary_form', {
        title: 'Create Vocabulary',
        vocabulary: vocabulary,
        errors: errors.array()
    });
};

// Handle Genre create on POST.
// Handle Genre create on POST.
// Handle Genre create on POST.
exports.vocabulary_create_post = [

    // Validate that the name field is not empty.
    body('name', 'Genre name required').isLength({
        min: 1
    }).trim(),
    body('definition', 'Definition required').isLength({
        min: 3
    }).trim(),

    // Sanitize (escape) the name field.
    sanitizeBody('*').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('vocabulary_form', {
                title: 'Create Genre',
                errors: errors.array()
            });
            return;
        } else {
            // Create a genre object with escaped and trimmed data.
            var vocabulary = new Vocabulary({
                name: req.body.name,
                definition: req.body.definition
            });
            // Data from form is valid.
            // Check if Genre with same name already exists.
            Vocabulary.findOne({
                    'name': req.body.name
                })
                .then((found_vocabulary) => {

                    if (found_vocabulary) {
                        // Genre exists, redirect to its detail page. 
                        res.render('vocabulary_form', {
                            title: 'Create Genre',
                            vocabulary: vocabulary,
                            errors: errors.array()
                        });
                    } else {
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
// Display Genre delete form on GET.
// Display Genre delete form on GET.
exports.vocabulary_delete_get = (req, res, next) => {

    async.parallel({
        vocabulary: function (callback) {
            Vocabulary.findById(req.params.id).exec(callback);
        },
        vocabulary_books: function (callback) {
            Book.find({
                'vocabulary': req.params.id
            }).exec(callback);
        },
    }, (err, results) => {
        if (err) {
            return next(err);
        }
        if (results.vocabulary == null) { // No results.
            res.redirect('/catalog/vocabulary');
        }

        // Successful, so render.
        res.render('vocabulary_delete', {
            title: 'Delete vocabulary',
            vocabulary: results.vocabulary,
            vocabulary_books: results.vocabulary_books
        });
    });

};

// Handle Genre delete on POST.
exports.vocabulary_delete_post =  (req, res, next) => {

    async.parallel({
        vocabulary: (callback) => {
            Vocabulary.findById(req.params.id).exec(callback);
        },
        vocabulary_books: (callback) => {
            Book.find({
                'vocabulary': req.params.id
            }).exec(callback);
        },
    },  (err, results) => {
        if (err) {
            return next(err);
        }
        // Success
        if (results.vocabulary_books.length > 0) {
            // Genre has books. Render in same way as for GET route.
            res.render('vocabularye_delete', {
                title: 'Delete vocabulary',
                genre: results.vocabulary,
                vocabulary_books: results.vocabulary_books
            });
            return;
        } else {
            // Genre has no books. Delete object and redirect to the list of genres.
            Vocabulary.findByIdAndRemove(req.body.id, function deleteGenre(err) {
                if (err) {
                    return next(err);
                }
                // Success - go to genres list.
                res.redirect('/catalog/vocabulary');
            });

        }
    });

};

// Display Genre update form on GET.
exports.vocabulary_update_get = (req, res, next) => {

    Vocabulary.findById(req.params.id, (err, vocabulary) => {
        if (err) {
            return next(err);
        }
        if (vocabulary == null) { // No results.
            var err = new Error('vocabulary not found');
            err.status = 404;
            return next(err);
        }
        // Success.
        res.render('vocabulary_form', {
            title: 'Update Vocabulary',
            vocabulary: vocabulary
        });
    });

};

// Handle Genre update on POST.
exports.vocabulary_update_post = [

    // Validate that the name field is not empty.
    body('name', 'Genre name required').isLength({
        min: 1
    }).trim(),

    // Sanitize (escape) the name field.
    sanitizeBody('name').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request .
        const errors = validationResult(req);

        // Create a genre object with escaped and trimmed data (and the old id!)
        var vocabulary = new Vocabulary({
            name: req.body.name,
            definition: req.body.definition,
            _id: req.params.id
        });


        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values and error messages.
            res.render('genre_form', {
                title: 'Update vocabulary',
                vocabulary: vocabulary,
                errors: errors.array()
            });
            return;
        } else {
            // Data from form is valid. Update the record.
            Vocabulary.findByIdAndUpdate(req.params.id, vocabulary, {}, function (err, thevocabulary) {
                if (err) {
                    return next(err);
                }
                // Successful - redirect to genre detail page.
                res.redirect(thevocabulary.url);
            });
        }
    }
];