var pictionary = function() {
    var socket = io();
    var canvas, context;
    
    //tell player if drawer, give word to draw.
    function drawer(game) {
        $('#status').text("You are " + game.players[game.turn].name + 
            "! You are the drawing this round. You must draw the word below.");
        $('#guess').html('<p>' + game.word.randomWord.toUpperCase() + '</p>');
        drawingBoard();
    }
    socket.on('setDrawer', drawer);
    
    //tell player if guesser.
    function guesser(name) {
        $('#status').text("You are " + name +
            "! You are the guessing this round. You must enter guesses in the text box below.");
    }
    socket.on('setGuesser', guesser);
    
    //handles when player makes a guess.
    var guessBox;
    var onKeyDown = function(event) {
        if (event.keyCode != 13) { // Enter
            console.log('key down 13');
            return;
        }
        console.log('key down not');
        var guess = guessBox.val();
        socket.emit('guess', guess);
        guessBox.val('');
    };
   
    //displays guesses, or if player has won.
    var displayGuess = function(guess) {
        $('#displayGuess').text(guess);
    };
    
    guessBox = $('#guess input');
    guessBox.on('keydown', onKeyDown);
    socket.on('guess', displayGuess);
    
    //displays drawing on everyone's canvas.
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
    
    //access to drawing on canvas. (only current drawer has access)
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
    
    //handles the option to restart the game with new drawer after a player has guessed correctly and won.
    function weHaveWinnerClient(name) {
        $('#restartDiv').html('<p>Press the "restart" button to play again with the next player drawing.</p>' + 
            '<br><button id="restart">Restart</button>');
        $('#restart').on('click', function() {
            socket.emit('restart');
        });
    }
    socket.on('weHaveWinner', weHaveWinnerClient);
    
    //handles the resetting of the game upon the click of the 'restart' button.
    function clearBoard(game) {
        function getPlayerName(id) {
            for (var i=0; i<=game.players.length; i++) {
                if (game.players[i].id === id) {
                    return game.players[i].name;
                }
            }
        }
        $('#status').empty();
        $('#restartDiv').empty();
        $('#displayGuess').empty();
        $('#guess').empty().html('Make a guess: <input type="text">');
        context.clearRect(0, 0, 800, 600);
        //sets new drawer according to the game object's current turn.
        if ("/#" + socket.id === game.players[game.turn].id) {
            drawer(game);
        }
        //sets the rest of the players as guessers.
        else {
            guesser(getPlayerName("/#" + socket.id));
        }
    }
    socket.on('clearUi', clearBoard);
    
    //handles a restart option if current drawer leaves the room.
    function drawerExitClient(name) {
        $('#restartDiv').html('<p>' + name + ' was drawing but has left the room.' + 
            ' Press the "restart" button to play again with the next player drawing.</p><br><button id="restart">Restart</button>');
        $('#restart').on('click', function() {
            socket.emit('restart');
        });
    }
    socket.on('drawerExit', drawerExitClient);
};

$(document).ready(function() {
    pictionary();
});