const express = require('express');
const app = express();
const http = require('http');
// const WebSocket = require('ws');
const bodyParser = require('body-parser');
const path = require('path');
const cookieParser = require('cookie-parser');
// const authenticate = require('./middleware/authenticate').authenticate;

// const Message = require('./model/message.js')
// const chatCtrl = require('./controller/chatCtrl');
// const userCtrl = require('./controller/userController');

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use('/', express.static(__dirname + '/public/'));
app.use('/', express.static(__dirname + '/src/'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.get('/styles')

// app.get('/', authenticate, (req, res) => {
//   res.sendFile(path.join(__dirname, './../public/main.html'));
// });

// app.get('/login', (req, res) => {
//   res.sendFile(path.join(__dirname, './../public/client/login.html'));
// });

// app.post('/login', userCtrl.verifyUser, (req, res) => {
//   res.redirect('/');
// });

// app.post('/signup', userCtrl.addUser);

// const server = require('./socket.js')(app);
app.listen(3000, () => console.log('listening on 3000x'));