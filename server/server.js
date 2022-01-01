// Dependencies
import express from 'express'
//const http = require('http');
import { createServer } from 'http'
import path  from 'path'
import { Game } from 'modules'
import { PlayerPool, Player } from 'modules'
import { generateCode, generatePositions } from 'modules'  // do this better later

import bodyParser from 'body-parser'
import nodemailer from 'nodemailer'
import dotEnv from 'dotenv'
const dotenv = dotEnv.config();

import cors from 'cors'

const app = express();

let port = process.env.PORT || 5000;

// create transporter for mailer
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.user,
        pass: process.env.password
    }
});

app.use(bodyParser.urlencoded({
    extended: true
  }));
app.use(bodyParser.json());

app.use(cors({
    origin: 'http://localhost:3000'
}))

import { Server } from 'socket.io'

const httpServer = createServer(app);
const io = new Server(httpServer,  {
        cors: {
          origin: true,
          methods: ["GET", "POST"],
        }
      });

httpServer.listen(port, function(){
        console.log(`Starting server on port ${port}`);
    })



// Routing
app.get('/', function(_req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/contact', (_req, res) => {
    res.sendFile(path.join(__dirname, 'contact.html'));
});


app.post('/sendEmail', (req, res) => {
    let subject = req.body.subject;
    let message = req.body.message;

    let mailOptions = {
        from: "jamie.a.smart@gmail.com",
        to: "jamie.a.smart@gmail.com",
        subject: `[3 MAN SUPPORT] ${subject}`,
        text: message
    }

    transporter.sendMail(mailOptions, (error, _info)=>{
        error ? res.json({success: false}) : res.json({success: true})
    });
});

app.get('/getNewCode', (_req, res) => {
    console.log(games[0]);
    let code = generateCode(games);
    res.json({success: code > 0, code})
})

app.get('/checkCode/:code', (req, res) => {
    let code = req.params.code
    console.log(`checking ${code}`)

    // make sure name isn't already in use

    games[0].includes(Number(code)) ? res.json({valid: true}) : res.json({valid: false})    
})


// initialize array to hold up to 9 games
var games = new Array(10);
games[0] = [];  // keeps track of game codes currently in use

// move this later -
function checkDice(gameID, roll) { 
    games[gameID].consecutiveRolls++
    console.log('consecutiveRolls', games[gameID].consecutiveRolls)

    io.to(gameID).emit('clear message board')

    let sum = roll.reduce((previous, current) => {
        return previous + current
    }, 0)

    console.log(sum)

    if (sum !== 3 && sum !== 7 && sum !== 11 & !roll.includes(3) & roll[0] !== roll[1]){
        switchToNextPlayer(gameID)
        return
    }

    if (sum === 3){
        let target = games[gameID].players.currentPlayer
        games[gameID].players.threeMan = games[gameID].players.list.indexOf(target)
    
        io.to(gameID).emit(`new three man`, {
                                                new3Man: games[gameID].players.threeMan, 
                                                name: games[gameID].players.current3Man.name})
        switchToNextPlayer(gameID)
    }

    if (sum === 7){
        let target = games[gameID].players.ahead
        io.to(gameID).emit(`drink`, {name: target.name})
    }

    if (sum === 11){
        let target = games[gameID].players.behind
        io.to(gameID).emit(`drink`, {name: target.name})
    }                        

    if (roll.includes(3)){
        let target = games[gameID].players.current3Man
        console.log(target)
        io.to(gameID).emit(`drink`, {name: target.name})
    }

    // test for doubles - needs to change if more dice are allowed
    if (roll[0] === roll[1]){
        games[gameID].doublesRollNum = 1 // initialize doubles counter in game data
        io.to(gameID).emit('doubles spiral') // brodcast to all sockets to start doubles handling     
    }

    console.log('rolls', games[gameID].consecutiveRolls, 'rolls % 5', games[gameID].consecutiveRolls % 2)
    if (games[gameID].consecutiveRolls % 5 === 0){
        let target = games[gameID].players.currentPlayer
        io.to(gameID).emit(`player making rule`, { name: target.name })
    }
};

function switchToNextPlayer(gameID){
    // move to the next player and signal to start their turn
    games[gameID].endTurn()
    io.to(gameID).emit(`switch to next player`)
}

