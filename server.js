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

app.get('/landing', function(request, response) {
    response.sendFile(path.join(__dirname, 'landing.html'));
});

// Starts the server
server.listen(5000, function() {
    console.log('Starting server on port 5000');
}); 


var games = new Array(10);
games[0] = [];

setInterval(function() {
    for (let i=1; i<games.length; i++){
        //io.sockets.emit(`state${i}`, games);
        //io.sockets.emit(`state${i}`, games);
        io.sockets.emit(`state${i}`, games[i]);
    }
    
}, 5000);


// player needs to be able to leave game

/// join games

io.on('connection', function(socket) {
    socket.on('add to waiting room', function(data){
        console.log('add to waiting room');
        console.log(data);
        // do when player joins
        if (games[data.gameID] == null) {
            console.log('adding to empty game');
            let pp = new classes.PlayerPool([new classes.Player(data.name, socket.id)]);
            //console.log(pp);
            games[data.gameID] = new classes.Game(pp);
            // move this next line when everyone joins the room at the same time
            console.log(games[data.gameID].players.currentPlayer.id);
            io.sockets.emit(`start turn${data.gameID}`, {id: games[data.gameID].players.currentPlayer.id});
        } else {
            console.log('before');
            console.log(games[data.gameID].players.list);
            console.log('adding to existing game');
            games[data.gameID].players.addPlayer(new classes.Player(data.name, socket.id));
            console.log('after');
            console.log(games[data.gameID].players.list);
        }
    });

    socket.on('validate code', function(data){
        let code = data.code;
        let gameList = games[0];
        // console.log(code);
        // console.log(typeof code);
        // console.log(games[0]);
        // console.log([2].includes(2));
        // console.log(typeof gameList[0]);
        // console.log(gameList.includes(Number(code)));
        // console.log(Array.isArray(games[0]));
        if (games[0].includes(Number(code))){
            io.sockets.emit(`validated code${code}`, {code: code, valid: true, requestingID: data.requestingID});
        } else {
            io.sockets.emit(`validated code${code}`, {code: code, valid: false})
        }
    });

    // for generating and receiving codes
    socket.on('get code', function(data){
        console.log('socket.on(get code)');
        let code = generateCode();
        console.log(data);
        console.log(`code${data}`);
        let returnID = `code${data}`;
        io.sockets.emit('game code', {code: code, id: data});
    });
    
    function generateCode(){
        for (let i=1; i<games.length; i++){
            if (games[i] === undefined | games[i] === null){
                let code = Math.floor((i + Math.random()) * 1000);
                console.log(code);
                games[0].push(Number(code));
                return code;
            }
        }
    }
    

    /// game play

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
        io.sockets.emit(`drink${data.gameID}`, {id: target.id, name: target.name});
    });

    socket.on('behind', function(data) {
        let target = games[data.gameID].players.behind;
        console.log(target);
        io.sockets.emit(`drink${data.gameID}`, {id: target.id, name: target.name});
    });

    socket.on('three man', function(data) {
        let target = games[data.gameID].players.threeMan;
        console.log(target);
        io.sockets.emit(`drink${data.gameID}`, {id: target.id, name: target.name});
    });

    socket.on('three man the hard way', function(data) {
        let target = games[data.gameID].players.currentPlayer;
        console.log(games[data.gameID].players.list.indexOf(target));
        games[data.gameID].players.threeMan = games[data.gameID].players.list.indexOf(target);
        console.log(games[data.gameID].players.threeMan);
        io.sockets.emit(`new three man${data.gameID}`, {new3Man: games[data.gameID].players.threeMan});
    });

    socket.on('doubles', function(data) {
        io.sockets.emit(`doubles${data.gameID}`, {});
    });



    {
        let roll=[];
        let names=[];

        socket.on('dice distributed', function(data){
            let idData = data;
            console.log('tell clients to look for data');
            io.sockets.emit(`look for dice${data.gameID}`, {data: idData});
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
                io.sockets.emit(`doubles roll finished${newData.gameID}`, {roll: game.doublesData.roll, names: game.doublesData.names, rtnRoll: newData.rtnRoll});
                game.clearDoublesData();
                console.log(game.doublesData);
            }
        });

        
    }

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
                io.sockets.emit(`doubles roll finished${data.gameID}`, {roll: roll, names: names, rtnRoll: data.rtnRoll});
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

