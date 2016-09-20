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
//game object
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
    //creates a new player object with every connection.
    console.log('connection made');
    var newPlayer = {};
    newPlayer.id = socket.id;
    newPlayer.name = "Player " + count++;
    game.players.push(newPlayer);
    collectPlayer(newPlayer.name);
    
    //decides if player is drawing or not.
    function collectPlayer(name) {
        if (name === game.players[game.turn].name) {
            setDrawer(game);
        } 
        else {
            setGuesser(name);
        }
        
    }
    
    //sends drawer to client side.
    function setDrawer(game) {
        socket.emit('setDrawer', game); 
    }
    
    //sends guesser to client side.
    function setGuesser(name) {
        socket.emit('setGuesser', name); 
    }
    
    //handles players that leave game.
    socket.on('disconnect', function() {
        //if drawer leaves, take that player off players array, tell everyone and give option to continue game with new drawer.
        if (game.players[game.turn].id === socket.id) {
            io.emit('drawerExit', getPlayerName(socket.id));
            game.players.splice(game.turn, 1);
        }
        //if guesser, then take player off players array.
        else {
            for (var i=0; i<game.players.length; i++) {
                if (game.players[i].id === socket.id) {
                    game.players.splice(i, 1);
                }
            }
        }
    });
    
    //transmits drawing to everyone's canvas.
    socket.on('position', function(position) {
        io.emit('position', position);
    });
   
    //handles guesses from guessers.
    socket.on('guess', function(guess) {
        //if guess is correct, tell everyone and start process of restart.
        if (guess.toLowerCase() == game.word.randomWord) {
            io.emit('guess', getPlayerName(socket.id) + " wins, by having guessed " + guess.toUpperCase() + "!!!");
            io.emit('weHaveWinner', getPlayerName(socket.id));
        }
        //if not correct, display guess so everyone can see.
        else {
            io.emit('guess', "guesses: " + guess);
        }
    });
    
    //upon restart, changes game object word, advances turn, and starts the resetting of the ui.
    socket.on('restart', function() {
        game.word = new Word;
        game.nextTurn();
        io.emit('clearUi', game);       
    });
   
});

server.listen(process.env.PORT || 8080);