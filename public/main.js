var pictionary = function() {
    var socket = io();
    var canvas, context;
    
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
        $('#displayGuess').text(guess)
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
        console.log('down');
        drawing = true;
    }).mouseup(function() {
        console.log('up');
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
};

$(document).ready(function() {
    pictionary();
});