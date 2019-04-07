var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var VocabularySchema= new Schema(
    {
         vocabulary:[ 
           {type: String, required: true, min: 3, max: 100},
         ]
    }
)



module.exports = mongoose.model('Vocabulary', VocabularySchema);