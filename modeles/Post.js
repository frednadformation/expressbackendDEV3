const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    titre : { type: String},
    soustitre : { type: String},
    para : { type: String },
})

module.exports = mongoose.model('Post', postSchema)