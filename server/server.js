const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');


//require the database model
const UserController = require('./userController');

const app = express();

app.use(function (req, res, next) {
    // allow for Cross Origin Resource Sharing
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
    res.setHeader('Cache-Control', 'no-cache');
    next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//app.use(express.static(path.join(__dirname, './')));


app.get('/', (req, res) => {
    // res.sendFile(path.resolve('index.html')); 
    res.status(200).send("Welcome to SpeakEasy.io");
});

// Client register their identity and keyBundle with the server
app.post('/register', (req, res) => {
    // Receive PreKey Bundle    
    // call UserController.saveIdentity passing req and res
    UserController.saveIdentity(req, res);
});

// Sender requests receiver's preKey Bundle 
app.get('/connect/:recipientId', (req, res, next) => {
    console.log("query string: ", req.params.recipientId); 

    UserController.findIdentity(req, res);
});

// Receive shared secret 
app.get('/session', (req, res, next) => {

});

// Send shared secret (message)
//app.post('/session', )
app.listen(3030, () => {
    console.log('Listening on port 3030!');
});