const mongoose = require('mongoose');

const formSchema = mongoose.Schema({
    prenom : { type: String},
    nom : { type: String},
    age: { type: Number},
    email : { type: String},
    message : { type: String},
});

module.exports = mongoose.model('Form', formSchema);