// Dependencies
const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');
const Game = require('./modules/Game.js');
const PlayerPool = require('./modules/PlayerPool.js');
const gameFuncs = require('./modules/gameFuncs.js');

const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const { getMaxListeners } = require('process');
const dotenv = require('dotenv').config();

const app = express();
const server = http.Server(app);
const io = socketIO(server);

let port = process.env.PORT || 5000;

// create transporter for mailer
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.user,
        pass: process.env.password
    }
});

app.set('port', port);
app.use('/static', express.static(__dirname + '/static'));
app.use('/modules', express.static(__dirname + '/modules'));
app.use('/assets', express.static(__dirname + '/assets'));
app.use(bodyParser.urlencoded({
    extended: true
  }));
app.use(bodyParser.json());


// Routing
app.get('/', function(req, res) {
    console.log(req);
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/contact', function(req, res) {
    res.sendFile(path.join(__dirname, 'contact.html'));
});


app.post('/sendEmail', function(req, res) {
    let subject = req.body.subject;
    let message = req.body.message;

    let mailOptions = {
        from: "jamie.a.smart@gmail.com",
        to: "jamie.a.smart@gmail.com",
        subject: `[3 MAN SUPPORT] ${subject}`,
        text: message
    }

    transporter.sendMail(mailOptions, (error, info)=>{
        if (error){
            console.log(error);
            res.json({success: false});
        } else {
            console.log(`Email sent: ${info.response}`);
            res.json({success: true});
        }
    });

    
});


// Starts the server
server.listen(port, function(){
    console.log(`Starting server on port ${port}`);
});


// initialize array to hold up to 9 games
var games = new Array(10);
games[0] = [];  // keeps track of game codes currently in use


