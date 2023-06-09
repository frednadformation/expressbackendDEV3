//Framework express
var express = require('express');
var app = express();

var path = require('path'); //Lire les fichier html

// enregistrement formulaire
var bodyParser = require('body-parser'); 
app.use(bodyParser.urlencoded({ extended: false }));

//Mode API, pour que REACT récupere les données
var cors = require('cors');
app.use(cors());

const bcrypt = require('bcrypt');//Encodage des mot de passe

//Method PUT et DELETE dans le front
const methodOverride = require('method-override');
app.use(methodOverride('_method'))

//Systeme de vue : EJS
app.set('view engine', 'ejs');

//Utilisation des cookies :
const cookieParser = require('cookie-parser');
app.use(cookieParser());

//Import JWT
const {createTokens, validateToken} = require('./JWT');

//BDD
require('dotenv').config();
var mongoose = require('mongoose');
const url = process.env.DATABASE_URL;

mongoose.connect(url, {
    useNewUrlParser : true,
    useUnifiedTopology: true
}).then(console.log('MongoDB connected'))
.catch(err => console.log(err))


//Appelles des modèles
var Form = require('./modeles/Formulaire');

const Film = require('./modeles/Film');

const Post = require('./modeles/Post');

const User = require('./modeles/User');

const Blog = require('./modeles/Blog');


const multer = require('multer')
app.use(express.static('uploads'))

const storage = multer.diskStorage({
    
    destination: (req, file, cb)=>{
        cb(null, 'uploads/');
    },
    filename: (req, file, cb)=>{
        cb(null, file.originalname);
    }
})
const upload = multer({storage})

app.post('/upload', upload.single('image'), (req, res) =>{
    if(!req.file){
        res.status(400).send('No File uploaded');
    }
    else{
        res.send('File uploaded successfully')
    }
})

app.post('/multipleImages', upload.array('images', 5), (req, res) =>{
    if(!req.files || req.files.length === 0){
        res.status(400).send('No File uploaded');
    }
    else{
        res.send('File uploaded successfully')
    }
})

app.post('/submit-blog',upload.single('image'), function(req, res) {
    const Data = new Blog({
        titre : req.body.titre,
        username : req.body.username,
        imageName: req.body.imageName
    });

    Data.save().then(() =>{
        res.send('File and Data uploaded successfully')
    }).catch(err => console.log(err));
})

app.get('/myblog', function (req, res) {
    Blog.find().then((data) => {
        res.json(data);
    });
});



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

// app.get('/', function(req, res) {
//     Form.find().then(data => {
//         console.log(data);
//         res.render('Home', {data: data})
//     })
// });


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
        res.redirect('http://localhost:3000/allfilm')
    }).catch(err => {console.log(err)});

});

//Affiche la totalité des films dans la page Allfilm.ejs
app.get('/allfilm', function (req, res) {
    Film.find().then((data) => {
        res.json(data);
    });
});

app.get('/film/:id', function (req, res) {
    Film.findOne({
        _id: req.params.id
    }).then((data) => {res.json(data);})
    .catch((err) => {console.error(err)});
    ;
});

app.put('/film/edit/:id', function (req, res){
    const Data = {
        titre: req.body.titre,
        genre: req.body.genre,
        nb_ventes: req.body.nb_ventes,
        poster: req.body.poster,
    };
    Film.updateOne({_id: req.params.id}, {$set : Data})
    .then((data) =>{
        console.log(data);
        res.redirect('http://localhost:3000/allfilm');
    })
    .catch(err=> {console.log(err)});
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
        // res.json({data: data});
        // res.json(data);
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

//----------------------------------------------------------------
//Modèle USER :

//Inscription
app.post('/api/signup', function (req, res){
    const Data = new User({
        username : req.body.username,
        email : req.body.email,
        password : bcrypt.hashSync(req.body.password, 10),
        admin: false
    });

    Data.save().then(() => {
        console.log("Utilisateur sauvergardé !");
        res.redirect('/login');
    }).catch(err => {console.log(err)});

});

//Affichage formulaire inscription
app.get('/newUser', function(req, res){
    res.render('Signup')
})
//Affichage formulaire connexion
app.get('/login', function(req, res){
    res.render('Login')
})

app.post('/api/login', function(req, res){
    User.findOne(
        {
            email : req.body.email
        }
    )
    .then( user => {
    if(!user){
        res.status(404).send('No user found');
    }
    console.log(user);
    // if(user.password != req.body.password ){
    //     res.status(404).send('Invalid password');
    // }
    if(!bcrypt.compareSync(req.body.password, user.password)){
        res.status(404).send('Invalid password');
    }
    const accessToken = createTokens(user);

    res.cookie("accessToken", accessToken, {
        maxAge: 60 * 60 * 24 * 30,// 30 jours
        httpOnly: true
    });
    res.json("LOGGED IN")

    res.render('Userpage', {data : user})
    })
    .catch(err =>console.log(err));
});


app.get('/', validateToken, function (req, res) {

    User.find().then((data) => {
        res.json({data : data});
    })

});



var server = app.listen(5000, function(){
    console.log('server listening on port 5000');
})

