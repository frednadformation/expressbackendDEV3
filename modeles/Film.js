const mongoose = require('mongoose');

const filmSchema = mongoose.Schema({
    titre : {type: 'String'},
    genre : {type: 'String'},
    nb_ventes : {type: 'Number'},
    poster : {type: 'String'}
})

module.exports = mongoose.model('Film', filmSchema);