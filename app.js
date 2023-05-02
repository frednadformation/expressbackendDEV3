var express = require('express');

var path = require('path');
var app = express();
var bodyParser = require('body-parser');

const methodOverride = require('method-override');
app.use(methodOverride('_method'))

var mongoose = require('mongoose');

app.use(bodyParser.urlencoded({ extended: false }));

app.set('view engine', 'ejs');

require('dotenv').config();

var Form = require('./modeles/Formulaire');

const Film = require('./modeles/Film');

const Post = require('./modeles/Post');


const url = process.env.DATABASE_URL;

mongoose.connect(url, {
    useNewUrlParser : true,
    useUnifiedTopology: true
}).then(console.log('MongoDB connected'))
.catch(err => console.log(err))





// app.get("/", function(req, res) {
//     res.sendFile(path.resolve('formulaire.html'));
// })

// CONTACT ROUTES
app.post("/submit-data", function(req, res) {
    console.log(req.body);
    var name = req.body.prenom + ' ' + req.body.nom;

    res.send(name + ' Submitted Successfully !')
});

app.get("/contact", function(req, res) {
    res.sendFile(path.resolve('contact.html'));
});

// app.post("/submit-contact", function(req, res) {
//     var retour = "Bonjour " + req.body.nom + " " + req.body.prenom + "<br>Merci de nous avoir contacté";
//     var email = req.body.email;
//     res.send(retour + "<br>Nous reviendrons vers vous dans les plus brefs délai " + email);
// });

app.post("/submit-contact", function(req, res) {
    const Data = new Form({
        prenom : req.body.prenom,
        nom : req.body.nom,
        age: req.body.age,
        email: req.body.email,
        message: req.body.message
    });
    Data.save().then(() =>{
        res.redirect('/')
    }).catch(err => console.log(err));
});

app.get('/', function(req, res) {
    Form.find().then(data => {
        console.log(data);
        res.render('Home', {data: data})
    })
});


app.get('/contact/:id', function(req, res) {

    Form.findOne({
        _id: req.params.id
    }).then(data => {
        res.render("Edit", {data: data})
    }).catch(err => {console.log(err)});
});

app.put('/contact/edit/:id', function (req, res) {
    const Data = {
        prenom : req.body.prenom,
        nom : req.body.nom,
        age: req.body.age,
        email: req.body.email,
        message: req.body.message
    };

    Form.updateOne({_id: req.params.id}, {$set: Data})
    .then((result) => {
        console.log(result);
        res.redirect('/')
    }).catch((err) => {
        console.log(err);
    });
})

app.delete('/contact/delete/:id', function(req, res){
    Form.findOneAndDelete({
        _id: req.params.id,
    }).then(() => {
        console.log("Data deleted")
        res.redirect('/');
    }).catch(err => console.log(err));
})

//END CONTACT ROUTES

//----------------------------------------------------------------
//FILM ROUTES

//Affiche le formulaire pour l'ajout d'un film
app.get('/newfilm', function (req, res) {
    res.render('NewFilm');
});

//Enregistre le film dans la base de données
app.post("/submit-film", function (req, res) {
    const Data = new Film({
        titre: req.body.titre,
        genre: req.body.genre,
        nb_ventes: req.body.nb_ventes,
        poster: req.body.poster,
    })
    Data.save().then(() => {
        console.log("film ajouté !");
        res.redirect('/newfilm')
    }).catch(err => {console.log(err)});;

});

//Affiche la totalité des films dans la page Allfilm.ejs
app.get('/allfilm', function (req, res) {
    Film.find().then((data) => {
        res.render('Allfilm', {data: data});
    });
});

app.get('/film/:id', function (req, res) {
    Film.findOne({
        _id: req.params.id
    }).then((data) => {res.render('Editfilm', {data: data});})
    .catch((err) => {console.error(err)});
    ;
});

app.delete('/film/delete/:id', function(req, res) {
    Film.findOneAndDelete({
        _id: req.params.id  
    }).then(()=> {
        console.log("Data deleted successfully");
        res.redirect('/allfilm');
    }).catch(err => {console.log(err)});
})

//----------------------------------------------------------------
//ROUTES POUR POST.JS

app.get('/newpost', function (req, res) {
    res.render('NewPost');
});

app.post('/submit-post', function (req, res) {
    const Data = new Post({
        titre : req.body.titre,
        soustitre : req.body.soustitre,
        para : req.body.para
    });
    Data.save().then( () => {
        res.redirect('/allposts');
    }).catch(err => {console.log(err)});
});

app.get('/allposts', function (req, res) {

    Post.find().then((data) => {
        res.render('AllPosts', {data : data});
    })

});

app.get('/post/:id', function (req, res){
    Post.findOne({_id : req.params.id}).then(data => {
        res.render('EditPost', {post : data});
    }).catch(err=> {console.log(err)});
})

app.delete('/post/delete/:id', function (req, res){
    Post.findOneAndDelete({
        _id : req.params.id
    }).then(
        () => {
            console.log("Data deleted successfully !");
            res.redirect('/allposts');
        }
    ).catch(err=> {console.log(err)});
});

app.put('/post/edit/:id', function (req, res){
    const Data = {
        titre : req.body.titre,
        soustitre : req.body.soustitre,
        para : req.body.para
    };
    Post.updateOne({_id: req.params.id}, {$set : Data})
    .then((data) =>{
        console.log(data);
        res.redirect('/allposts');
    })
    .catch(err=> {console.log(err)});

});


var server = app.listen(5000, function(){
    console.log('server listening on port 5000');
})
