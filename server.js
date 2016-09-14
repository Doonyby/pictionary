var http = require('http');
var express = require('express');
var socket_io = require('socket.io');

var app = express();
app.use(express.static('public'));

var server = http.Server(app);
var io = socket_io(server);

var WORDS = [
    "word", "letter", "number", "person", "pen", "class", "people",
    "sound", "water", "side", "place", "man", "men", "woman", "women", "boy",
    "girl", "year", "day", "week", "month", "name", "sentence", "line", "air",
    "land", "home", "hand", "house", "picture", "animal", "mother", "father",
    "brother", "sister", "world", "head", "page", "country", "question",
    "answer", "school", "plant", "food", "sun", "state", "eye", "city", "tree",
    "farm", "story", "sea", "night", "day", "life", "north", "south", "east",
    "west", "child", "children", "example", "paper", "music", "river", "car",
    "foot", "feet", "book", "science", "room", "friend", "idea", "fish",
    "mountain", "horse", "watch", "color", "face", "wood", "list", "bird",
    "body", "dog", "family", "song", "door", "product", "wind", "ship", "area",
    "rock", "order", "fire", "problem", "piece", "top", "bottom", "king",
    "space"
];
var random = Math.floor(Math.random * WORDS.length);
var randomWord = WORDS[random];
var players = [];
var count = 0;

io.on('connection', function(socket) {
    console.log('connection made');
    var newPlayer = {};
    newPlayer.id = socket.id;
    newPlayer.name = "player " + count++;
    players.push(newPlayer);
    console.log(players);
    
   
    socket.on('position', function(position) {
        io.emit('position', position);
    });
    
    socket.on('guess', function(guess) {
        io.emit('guess', guess);
    });
   
});

server.listen(process.env.PORT || 8080);