io.on('connection', function(socket) {

    /*********

        GAME SETUP

    **********/
    socket.on('add to waiting room', function(data){
        // do when player joins
        if (games[data.gameID] == null) {  // if waiting room is empty, instantiate a new player pool and game
            let pp = new PlayerPool.PlayerPool([new PlayerPool.Player(data.name, data.id)]);
            games[data.gameID] = new Game(pp);
            // start the turn of the player who joined first for when everyone enters the room
            io.sockets.binary(false).emit(`start turn${data.gameID}`, {player: games[data.gameID].players.currentPlayer});
        } else {
            // add new player to playerpool
            games[data.gameID].players.addPlayer(new PlayerPool.Player(data.name, data.id));
        }
        
        // add player to waiting room
        io.sockets.binary(false).emit(`add to waiting room${data.gameID}`, {name: data.name, id: data.id});
    });

    socket.on('validate code', function(data){
        // make sure code user entered is valid
        let code = data.code;
        if (games[0].includes(Number(code))){  // check if code is in codes array
            io.sockets.binary(false).emit(`validated code${code}`, {code: code, valid: true, requestingID: data.requestingID, playersAlreadyInRoom: games[code[0]].players.list, gameInProgress: games[code[0]].inProgress});
        } else {
            io.sockets.binary(false).emit(`validated code${code}`, {code: code, valid: false, requestingID: data.requestingID})
        }
    });

    // for generating and receiving codes
    socket.on('get code', function(data){
        console.log(games[0]);
        let code = gameFuncs.generateCode(games);
        io.sockets.binary(false).emit('new game code', {code: code, id: data});
    });

    socket.on('start game', function(data){
        // signal to go to game page and start the game
        console.log('starting game');
        games[data.gameID].start();
        io.sockets.binary(false).emit(`go to game page${data.gameID}`, {gameData: games[data.gameID]});
        io.sockets.binary(false).emit(`start turn${data.gameID}`, {player: games[data.gameID].players.currentPlayer});
    });

    socket.on('get game data', function(data){
        // send current game data for players who join late
        io.sockets.binary(false).emit(`game data sent${data.gameID}`, {gameData: games[data.gameID]});
    });
    
    /*********

        GAME PLAY

    **********/

    socket.on('new player', function(data){
        // do when player joins
        games[data.gameID].players.addPlayer(new PlayerPool.Player(data.name, socket.id));
        io.sockets.binary(false).emit(`new player${data.gameID}`, {name: data.name, id: data.id});
    });

    socket.on('roll', function(data) {
        // player rolled, send back roll and position of dice

        // let topPositions = [Math.random(), Math.random()];
        // let leftPositions = [Math.random(), Math.random()];
        // let rotations =  [Math.random(), Math.random()];
        let topPositions;
        let leftPositions;
        let rotations;

        [topPositions, leftPositions, rotations] = gameFuncs.generatePositions(2);  // 2 is number of dice
        
        // save roll data to game to send back if player joins late
        games[data.gameID].lastRoll = {roll: data.roll, 
                                        topPositions: topPositions,
                                        leftPositions: leftPositions,
                                        rotations: rotations};


        io.sockets.binary(false).emit(`roll${data.gameID}`, {roll: data.roll, topPositions: topPositions, leftPositions: leftPositions, rotations: rotations});

    });
    

    socket.on('turn complete', function(data) {
        // move to the next player and signal to start their turn
        games[data.gameID].players.nextPlayer();
        io.sockets.binary(false).emit(`end of turn${data.gameID}`);
        io.sockets.binary(false).emit(`start turn${data.gameID}`, {player: games[data.gameID].players.currentPlayer});
        // kill any doubles rolls happening
        games[data.gameID].doublesRollNum = 0;
    });

    socket.on('ahead', function(data) {
        let target = games[data.gameID].players.ahead;
        io.sockets.binary(false).emit(`drink${data.gameID}`, {id: target.id, name: target.name});
    });

    socket.on('behind', function(data) {
        let target = games[data.gameID].players.behind;
        io.sockets.binary(false).emit(`drink${data.gameID}`, {id: target.id, name: target.name});
    });

    socket.on('three man', function(data) {
        let target = games[data.gameID].players.threeMan;
        io.sockets.binary(false).emit(`drink${data.gameID}`, {id: target.id, name: target.name});
    });

    socket.on('three man the hard way', function(data) {
        if (data.id){
            //someone actually rolled a 3
            let target = games[data.gameID].players.currentPlayer;
            games[data.gameID].players.threeMan = games[data.gameID].players.list.indexOf(target);

        } else {
            // someone just joined - not actually the hard way
            games[data.gameID].players.threeMan = games[data.gameID].players.newest;
        }

        io.sockets.binary(false).emit(`new three man${data.gameID}`, {new3Man: games[data.gameID].players.threeMan});
    });
    
    socket.on('player making rule', function(data){
        io.sockets.binary(false).emit(`player making rule${data.gameID}`, {name: data.name})
    });

    socket.on('new rule', function(data){
        io.sockets.binary(false).emit(`new rule${data.gameID}`, {rule: data.ruleText});
    });

    //  DOUBLES ROLL LISTENTERS
    socket.on('doubles', function(data){
        games[data.gameID].doublesRollNum = 1; // initialize doubles counter in game data
        io.sockets.binary(false).emit(`doubles spiral ${data.gameID}`, {}); // brodcast to all sockets to start doubles handling
    });

    socket.on('dice distributed', function(data){
        // player distributed both dice, tell clients to look for them
        let idData = data;
        io.sockets.binary(false).emit(`look for dice${data.gameID}`, {data: idData, doublesRollNum: games[data.gameID].doublesRollNum});
    });
    
    socket.on('doubles roll', function(newData) {
        let game = games[newData.gameID];
        let names = newData.name;
        
        let topPositions;
        let leftPositions;
        let rotations;

        game.pushDoublesDataRoll(newData.roll);
        game.pushDoublesDataName(newData.name);

        // generate placement of die/dice
        [topPositions, leftPositions, rotations] = gameFuncs.generatePositions(newData.roll.length);

        // add positions to saved game state data
        games[newData.gameID].pushDoublesDataTopPosition(...topPositions);
        games[newData.gameID].pushDoublesDataLeftPosition(...leftPositions);
        games[newData.gameID].pushDoublesDataRotation(...rotations);

        if (newData.roll.length === 2){ // one player has both dice
            names[1] = names[0];
            game.pushDoublesDataName(game.doublesData.names[0]);
        }

        // send signal that a die/dice has been rolled
        io.sockets.binary(false).emit(`doubles die rolled${newData.gameID}`, {roll: newData.roll, names: names, ids: newData.ids, topPositions: topPositions, leftPositions: leftPositions, rotations: rotations});

        if (game.doublesData.roll.length === 2){  // both die have been rolled - change if more than 2 die used
            io.sockets.binary(false).emit(`all doubles dice rolled ${newData.gameID}`, {roll: game.doublesData.roll, names: game.doublesData.names, rtnRoll: newData.rtnRoll});
            game.clearDoublesData();
            games[newData.gameID].doublesRollNum++;  // increase game doubles counter
        }
    });

    socket.on('clear doubles roll num', function(data){
        // set game doubles counter to 0
        games[data.gameID].doublesRollNum = 0;
    });



    /*********

        PLAYER LEFT GAME

    **********/

    socket.on('remove player', function(data){
        console.log(`ACTIVE GAME CODES: ${games[0]}`);
        let assignNewThreeMan = false;
        if (games[data.gameID] !== undefined){ // game that player left is still happening

            if (games[data.gameID].inProgress & data.id === games[data.gameID].players.threeMan.id){ // leaving player is 3 man
                assignNewThreeMan = true;
            } 

            if (games[data.gameID].inProgress & games[data.gameID].players.currentPlayer.id === data.id){ // leaving player is current player
                games[data.gameID].players.removePlayer(data.id);        
                io.sockets.binary(false).emit(`start turn${data.gameID}`, {player: games[data.gameID].players.currentPlayer});
                
                // kill any doubles rolls happening
                games[data.gameID].clearDoublesData();
                games[data.gameID].doublesRollNum = 0;
            } else { // just remove the player
                games[data.gameID].players.removePlayer(data.id);
            }

            
            if (games[data.gameID].players.list.length === 0){ // no more players in room - destroy the game
                games[data.gameID] = null;
                let codeToRemove = parseInt(data.code,10);
                if (games[0].indexOf(codeToRemove) >= 0){
                    games[0][games[0].indexOf(codeToRemove)] = null;
                }
                console.log(`ACTIVE GAME CODES: ${games[0]}`);
            } else if (assignNewThreeMan){ // set a new three man
                io.sockets.binary(false).emit(`new three man${data.gameID}`, {new3Man: games[data.gameID].players.threeMan});
            }

            // signal to remove the player
            io.sockets.binary(false).emit(`remove player${data.gameID}`, {id: data.id});
        }   

    });

    
    
});

