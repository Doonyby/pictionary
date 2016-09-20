var pictionary = function() {
    var socket = io();
    var canvas, context;
    
    function drawer(game) {
        $('#status').text("You are " + game.players[game.turn].name + 
            "! You are the drawing this round. You must draw the word below.");
        $('#guess').html('<p>' + game.word.randomWord.toUpperCase() + '</p>');
        drawingBoard();
    }
    socket.on('setDrawer', drawer);


    function guesser(name) {
        $('#status').text("You are " + name +
            "! You are the guessing this round. You must enter guesses in the text box below.");
    }
    socket.on('setGuesser', guesser);
    
    var guessBox;
    var onKeyDown = function(event) {
        if (event.keyCode != 13) { // Enter
            return;
        }
        var guess = guessBox.val();
        socket.emit('guess', guess);
        guessBox.val('');
    };
    
    var displayGuess = function(guess) {
        $('#displayGuess').text(guess);
    };
    
    guessBox = $('#guess input');
    guessBox.on('keydown', onKeyDown);
    socket.on('guess', displayGuess);
    
    
    var draw = function(position) {
        context.beginPath();
        context.arc(position.x, position.y,
                         6, 0, 2 * Math.PI);
        context.fill();
    };
    canvas = $('canvas');
    context = canvas[0].getContext('2d');
    canvas[0].width = canvas[0].offsetWidth;
    canvas[0].height = canvas[0].offsetHeight;
    
    function drawingBoard() {    
        var drawing = false;
        canvas.mousedown(function() {
            drawing = true;
        }).mouseup(function() {
            drawing = false;
        }).on('mousemove', function(event) {
            if (drawing) {
                var offset = canvas.offset();
                var position = {x: event.pageX - offset.left,
                                y: event.pageY - offset.top};
                draw(position);
                socket.emit('position', position);
            }
        });
    }
    socket.on('position', draw);
    
    function weHaveWinnerClient(name) {
        $('#restart').html('<p>Press the "restart" button to play again with the next player drawing.</p>' + 
            '<br><button id="restart">Restart</button>');
        $('#restart').on('click', function() {
            socket.emit('restart');
        });
    }
    socket.on('weHaveWinner', weHaveWinnerClient);
    


    function clearBoard(game) {
        function getPlayerName(id) {
            for (var i=0; i<=game.players.length; i++) {
                if (game.players[i].id === id) {
                    return game.players[i].name;
                }
            }
        }
        $('#status').empty();
        $('#restart').empty();
        $('#displayGuess').empty();
        $('#guess').empty().html('Make a guess: <input type="text">');
        context.clearRect(0, 0, 800, 600);
        if ("/#" + socket.id === game.players[game.turn].id) {
            drawer(game);
        }
        else {
            guesser(getPlayerName("/#" + socket.id));
        }
    }
    socket.on('clearUi', clearBoard);
};

$(document).ready(function() {
    pictionary();
});