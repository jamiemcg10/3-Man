// Dependencies
const { Console } = require('console');
const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');
const Game = require('./modules/Game.js');
const PlayerPool = require('./modules/PlayerPool.js');
const gameFuncs = require('./modules/gameFuncs.js');

console.log(gameFuncs);

var app = express();
var server = http.Server(app);
var io = socketIO(server);

let port = process.env.PORT || 5000;

app.set('port', port);
app.use('/static', express.static(__dirname + '/static'));
app.use('/modules', express.static(__dirname + '/modules'));
app.use('/assets', express.static(__dirname + '/assets'));


// Routing
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/game', function(req, res) {
    res.sendFile(path.join(__dirname, 'game.html'));
});

// Starts the server

server.listen(port, function(){
    console.log(`Starting server on port ${port}`);
});


var games = new Array(10);
console.log(games.length);
games[0] = [];


io.on('connection', function(socket) {
    socket.on('add to waiting room', function(data){
        console.log('add to waiting room');
        console.log(data);
        // do when player joins
        if (games[data.gameID] == null) {
            console.log('adding to empty game');
            let pp = new PlayerPool.PlayerPool([new PlayerPool.Player(data.name, data.id)]);
            games[data.gameID] = new Game(pp);
            // move this next line when everyone joins the room at the same time
            console.log(games[data.gameID].players.currentPlayer.id);
            io.sockets.binary(false).emit(`start turn${data.gameID}`, {player: games[data.gameID].players.currentPlayer});
        } else {
            console.log('before');
            console.log(games[data.gameID].players.list);
            console.log('adding to existing game');
            games[data.gameID].players.addPlayer(new PlayerPool.Player(data.name, data.id));
            console.log('after');
            console.log(games[data.gameID].players.list);
        }
        
        io.sockets.binary(false).emit(`add to waiting room${data.gameID}`, {name: data.name, id: data.id});
    });

    socket.on('validate code', function(data){
        console.log('socket.on(validate code)');
        let code = data.code;
        let gameList = games[0];
        if (games[0].includes(Number(code))){
            console.log(games[code[0]]);
            console.log(games[code[0]].players);
            console.log(games[code[0]].players.list);
            io.sockets.binary(false).emit(`validated code${code}`, {code: code, valid: true, requestingID: data.requestingID, playersAlreadyInRoom: games[code[0]].players.list, gameInProgress: games[code[0]].inProgress});
        } else {
            io.sockets.binary(false).emit(`validated code${code}`, {code: code, valid: false, requestingID: data.requestingID})
        }
    });

    // for generating and receiving codes
    socket.on('get code', function(data){
        console.log('socket.on(get code)');
        let code = gameFuncs.generateCode(games);
        console.log(games);
        io.sockets.binary(false).emit('new game code', {code: code, id: data});
    });
    
    // function generateCode(games){
    //     for (let i=1; i<games.length; i++){
    //         if (games[i] === undefined | games[i] === null){
    //             let code = Math.floor((i + Math.random()) * 1000);
    //             games[0].push(Number(code));
    //             return code;
    //         }

    //         return -1;
    //     }
    // }

    socket.on('start game', function(data){
        console.log(data);
        console.log('starting game');
        games[data.gameID].start();
        io.sockets.binary(false).emit(`go to game page${data.gameID}`, {gameData: games[data.gameID]});
        io.sockets.binary(false).emit(`start turn${data.gameID}`, {player: games[data.gameID].players.currentPlayer});
    });

    socket.on('get game data', function(data){
        io.sockets.binary(false).emit(`game data sent${data.gameID}`, {gameData: games[data.gameID]});
    });
    

    /// game play

    socket.on('new player', function(data){
        // do when player joins
        console.log(data);
        games[data.gameID].players.addPlayer(new PlayerPool.Player(data.name, socket.id));
        io.sockets.binary(false).emit(`new player${data.gameID}`, {name: data.name, id: data.id});
    });

    socket.on('roll', function(data) {
        console.log(data);
        let topPositions = [Math.random(), Math.random()];
        let leftPositions = [Math.random(), Math.random()];
        let rotations =  [Math.random(), Math.random()];
        
        games[data.gameID].lastRoll = {roll: data.roll, 
                                        topPositions: topPositions,
                                        leftPositions: leftPositions,
                                        rotations: rotations};


        io.sockets.binary(false).emit(`roll${data.gameID}`, {roll: data.roll, topPositions: topPositions, leftPositions: leftPositions, rotations: rotations});

    });
    

    socket.on('turn complete', function(data) {
        console.log('in turn complete');
        games[data.gameID].players.nextPlayer();
        io.sockets.binary(false).emit(`end of turn${data.gameID}`);
        io.sockets.binary(false).emit(`start turn${data.gameID}`, {player: games[data.gameID].players.currentPlayer});
        // kill any doubles rolls happening
        games[data.gameID].doublesRollNum = 0;
    });

    socket.on('ahead', function(data) {
        let target = games[data.gameID].players.ahead;
        console.log(target);
        io.sockets.binary(false).emit(`drink${data.gameID}`, {id: target.id, name: target.name});
    });

    socket.on('behind', function(data) {
        let target = games[data.gameID].players.behind;
        console.log(target);
        io.sockets.binary(false).emit(`drink${data.gameID}`, {id: target.id, name: target.name});
    });

    socket.on('three man', function(data) {
        let target = games[data.gameID].players.threeMan;
        console.log(target);
        io.sockets.binary(false).emit(`drink${data.gameID}`, {id: target.id, name: target.name});
    });

    socket.on('three man the hard way', function(data) {
        if (data.id){
            //someone actually rolled a 3
            let target = games[data.gameID].players.currentPlayer;
            console.log(games[data.gameID].players.list.indexOf(target));
            games[data.gameID].players.threeMan = games[data.gameID].players.list.indexOf(target);

        } else {
            // someone just joined
            console.log(data);
            games[data.gameID].players.threeMan = games[data.gameID].players.newest;
            console.log(games[data.gameID]);
            console.log(games[data.gameID].players);
            console.log(games[data.gameID].players.newest);
        }
        console.log(games[data.gameID].players.length);
        console.log(games[data.gameID].players.threeMan);
        io.sockets.binary(false).emit(`new three man${data.gameID}`, {new3Man: games[data.gameID].players.threeMan});
    });


    //  DOUBLES ROLL LISTENTERS
    socket.on('doubles', function(data){
        console.log("in socket.on(doubles)");
        games[data.gameID].doublesRollNum = 1; // initialize doubles counter in game data
        io.sockets.binary(false).emit(`doubles spiral ${data.gameID}`, {}); // brodcast to all sockets to start doubles handling
    });

    socket.on('dice distributed', function(data){
        console.log("socket.on(dice distributed)");
        let idData = data;
        console.log('tell clients to look for data');
        console.log(`data: ${idData}`);
        console.log(`doublesRollNum: ${games[data.gameID].doublesRollNum}`);
        io.sockets.binary(false).emit(`look for dice${data.gameID}`, {data: idData, doublesRollNum: games[data.gameID].doublesRollNum});
    });

    
    socket.on('doubles roll', function(newData) {
        // increment counter after both die are rolled

        let game = games[newData.gameID];
        let names = newData.name;
        
        let topPositions;
        let leftPositions;
        let rotations;

        game.pushDoublesDataRoll(newData.roll);
        game.pushDoublesDataName(newData.name);

        [topPositions, leftPositions, rotations] = gameFuncs.generatePositions(newData.roll.length);

        games[newData.gameID].pushDoublesDataTopPosition(...topPositions);
        games[newData.gameID].pushDoublesDataLeftPosition(...leftPositions);
        games[newData.gameID].pushDoublesDataRotation(...rotations);

        if (newData.roll.length === 2){ // one player has both dice
            names[1] = names[0];
            game.pushDoublesDataName(game.doublesData.names[0]);
        }

        io.sockets.binary(false).emit(`doubles die rolled${newData.gameID}`, {roll: newData.roll, names: names, ids: newData.ids, topPositions: topPositions, leftPositions: leftPositions, rotations: rotations});

        if (game.doublesData.roll.length === 2){  // change if more than 2 die used
            io.sockets.binary(false).emit(`all doubles dice rolled ${newData.gameID}`, {roll: game.doublesData.roll, names: game.doublesData.names, rtnRoll: newData.rtnRoll});
            game.clearDoublesData();
            games[newData.gameID].doublesRollNum++;  // increase game doubles counter
        }
    });

    socket.on('clear doubles roll num', function(data){
        games[data.gameID].doublesRollNum = 0;
    });

    // function generatePositions(numPositions){
    //     console.log("in generatePositions");
    //     let topPositions = [];
    //     let leftPositions = [];
    //     let rotations = [];

    //     for (let i=0; i<numPositions; i++){
    //         topPositions.push(Math.random());
    //         leftPositions.push(Math.random());
    //         rotations.push(Math.random());
    //     }

    //     return [topPositions, leftPositions, rotations];
    // }

    socket.on('player making rule', function(data){
        io.sockets.binary(false).emit(`player making rule${data.gameID}`, {name: data.name})
    });
    socket.on('new rule', function(data){
        console.log(data);
        io.sockets.binary(false).emit(`new rule${data.gameID}`, {rule: data.ruleText});
    });

    socket.on('remove player', function(data){
        let assignNewThreeMan = false;
        console.log(data);
        console.log(`removing a player ${data.removeID}`);
        console.log(games[data.gameID]);
        if (games[data.gameID] !== undefined){

            if (games[data.gameID].inProgress & data.id === games[data.gameID].players.threeMan.id){ // player is 3 man
                console.log("player that left was the 3 man");
                assignNewThreeMan = true;
            } 

            if (games[data.gameID].inProgress & games[data.gameID].players.currentPlayer.id === data.id){ // player is current player
                
                games[data.gameID].players.removePlayer(data.id);                
                console.log(games[data.gameID].players.currentPlayer);
                console.log(games[data.gameID].players.currentPlayer);
                io.sockets.binary(false).emit(`start turn${data.gameID}`, {player: games[data.gameID].players.currentPlayer});
                // kill any doubles rolls happening
                games[data.gameID].clearDoublesData();
                games[data.gameID].doublesRollNum = 0;
                console.log(games[data.gameID].players.currentPlayer);
            } else {
                games[data.gameID].players.removePlayer(data.id);
            }

            


            console.log(games[data.gameID].players.list.length);
            if (games[data.gameID].players.list.length === 0){ // no more players in room
                games[data.gameID] = null;
                // if next 6 lines work, add them to 1.0
                console.log(data.code);
                let codeToRemove = parseInt(data.code,10);
                console.log(codeToRemove);
                console.log(games);
                console.log(games[0]);
                console.log(`remove ${games[0].indexOf(codeToRemove)}`);
                if (games[0].indexOf(codeToRemove) >= 0){
                    games[0][games[0].indexOf(codeToRemove)] = null;
                }
                console.log(`ACTIVE GAME CODES: ${games[0]}`);
            } else if (assignNewThreeMan){
                io.sockets.binary(false).emit(`new three man${data.gameID}`, {new3Man: games[data.gameID].players.threeMan});
            }

            io.sockets.binary(false).emit(`remove player${data.gameID}`, {id: data.id});
        }   

        console.log(games[data.gameID]);
    });

    
    
});