io.on('connection', function(socket) {
    socket.on('join', function(data){
        socket.join(data)
    })

    /*********

        GAME SETUP

    **********/
    socket.on('update name', function({ id, name, gameID }){
        console.log(id, name, gameID)
        games[gameID].players.updatePlayerName(id, name)
        console.log(games[gameID].players)
        io.to(gameID).emit('update player name', { id, name })

    })
    socket.on('new player', function({ name, id, gameID}){
        console.log("socket.on('new player', function(data)", name, id, gameID)
        games[gameID].players.addPlayer(new Player(name, id))
        io.to(gameID).emit(`add player`, {name, id })
        if (games[gameID].inProgress) {
            games[gameID].players.threeMan = games[gameID].players.length - 1
        }
    })

    socket.on('start game', function(data){
        // signal to go to game page and start the game
        games[data.gameID].inProgress = true
        io.to(data.gameID).emit(`go to game page`, {gameData: games[data.gameID]})
        io.sockets.emit(`start turn${data.gameID}`, {player: games[data.gameID].players.currentPlayer})
    })

    socket.on('get game data', function(data){
        console.log('socket.on(\'get game data\', function(data)')
        // TODO" check code to make sure it's valid here
        if (games[data.gameID] == null) {  // if room is empty, instantiate a new player pool and game
            let pp = new PlayerPool()
            games[data.gameID] = new Game(pp)
            console.log('making new game', games[data.gameID])
        }
        // send current game data for players who join late
        console.log("socket.on('get game data', function(data)")
        io.to(data.gameID).emit(`game data sent`, {gameData: games[data.gameID], requestingId: data.id})
    })
    
    /*********

        GAME PLAY

    **********/

        // add threeman the hard way


    socket.on('roll', ({gameID}) => {
        console.log('socket.on(\'roll\', function(data)')
        // player rolled, send back roll and position of dice
        // refactor next line later (sides, number of die into function)
        let roll = [(Math.floor((Math.random() * 100)) % 6) + 1, (Math.floor((Math.random() * 100)) % 6) + 1]

        let topPositions
        let leftPositions
        let rotations

        [topPositions, leftPositions, rotations] = generatePositions(2);  // 2 is number of dice
        
        // save roll data to game to send back if player joins late
        games[gameID].lastRoll = {roll, 
                                        topPositions,
                                        leftPositions,
                                        rotations}


        io.to(gameID).emit(`roll`, {roll, topPositions, leftPositions, rotations})
        checkDice(gameID, roll)
    })


    socket.on('new rule', function({ newRuleText }){
        io.sockets.emit(`new rule`, { rule: newRuleText });
    })

    //  DOUBLES ROLL LISTENTERS
    socket.on('dice distributed', function(data){
        // player distributed both dice, tell clients to look for them
        let idData = data;
        io.sockets.emit(`look for dice${data.gameID}`, {data: idData, doublesRollNum: games[data.gameID].doublesRollNum});
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
        [topPositions, leftPositions, rotations] = generatePositions(newData.roll.length);

        // add positions to saved game state data
        games[newData.gameID].pushDoublesDataTopPosition(...topPositions);
        games[newData.gameID].pushDoublesDataLeftPosition(...leftPositions);
        games[newData.gameID].pushDoublesDataRotation(...rotations);

        if (newData.roll.length === 2){ // one player has both dice
            names[1] = names[0];
            game.pushDoublesDataName(game.doublesData.names[0]);
        }

        // send signal that a die/dice has been rolled
        io.sockets.emit(`doubles die rolled${newData.gameID}`, {roll: newData.roll, names: names, ids: newData.ids, topPositions: topPositions, leftPositions: leftPositions, rotations: rotations});

        if (game.doublesData.roll.length === 2){  // both die have been rolled - change if more than 2 die used
            io.sockets.emit(`all doubles dice rolled ${newData.gameID}`, {roll: game.doublesData.roll, names: game.doublesData.names, rtnRoll: newData.rtnRoll});
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
   socket.on('disconnecting', (reason)=>{
        console.log('REASON: ', reason)
        console.log(socket.id, socket.rooms)
        console.log( socket.rooms.values())
        let rooms = [...socket.rooms.values()]
        for (let i=1; i < rooms.length; i++){
            removePlayerFromGame(socket.id, rooms[i])
        }
    })

    function removePlayerFromGame(id, gameID){
        console.log('removing', id, 'from', gameID)
        if (games[gameID] !== undefined){ // game that player left is still happening TODO: THIS PROBABLY ALSO ISN'T WORKING

            games[gameID].players.removePlayer(id)  

            console.log(306, games[gameID].players.list.length)
            if (games[gameID].players.list.length === 0){ // no more players in room - destroy the game
                games[gameID] = null
                for(let i=0; i<games[0].length; i++){
                    if(Math.floor(games[0][i]/1000) === parseInt(gameID)){
                        games[0].splice(i, 1)
                    }
                }
                console.log(`ACTIVE GAME CODES IN REMOVE PLAYER: ${games[0]}`)
                return

            } 

            if (games[gameID].inProgress && id === games[gameID].players.threeMan.id){ // leaving player is 3 man
                io.to(gameID).emit(`new three man`, {new3Man: games[gameID].players.threeMan})
            } 

            if (games[gameID].inProgress && games[gameID].players.currentPlayer.id === id){ // leaving player is current player
                switchToNextPlayer()
            } else { // just remove the player
                games[gameID].players.removePlayer(id)
            }



            // signal to remove the player
            io.to(gameID).emit(`remove player`, { id })
        }  
    }

    socket.on('remove player', function({ id, gameID, code, name}){
        console.log(`socket.on('remove player', function(data)`)
        console.log(`ACTIVE GAME CODES: ${games[0]}`)
        console.log({id}, {gameID}, {code}, {name})
        console.log('player to be removed', games[gameID]?.players)
        // FIX EVERYTHING ABOUT THIS
        let assignNewThreeMan = false
        if (games[gameID] !== undefined){ // game that player left is still happening TODO: THIS PROBABLY ALSO ISN'T WORKING

            if (games[gameID].inProgress && id === games[gameID].players.threeMan.id){ // leaving player is 3 man
                assignNewThreeMan = true
            } 

            if (games[gameID].inProgress && games[gameID].players.currentPlayer.id === id){ // leaving player is current player
                games[gameID].players.removePlayer(id)  
                switchToNextPlayer()
            } else { // just remove the player
                games[gameID].players.removePlayer(id)
            }

            
            if (games[gameID].players.list.length === 0){ // no more players in room - destroy the game
                games[gameID] = null
                let codeToRemove = parseInt(code,10)
                if (games[0].indexOf(codeToRemove) >= 0){
                    games[0][games[0].indexOf(codeToRemove)] = null
                }
                console.log(`ACTIVE GAME CODES IN REMOVE PLAYER: ${games[0]}`)
            } else if (assignNewThreeMan){ // set a new three man
                io.to(gameID).emit(`new three man`, {new3Man: games[gameID].players.threeMan})
            }

            // signal to remove the player
            io.to(gameID).emit(`remove player`, { name })
        }   
        console.log('player removed', games[gameID]?.players)

    })

    
    
})

