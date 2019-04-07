var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var VocabularySchema= new Schema(
    {
         name: 
           {type: String, required: true, min: 3, max: 100},
         definition:  
           {type: String, required: true, min: 3, max: 100},
         
    }
)

VocabularySchema
.virtual('url')
.get(function () {
  return '/catalog/vocabulary/' + this._id;
});


module.exports = mongoose.model('Vocabulary', VocabularySchema);