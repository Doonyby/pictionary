var pictionary = function() {
    var socket = io();
    var canvas, context;

    
    function playerStatus(name) {
        if (name === "Player 1") {
            $('#status').text("You are " + name + "! You are the drawing this round. You must draw the word below.");
        }
        else {
            $('#status').text("You are " + name + "! You are the guessing this round. You must enter guesses in the text box below.")
        }
    };
    socket.on('whichPlayer', playerStatus);
    
    function currentWord(word) {
        $('#guess').html('<p>' + word.toUpperCase() + '</p>');
    }
    socket.on('randomWord', currentWord);
    
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
    }
    
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
        
    socket.on('position', draw);
    
    function weHaveWinner(name) {
        console.log(name);
    };
    socket.on('weHaveWinner', weHaveWinner);
};

$(document).ready(function() {
    pictionary();
});