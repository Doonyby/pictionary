var http = require('http');
var express = require('express');
var socket_io = require('socket.io');

var app = express();
app.use(express.static('public'));

var server = http.Server(app);
var io = socket_io(server);

function getPlayerName(id) {
    for (var i=0; i<=game.players.length; i++) {
        if (game.players[i].id === id) {
            return game.players[i].name;
        }
    }
}

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

var Word = function() {
    var random = Math.floor(Math.random() * WORDS.length);
    this.randomWord = WORDS[random];
};

var game = {
    word: new Word(),
    players: [],
    turn: 0,
    nextTurn: function() {
        this.turn++;
        if (this.turn == this.players.length) {
            this.turn = 0;
        }
    }
};
var count = 1;

io.on('connection', function(socket) {
    console.log('connection made');
    var newPlayer = {};
    newPlayer.id = socket.id;
    newPlayer.name = "Player " + count++;
    game.players.push(newPlayer);
    collectPlayer(newPlayer.name);
    
    function collectPlayer(name) {
        if (name === game.players[game.turn].name) {
            setDrawer(game);
        } 
        else {
            setGuesser(name);
        }
        
    }
    
    function setDrawer(game) {
        socket.emit('setDrawer', game); 
    }
    
    function setGuesser(name) {
        socket.emit('setGuesser', name); 
    }
    
    socket.on('position', function(position) {
        io.emit('position', position);
    });
    
    socket.on('guess', function(guess) {
        if (guess.toLowerCase() == game.word.randomWord) {
            io.emit('guess', getPlayerName(socket.id) + " wins, by having guessed " + guess.toUpperCase() + "!!!");
            io.emit('weHaveWinner', getPlayerName(socket.id));
        }
        else {
            io.emit('guess', "guesses: " + guess);
        }
    });
    
    socket.on('restart', function() {
        game.word = new Word;
        game.nextTurn();
        io.emit('clearUi', game);       
    });
   
});

server.listen(process.env.PORT || 8080);