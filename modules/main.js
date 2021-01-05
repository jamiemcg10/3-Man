import { nameIsBlank, renderGamePage } from './gameEntryFuncs.js';
import { clearTable, displayDice, displayDoublesDice, showMessage} from './gamePlayFuncs.js';

let houseRules = '<details><summary>House Rules</summary>' +
                                        '<ul id="rules-list"><li>Roll a 7, the player ahead of/after you drinks</li>' + 
                                             '<li>Roll an 11, the player behind/before you drinks</li>' + 
                                             '<li>Roll a 3 on either die, the 3 man drinks</li>' + 
                                             '<li>Become the 3 man if you roll a 3 (1 + 2)</li>' + 
                                             '<li>Create a new rule if you make someone drink for 5 rolls in a row</li></ul>' + 
                                        '</details>';

$(document).ready(() => {
    // for testing
    // document.onmousemove = function(e){
    //     let x = e.pageX;
    //     let y = e.pageY;
    //     e.target.title = `x: ${x}, y: ${y}`;
    // };
    
    const socket = io({reconnection: false});
    let id = socket.id;
    let inWaitingRoom = false;
    let game;
    let code;
    let name;
    let loaded = false;

    // event listener for enter key - click start or join button
    $(document).on("keyup", function(event){
        if (event.key === "Enter"){
            if ($('#code').val() === ''){
                $('#start').trigger("click");
            } else {
                $('#join').trigger("click");
            }
        }
    });

    // event listener for start game button
    $('#start').click(() => {
        if (nameIsBlank()){
            return false;
        }

        id = socket.id;
        name = $('#name').val();  // set name
        socket.binary(false).emit('get code', socket.id);
    });

    // event listener for join game button
    $('#join').click(() => {
        if (nameIsBlank()){                        
            return false;
        }

        if ($('#code').val() === ""){ // no code entered
            $('.warning').remove();
            $('.flex-container').after('<div class="warning">Please enter a code</div>');
            return false;
        }
        
        id = socket.id;
        code = $('#code').val();
        game = String(code)[0];  // set game #
        name = $('#name').val(); // set name
        socket.binary(false).emit('validate code', {code: code, requestingID: id});


        socket.on(`validated code${code}`, function(code){
            if (code.valid & code.requestingID === id){ // code is valid and was entered by this person
                console.log('code is valid');
                if (!code.gameInProgress){ // game hasn't started
                    $('.flex-container').children().remove();
                    socket.binary(false).emit('add to waiting room', {code: code, gameID: game, id: id, name: name});
                    inWaitingRoom = true;
                    displayWaitingRoom(game, code.playersAlreadyInRoom);
                } else { // game has started
                    socket.binary(false).emit('new player', {name: name, id: socket.id, gameID: game});
                    renderGamePage(code.code, houseRules);
                    socket.binary(false).emit('get game data', {gameID: game});
                    socket.on(`game data sent${game}`, function(data){
                        if (loaded === false){
                            loaded = true;
                            if (data.gameData.__lastRoll.roll.length > 0){ // the game has started
                                displayDice(data.gameData.__lastRoll.roll,[data.gameData.__lastRoll.topPositions,data.gameData.__lastRoll.leftPositions],data.gameData.__lastRoll.rotations);
                            } else { // the game hasn't started - display the default dice
                                displayDice([6,6],[[0.25,0.75],[0.9,0.1]],[0.5,0.5]);
                            }

                            playGame(game, data, true); // start playing the game
                        }
                    });
                    
                }
            }
            else if (code.requestingID === id) { // person requested, but code is invalid
                $('.warning').remove();
                $('.flex-container').after('<div class="warning">The code you entered is invalid</div>')

            }

        });
    });

    socket.on('new game code', function(data){
        if (data.id === id){
            code = data.code;
            if (code === -1){ // no code available
                $('.warning').remove();
                $('.flex-container').after('<div class="warning">Sorry, all rooms are currently full</div>');

            } else {                            
                $('.flex-container').children().remove(); // remove form
                game = String(code)[0];

                // enter waiting room here 
                socket.binary(false).emit('add to waiting room', {code: data.code, gameID: game, id: id, name: name});
                inWaitingRoom = true;

                displayWaitingRoom(game);
            }

        }
        
    });



    function displayWaitingRoom(roomNo, playersInRoom){
        console.log('in displayRoom(roomNo)');
        $('.flex-container').append(`<div class="code">${code}</div>`);
        $('.flex-container').append('<div class="player-pool"></div>');
        $('.flex-container').append('<button id="play">Play!</button>');
        $('#play').css("width", "initial");
        if (playersInRoom){
            playersInRoom.forEach((player) => {
                $('.player-pool').append(`<div class="player-container" id="${player.__id}-container"><div class="player" id="${player.__id}">${player.__name}</div><div class="dice-box" id="${player.__id}-box"></div></div>`);

            });

        }

        $('body').append(houseRules);  


        // event listener for play button click
        $('#play').click(() => {
            // transition to main page
            socket.binary(false).emit('start game', {gameID: game});

        });

        // leave the game on disconnect
        $(window).on('unload', (event) => {
            socket.binary(false).emit('remove player', {gameID: roomNo, id: socket.id, code: code, removeID: 1});
            socket.close();
        });

        socket.on(`go to game page${game}`, (gameData)=>{
            inWaitingRoom = false;
            renderGamePage(code, houseRules);
            displayDice([6,6],[[0.25,0.75],[0.9,0.1]],[0.5,0.5]);  // display default dice
            playGame(game, gameData, false);  // start playing game

        });

        socket.on(`add to waiting room${game}`, function(player) {
            $('.player-pool').append(`<div class="player-container" id="${player.id}-container"><div class="player" id="${player.id}">${player.name}</div><div class="dice-box" id="${player.id}-box"></div></div>`);
        });

        socket.on(`remove player${game}`, function(data) {
            console.log("remove from waiting room");
            $(`#${data.id}-container`).remove();
            
            if (typeof players !== 'undefined'){
                // remove from player pool if in game
                players.removePlayer(data.id);
            }
        });


    }

    // handles game play once on game page
    function playGame(game, gameData, joiningLate){
        // hide buttons
        $('#roll-btn').hide();
        $('#doubles-roll-btn').hide();

        let currentGame = new Game(gameData.gameData);
        let players = PlayerPool.PlayerPool(currentGame);
        let cont = 0;
        let targets = [];
        let ids = [];
        let doublesRollNum = 0;
        let hasJoinedLate;
        let drinkIndicator;
        let makingRule = false;

        function diceDrop(event, ui){
            targets.push(`#${event.target.id}`);
            ids.push(`#${ui.draggable[0].id}`);

            $(`#${event.target.id}`).append($(`#${ui.draggable[0].id}`));  

            $(`#${ui.draggable[0].id}`).css('position', '');
            $(`#${ui.draggable[0].id}`).css('left', '');
            $(`#${ui.draggable[0].id}`).css('top', '');
            

            if ($('#table').children().length === 0){ // table is empty
                socket.binary(false).emit('dice distributed', {gameID: game, locs: targets, dice: ids});
                targets = [];
                ids = [];
                
            }
        }


        // create a name label and dice box for each player
        players.list.forEach((player) => {
            $('.player-pool').append(`<div class="player-container" id="${player.__id}-container"><div class="player" id="${player.__id}">${player.__name}</div><div class="dice-box" id="${player.__id}-box"></div></div>`);
            $('.dice-box').droppable({
                drop: diceDrop
            });

            // highlight current player
            if (player.__id === players.currentPlayer.id){
                $(`#${player.__id}`).css('background-color', '#ffff66');
            }
        });

        // add 3 man hat
        $(`#${players.threeMan.id}`).append('<img class="hat" src="/assets/PinClipart.com_jester-clipart_195101.png">');


        // make / roll dice
        let dice = new Dice(2,6);
        let roll;
        let doubles = false;
        
        showMessage('clear');

        if (joiningLate){  // from playGame parameter
            hasJoinedLate = true;
        } 

        if (hasJoinedLate){  // from local playGame variable
            socket.binary(false).emit('three man the hard way', {gameID: game});
            hasJoinedLate = false;
        }

        // event listener for roll button click
        $('#roll-btn').click(() => {
            roll = dice.roll();
            socket.binary(false).emit('roll', {roll: roll, gameID: game});
        
        });

        // event listener for doubles roll button
        $('#doubles-roll-btn').click(() => {
            $('#doubles-roll-btn').hide();
            let doublesDice = new Dice($(`#${socket.id}-box`).children().length,6);
            let ids = [];
            let box = $(`#${socket.id}-box`).children();
            
            for (let i = 0; i<box.length; i++){ // loop through dice in box
                ids.push(box[i].id);
            }

            let roll = doublesDice.roll();
            
            socket.binary(false).emit('doubles roll', {roll: roll, gameID: game, name: [name], ids: ids});

        });
        
        
        // event listener for add-rule button click - bound to document because it is not on page yet
        $(document).on('click', '#add-rule', function(){
            let newRule = $('#new-blank-rule').val();
            if (newRule === ''){  // highlight box if rule is blank
                $('#new-blank-rule').css("outline", "auto");
                $('#new-blank-rule').css("outline-color", "red");

                setTimeout(function(){
                    $('#new-blank-rule').css("outline", "initial");
                }, 250);
            } else {
                $('#new-item').remove();
                socket.binary(false).emit('new rule', {gameID: game, ruleText: newRule});  // signal that there is a new rule

                if (doubles === false){ // not doubles - show roll button
                    $('#roll-btn').show();
                } 

                makingRule = false;  // rule has been made
                if (doubles === true){  // allow dice to be dragged if is a doubles roll
                    $('.die').draggable("option", "disabled", false);
                }
            }
        });

        $(window).on('beforeunload', (event) => {
            socket.binary(false).emit('remove player', {gameID: game, id: socket.id, code: code, removeID: 2});
            socket.close();
        });


        $(document).on('mousedown', 'img', function(){
            // remove labels from die when drag starts
            $('.die-label').remove();
        });

        socket.on(`new rule${game}`, function(rule){
            // add new rule to rules list and show message
            $('#rules-list').append(`<li class='player-created'>${rule.rule}</li>`);
            showMessage('add', `New rule: ${rule.rule}<br/>`);
        });

        socket.on(`new player${game}`, function(player){
            // add new player to game
                players.addPlayer(new Player(player.name, player.id));
                $('.player-pool').append(`<div class="player-container" id="${player.id}-container"><div class="player" id="${player.id}">${player.name}</div><div class="dice-box" id="${player.id}-box"></div></div>`);
                $('.dice-box').droppable({
                    drop: diceDrop
                });
        });


        socket.on(`end of turn${game}`, function(){
            $(`.player`).css('background-color', 'white'); // make all player backgrounds white
            players.nextPlayer();
        });

        socket.on(`start turn${game}`, function(player){
            //cancel timeout if it exists
            if (drinkIndicator){
                window.clearTimeout(drinkIndicator);
            }

            // highlight current player
            $(`.player`).css('background-color', 'white'); // make all player backgrounds white again
            $(`#${player.__id}`).css('background-color', '#ffff66');  // make current player background yellow

            if (typeof player.player !== 'undefined'){
                $(`#${player.player.__id}`).css('background-color', '#ffff66'); // make current player background yellow
            }

            // reset number of rolls and number of doubles rolls
            cont = 0;
            doublesRollNum = 0;
            if (player.id === socket.id || (player.player !== undefined && player.player.__id === socket.id)){
                $('#roll-btn').show(); // show the roll button if it's this player's turn
            }
        });

        //someone rolled
        socket.on(`roll${game}`, function(roll){
            clearTable();
            displayDice(roll.roll, [roll.topPositions, roll.leftPositions], roll.rotations); 
            showMessage('clear');

            if (socket.id === players.currentPlayer.id){  // if player is the current player
                checkDice(roll.roll);

                if (cont === 0 & !doubles){  // didn't make anyone drink, didn't roll doubles
                    socket.binary(false).emit('turn complete', {gameID: game});
                } else if (cont % 5 === 0 & cont !== 0) { 
                    // made someone drink 5 times in a row - make a rule
                    $('#roll-btn').hide();  
                    socket.binary(false).emit('player making rule', {gameID: game, name: name});
                    makingRule=true;

                    // add box to enter new rule to page
                    $('details').attr('open', true);
                    $('#rules-list').append('<li id="new-item"><input type="text" id="new-blank-rule"><button id="add-rule">Add</button></li>');
                    
                    if (doubles === true){ // if rolled doubles, disable dice dragging
                        $('.die').draggable("option", "disabled", true);
                    }
                }
            }
        });

        socket.on(`player making rule${game}`, function(data){
            showMessage('add', `${data.name} makes a rule!<br/>`);
        });

        socket.on(`drink${game}`, function(data){
            // flash background color green
            $(`#${data.id}`).css('background-color', 'green');
            drinkIndicator = window.setTimeout(function() {
                let originalColor;
                if (data.id === players.currentPlayer.id){
                    originalColor = '#ffff66';
                } else {
                    originalColor = 'white';
                }
                $(`#${data.id}`).css('background-color', originalColor);
            }, 1500);
            
            showMessage('add', `${data.name} drinks!<br/>`);
        });

        socket.on(`new three man${game}`, function(data){
            // remove the hat from the current 3 man and add it to the new 3 man
            $('.hat').remove();
            $(`#${data.new3Man.__id}`).append('<img class="hat" src="/assets/PinClipart.com_jester-clipart_195101.png">');
            showMessage('clear'); 
            showMessage('add', `${data.new3Man.__name} is the new 3 Man!<br/>`);
        });


        socket.on(`doubles spiral ${game}`, function(){
            showMessage('add', 'Doubles!<br/>');
            incrementDoublesRollNum(); // increment doubles roll count            
            allowDiceDistribution();  // let rolling player distribute dice
        });

        socket.on(`look for dice${game}`, function(rtnData){  
            if (doublesRollNum === 0){  // player joined late and is looking for dice after doubles was rolled
                doublesRollNum = rtnData.doublesRollNum;
            }

            // display dice in boxes
            $('.die-label').remove();
            if (doublesRollNum % 2 === 1){ // if distributed by current player
                for (let i=0; i<rtnData.data.locs.length; i++){
                    
                    $(`${rtnData.data.locs[i]}`).append($(`#die${i+1}`)); 
                    $(`#die${i+1}`).css('position', '');
                    $(`#die${i+1}`).css('left', '');
                    $(`#die${i+1}`).css('top', '');
                }
            } 

            if ($(`#${socket.id}-box`).children().length > 0){ // there is at least one die in the current player's box
                $('#doubles-roll-btn').show(); 
            }

        });

        socket.on(`doubles die rolled${game}`, function(roll){
            displayDoublesDice(roll.roll, [roll.topPositions, roll.leftPositions], roll.rotations, roll.names, roll.ids);
        });  
        
        socket.on(`all doubles dice rolled ${game}`, function(roll){
            $('#doubles-roll-btn').hide();  // hide doubles roll button for everyone
            incrementDoublesRollNum(); // increase local game doublesRollNum
            showMessage('clear');

            if (roll.roll[0] === roll.roll[1]){  // change this if more dice can be used
                // both dice match          
                console.log("both dice match");
                if (doublesRollNum % 2 === 0){ // not dice return roll
                    // give dice back to current player
                    setTimeout(function(){
                        $(`#${players.currentPlayer.id}-box`).append($(`#die1`)); 
                        $(`#${players.currentPlayer.id}-box`).append($(`#die2`)); 
                        $(`#die1`).css('left');
                        $(`#die1`).css('top');
                        $(`#die1`).css('position','');
                        $(`#die2`).css('left','');
                        $(`#die2`).css('top','');
                        $(`#die2`).css('position','');
                        $('.die-label').remove();

                        if(players.currentPlayer.id === socket.id){
                            $('#doubles-roll-btn').show();
                        }
                    }, 1500);


                } else { 
                    // current player re-rolled in doubles spiral - let them give out dice again
                    allowDiceDistribution();
                }
                
            } else {  // done with doubles spiral
                showMessage('change', `Drink!`);
                if(players.currentPlayer.id === socket.id){ 
                    $('#roll-btn').show();
                    doubles = false;
                    doublesRollNum = 0;
                    socket.binary(false).emit('clear doubles roll num', {gameID: game});
                    return;
                }
            }

        });


        function incrementDoublesRollNum(){
            doublesRollNum++;
        }

        function allowDiceDistribution(){
            // set dice draggable to true let player drag copy of dice to boxes
            if (players.currentPlayer.id == socket.id){
                if (!makingRule){  // don't allow dice to be distributed if they need to make a new rile
                    $('.die').draggable("option", "disabled", false);
                }

                $('#roll-btn').hide();  

            }
            
        }

        function checkDice(roll) { 
            if (dice.rollTotal !== 7 & dice.rollTotal !== 11 & !roll.includes(3) & roll[0] !== roll[1]){
                cont = 0;
                $('#roll-btn').hide();
                return;
            }

            if (dice.rollTotal === 3){
                socket.binary(false).emit('three man the hard way', {gameID: game, id: socket.id});
                return;
            }

            if (dice.rollTotal === 7){
                socket.binary(false).emit('ahead', {gameID: game});
            }

            if (dice.rollTotal === 11){
                socket.binary(false).emit('behind', {gameID: game});
            }                        

            if (roll.includes(3)){
                socket.binary(false).emit('three man', {gameID: game});
            }

            // test for doubles - needs to change if more dice are allowed
            if (roll[0] === roll[1]){
                doubles=true;
                socket.binary(false).emit('doubles', {gameID: game}); 
                
            }
            
            cont += 1;
        };

    }


});


