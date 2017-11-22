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

// currently serving everything
// TODO: make sure only files necessary to be served/public are included here
app.use(express.static(path.join(__dirname, './../')));


app.get('/', (req, res) => {
    res.sendFile(path.resolve('index.html')); 
    // res.status(200).send("Welcome to SpeakEasy.io");
});

// Client registers their identity and keyBundle with the server
// Username and keyBundle are passed as data in the post request
app.post('/register', UserController.saveIdentity);

// Sender requests receiver's preKey Bundle 
app.get('/connect/:recipientId', (req, res, next) => {
    console.log("query string: ", req.params.recipientId); 

    UserController.findIdentity(req, res);
});

// Receive shared secret 
app.get('/session', (req, res, next) => {

});

app.post('/message', UserController.saveMessage);

app.get('/message/:recipientId', UserController.retrieveMessages);

// Send shared secret (message)
//app.post('/session', )
app.listen(3030, () => {
    console.log('Listening on port 3030!');
});