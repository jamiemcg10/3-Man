
var socket = io();

console.log("should emit soon...");


socket.on('message', function(data) {
    console.log(data);
});