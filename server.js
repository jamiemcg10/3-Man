//import {Dice, Player, PlayerPool} from './classes.js';
// Dependencies

var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var classes = require('./static/classes.js');


var app = express();
var server = http.Server(app);
var io = socketIO(server);

app.set('port', 5000);
app.use('/static', express.static(__dirname + '/static'));
app.use('/assets', express.static(__dirname + '/assets'));


// Routing
app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname, 'index.html'));
});


// Starts the server
server.listen(5000, function() {
    console.log('Starting server on port 5000');
}); 


// Add the WebSocket handlers
io.on('connection', function(socket) {

});

var games = new Array(10);

setInterval(function() {
    for (let i=0; i<games.length; i++){
        //io.sockets.emit(`state${i}`, games);
        io.sockets.emit(`state${i}`, games);
    }
    
}, 1000);

var players = [];
var playerPool;

// player needs to be able to leave game
// isolate games

io.on('connection', function(socket) {
    socket.on('new player', function(data){
        // do when player joins
        console.log(data);
        if (games[data.gameID] == null) {
            let pp = new classes.PlayerPool([new classes.Player(data.name, socket.id)]);
            //console.log(pp);
            games[data.gameID] = new classes.Game(pp);
            // move this next line when everyone joins the room at the same time
            console.log(games[data.gameID].players.currentPlayer.id);
            io.sockets.emit(`start turn${data.gameID}`, {id: games[data.gameID].players.currentPlayer.id});
        } else {
            games[data.gameID].players.addPlayer(new classes.Player(data.name, socket.id));
        }

    });

    socket.on('roll', function(data) {
        io.sockets.emit(`roll${data.gameID}`, data);
    });

    socket.on('turn complete', function(data) {
        console.log('in turn complete');
        games[data.gameID].players.nextPlayer();
        io.sockets.emit(`start turn${data.gameID}`, {player: games[data.gameID].players.currentPlayer});
    });

    socket.on('ahead', function(data) {
        let target = games[data.gameID].players.ahead;
        console.log(target);
        io.sockets.emit('drink', {id: target.id, name: target.name});
    });

    socket.on('behind', function(data) {
        let target = games[data.gameID].players.behind;
        console.log(target);
        io.sockets.emit('drink', {id: target.id, name: target.name});
    });

    socket.on('three man', function(data) {
        let target = games[data.gameID].players.threeMan;
        console.log(target);
        io.sockets.emit('drink', {id: target.id, name: target.name});
    });

    socket.on('three man the hard way', function(data) {
        let target = games[data.gameID].players.currentPlayer;
        console.log(games[data.gameID].players.list.indexOf(target));
        games[data.gameID].players.threeMan = games[data.gameID].players.list.indexOf(target);
        console.log(games[data.gameID].players.threeMan);
        io.sockets.emit('new three man', {new3Man: games[data.gameID].players.threeMan});
    });

    socket.on('doubles', function(data) {
        io.sockets.emit('doubles', {});
    });



    {
        let roll=[];
        let names=[];

        socket.on('dice distributed', function(data){
            let idData = data;
            console.log('tell clients to look for data');
            io.sockets.emit('look for dice', {data: idData});
        });
            
        socket.on('doubles roll', function(newData) {
            console.log(games[newData.gameID].doublesData);
            let game = games[newData.gameID];
            console.log(game);
            console.log(newData);
            game.pushDoublesDataRoll(newData.roll);
            game.pushDoublesDataName(newData.name);
            console.log(game.doublesData);


            if (game.doublesData.roll.length == 2){
                //1 player has both dice
                if (game.doublesData.names.length === 1){
                    game.pushDoublesDataName(game.doublesData.names[0]);
                }

                //console.log(newData.rtnRoll);
                io.sockets.emit('doubles roll finished', {roll: game.doublesData.roll, names: game.doublesData.names, rtnRoll: newData.rtnRoll});
                game.clearDoublesData();
                console.log(game.doublesData);
            }
        });

        
    }


    socket.on('dice returned', function(data) {
        // console.log(data);
        // if (true){
        //     io.sockets.emit('dice returned');
        // }

        // from dice distributed
        let idData = data;
        console.log('tell clients to look for returned dice');
        io.sockets.emit('look for dice', {data: idData});
    });

    {
        let roll=[];
        let names=[];

        socket.on('dice returned roll', function(data) {
            console.log('in dice returned roll');
            console.log(data);

            // copied from doubles roll
            roll.push(...data.roll);
            names.push(data.name);
            console.log(names);
            console.log(roll);

            // 1 player has both dice
            if (names.length === 1){
                names[1] = names[0];
            }

            if (roll.length == 2){
                io.sockets.emit('doubles roll finished', {roll: roll, names: names, rtnRoll: data.rtnRoll});
                roll = [];
                names = [];
                console.log(roll);
                console.log(names);
            }

            names=[];
            roll=[];
        });
    }

    socket.on('remove player', function(data){
        console.log('removing a player');
        console.log(games[data.gameID]);
        if (games[data.gameID] !== undefined){
            games[data.gameID].players.removePlayer(data.id);
        
        //console.log(game);
        //onsole.log(games[data.gameID].players.list.length);
            if (games[data.gameID].players.list.length === 0){
                games[data.gameID] = null;
                //io.sockets.close();
            }
        }   
    });
    
    
});

