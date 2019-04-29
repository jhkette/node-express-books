var Book = require('../models/book');
var Author = require('../models/author');
var Genre = require('../models/genre');
var Vocabulary = require('../models/vocabulary');
var async = require('async');
const {
    body,
    validationResult
} = require('express-validator/check');
const {
    sanitizeBody
} = require('express-validator/filter');




exports.index = (req, res) => {
    async.parallel({
            book_count: (callback) => {
                Book.countDocuments({}, callback); // Pass an empty object as match condition to find all documents of this collection
            },
            author_count: (callback) => {
                Author.countDocuments({}, callback);
            },
            genre_count: (callback) => {
                Genre.countDocuments({}, callback);
            },
            book_random: (callback) => {
                Book.aggregate(
                    [{
                        $sample: {
                            size: 6
                        }
                    }], callback
                )
            }
        },
        (err, results) => {
            console.log(results.book_random)
            res.render('index', {
                title: 'Booknotes',
                error: err,
                data: results,

            });
        });
};
// Display list of all books.
exports.book_list = (req, res, next) => {

    Book.find({}, 'title author')
        .populate('author')

        .then((list_books) => {
            res.render('book_list', {
                title: 'Book List',
                book_list: list_books
            });
        })
        .catch((err) => console.log(err))
};

// Display detail page for a specific book.
exports.book_detail = (req, res, next) => {

    async.parallel({
        book: (callback) => {

            Book.findById(req.params.id)
                .populate('author')
                .populate('genre')
                .populate('vocabulary')
                .exec(callback);
        },

    }, (err, results) => {
        if (err) {
            return next(err);
        }
        if (results.book == null) { // No results.
            var err = new Error('Book not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('book_detail', {
            title: 'Title',
            book: results.book,
            book_instances: results.book_instance
        });
    });
};

// Display book create form on GET.
exports.book_create_get = (req, res, next) => {

    // Get all authors and genres, which we can use for adding to our book.
    async.parallel({
        authors: (callback) => {
            Author.find(callback);
        },
        genres: (callback) => {
            Genre.find(callback);
        },
        vocabularylist: (callback) => {
            Vocabulary.find(callback);
        },
    }, function (err, results) {
        if (err) {
            return next(err);
        }
        res.render('book_form', {
            title: 'Create Book',
            authors: results.authors,
            genres: results.genres,
            vocabularylist: results.vocabularylist
        });
    });

};

// you need to use upload.single
// https://github.com/expressjs/multer

exports.book_create_post = [
    // Convert the genre to an array.
    (req, res, next) => {


        if (!(req.body.genre instanceof Array)) {
            if (typeof req.body.genre === 'undefined')
                req.body.genre = [];
            else
                req.body.genre = new Array(req.body.genre);
        }
        if (!(req.body.vocabulary instanceof Array)) {
            if (typeof req.body.vocabulary === 'undefined')
                req.body.vocabulary = [];
            else
                req.body.vocabulary = new Array(req.body.vocabulary);
        }

        next();
    },

    // Validate fields.
    body('title', 'Title must not be empty.').isLength({
        min: 1
    }).trim(),
    body('author', 'Author must not be empty.').isLength({
        min: 1
    }).trim(),
    body('summary', 'Summary must not be empty.').isLength({
        min: 1
    }).trim(),
    body('review', 'Review must not be empty.').isLength({
        min: 1
    }).trim(),

    // Sanitize fields (using wildcard).
    sanitizeBody('*').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {
        const errors = validationResult(req);


        // Extract the validation errors from a request.
        let image  = ' ';
        if(req.file !== undefined){
            image = ref.file.filename;
        }
    
        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form.
            async.parallel({
                authors: (callback) => {
                    Author.find(callback);
                },
                genres: (callback) => {
                    Genre.find(callback);
                },
                vocabularylist: (callback) => {
                    Vocabulary.find(callback);
                },
            }, (err, results) => {
                if (err) {
                    return next(err);
                }
                // Mark our selected genres as checked.
                for (let i = 0; i < results.genres.length; i++) {
                    if (book.genre.indexOf(results.genres[i]._id) > -1) {
                        results.genres[i].checked = 'true';
                    }
                }
                for (let i = 0; i < results.vocabularylist.length; i++) {
                    if (book.vocabulary.indexOf(results.vocabularylist[i]._id) > -1) {
                        results.vocabulary[i].checked = 'true';
                    }
                }
                res.render('book_form', {
                    title: 'Create Book',
                    authors: results.authors,
                    genres: results.genres,
                    read: req.body.read,
                    vocabularylist: results.vocabularylist,
                    book: book,
                    errors: errors.array()
                });

            });
            return;
        } else {
            // Create a Book object with escaped and trimmed data.
            var book = new Book({
                title: req.body.title,
                author: req.body.author,
                summary: req.body.summary,
                review: req.body.review,
                read: req.body.read,
                genre: req.body.genre,
                vocabulary: req.body.vocabulary,
                imageUrl: image
            });
            // Data from form is valid. Save book.
            book.save((err) => {
                if (err) {
                    return next(err);
                }
                //successful - redirect to new book record.
                res.redirect(book.url);
            });
        }

    }

];

// Display book update form on GET.
exports.book_update_get = (req, res, next) => {

    // Get book, authors and genres for form.
    async.parallel({
        book: function (callback) {
            Book.findById(req.params.id).populate('author').populate('genre').populate('vocabulary').exec(callback);
        },
        authors: function (callback) {
            Author.find(callback);
        },
        genres: function (callback) {
            Genre.find(callback);
        },
        vocabularylist: function (callback) {
            Vocabulary.find(callback);
        },
    }, (err, results) => {
        if (err) {
            return next(err);
        }
        if (results.book == null) { // No results.
            var err = new Error('Book not found');
            err.status = 404;
            return next(err);
        }

        // Success.
        // Mark our selected genres as checked.
        for (var all_g_iter = 0; all_g_iter < results.genres.length; all_g_iter++) {
            for (var book_g_iter = 0; book_g_iter < results.book.genre.length; book_g_iter++) {
                if (results.genres[all_g_iter]._id.toString() == results.book.genre[book_g_iter]._id.toString()) {
                    results.genres[all_g_iter].checked = 'true';
                }
            }
        }
        for (var all_v_iter = 0; all_v_iter < results.vocabularylist.length; all_v_iter++) {
            for (var book_v_iter = 0; book_v_iter < results.book.vocabulary.length; book_v_iter++) {
                if (results.vocabularylist[all_v_iter]._id.toString() == results.book.vocabulary[book_v_iter]._id.toString()) {
                    results.vocabularylist[all_v_iter].checked = 'true';
                }
            }
        }

        res.render('book_form', {
            title: 'Update Book',
            authors: results.authors,
            genres: results.genres,
            vocabularylist: results.vocabularylist,
            book: results.book
        });
    });
};

// Handle book update on POST.
exports.book_update_post = [

    // Convert the genre to an array
    (req, res, next) => {
        if (!(req.body.genre instanceof Array)) {
            if (typeof req.body.genre === 'undefined')
                req.body.genre = [];
            else
                req.body.genre = new Array(req.body.genre);
        }
        if (!(req.body.vocabulary instanceof Array)) {
            if (typeof req.body.vocabulary === 'undefined')
                req.body.vocabulary = [];
            else
                req.body.vocabulary = new Array(req.body.vocabulary);
        }
        next();
    },

    // Validate fields.
    body('title', 'Title must not be empty.').isLength({
        min: 1
    }).trim(),
    body('author', 'Author must not be empty.').isLength({
        min: 1
    }).trim(),
    body('summary', 'Summary must not be empty.').isLength({
        min: 1
    }).trim(),
    body('review', 'review must not be empty').isLength({
        min: 1
    }).trim(),

    // Sanitize fields.
    sanitizeBody('title').escape(),
    sanitizeBody('author').escape(),
    sanitizeBody('summary').escape(),
    sanitizeBody('review').escape(),
    sanitizeBody('genre.*').escape(),
    sanitizeBody('vocabulary.*').escape(),
    sanitizeBody('image').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            async.parallel({
                authors: (callback) => {
                    Author.find(callback);
                },
                genres: (callback) => {
                    Genre.find(callback);
                },
                vocabularylist: (callback) => {
                    Vocabulary.find(callback);
                },
            }, (err, results) => {
                if (err) {
                    return next(err);
                }
                // Mark our selected genres as checked.
                for (let i = 0; i < results.genres.length; i++) {
                    if (book.genre.indexOf(results.genres[i]._id) > -1) {
                        results.genres[i].checked = 'true';
                    }
                }
                for (let i = 0; i < results.vocabularylist.length; i++) {
                    if (book.vocabulary.indexOf(results.vocabularylist[i]._id) > -1) {
                        results.vocabulary[i].checked = 'true';
                    }
                }
                res.render('book_form', {
                    title: 'Create Book',
                    authors: results.authors,
                    genres: results.genres,
                    read: req.body.read,
                    vocabularylist: results.vocabularylist,
                    book: book,
                    errors: errors.array()
                });
            });
            return;

        } else {
            const title = req.body.title;
            const author = req.body.author;
            const summary = req.body.summary;
            const review = req.body.review;
            const read = req.body.read;
            const genre = (typeof req.body.genre === 'undefined') ? [] : req.body.genre;
            const id = req.params.id; //This is required, or a new ID will be assigned!
            const vocab = (typeof req.body.vocabulary === 'undefined') ? [] : req.body.vocabulary;
            const image = req.file;

            // Data from form is valid. Update the record.
            Book.findById(req.params.id)
                .then(book => {
                    book.title = title;
                    book.author = author;
                    book.summary = summary;
                    book.review = review;
                    book.read = read;
                    book.genre = genre;
                    book._id = id; //This is required, or a new ID will be assigned!
                    book.vocabulary = vocab;
                    if (image) {
                        book.imageUrl = image.filename;
                    }
                    return book.save().then(result => {
                        console.log('UPDATED book!');
                        res.redirect('/');
                    });
                })
                .catch(err => console.log(err));
        }
    }

];


exports.book_delete_get = function (req, res, next) {

    async.parallel({
        book: function (callback) {
            Book.findById(req.params.id).populate('author').populate('genre').exec(callback);
        },
    }, function (err, results) {
        if (err) {
            return next(err);
        }
        if (results.book == null) { // No results.
            res.redirect('/catalog/books');
        }
        // Successful, so render.
        res.render('book_delete', {
            title: 'Delete Book',
            book: results.book
        });
    });

};



exports.book_delete_post = function (req, res, next) {

    // Assume the post has valid id (ie no validation/sanitization).

    async.parallel({
        book: function (callback) {
            Book.findById(req.body.id).populate('author').populate('genre').exec(callback);
        },
    }, function (err, results) {
        if (err) {
            return next(err);
        }
        // Success

        // Book has no BookInstance objects. Delete object and redirect to the list of books.
        Book.findByIdAndRemove(req.body.id, function deleteBook(err) {
            if (err) {
                return next(err);
            }
            // Success - got to books list.
            res.redirect('/catalog/books');
        });


    })

};