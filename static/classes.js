class Player {
    constructor(name, id){
        this.__name = name;
        this.__id = id;
    }

    get name(){
        return this.__name;
    }

    get id(){
        return this.__id;
    }

}

class PlayerPool {
    constructor(array_of_players){
        // create new array of players
        this.players = [];
        array_of_players.forEach((player) => {
            this.players.push(new Player(player.__name, player.__id));
        });

        this.stackHead = 0;
        this.__threeMan = 0;
    }

    static PlayerPool(obj){
        // should really throw an error if an incompatible object is passed in
        console.log(obj);
        console.log(obj.players);
        //console.log(obj.players.people.players);
        let newPP = new PlayerPool(obj.players.people.players);
        newPP.head = obj.players.people.stackHead;
        newPP.threeMan = obj.players.people.__threeMan;
        return newPP;
    }

    equals(testPP){
        if (testPP == null){
            return false;
        } else if (this.players.length !== testPP.list.length){
            return false;
        }
        for (let i=0; i<this.players.length; i++){
            if (this.players[i].__id !== testPP.list[i].__id){
                return false;
            }
        }
        return true;
    }

    addPlayer(newPlayer){
        this.players.push(newPlayer);
    }

    removePlayer(removeThisId){
        console.log("removing " + removeThisId);
        let match = false;
        for (let i=0; i<this.players.length; i++){
            if (match){
                this.players[i-1] = this.players[i];
            }
            if (this.players[i].id === removeThisId){
                match = true;
                console.log("match");
            }
        }

        if (match){
            this.players.pop();
        }

        if (this.stackHead >= this.players.length){
            this.stackHead = 0;
        }

        if (this.__threeMan >= this.players.length){
            this.__threeMan = 0;
        }
    }

    get currentPlayer(){
        return this.players[this.stackHead];
    }

    set head(newHead){
        this.stackHead = newHead;
    }

    get head(){
        return this.stackHead;
    }

    set list(newList){
        this.players = newList;
    }

    get list(){
        return this.players;
    }

    set threeMan(newThreeMan){
        this.__threeMan = newThreeMan;
    }

    get threeMan(){
        return this.players[this.__threeMan];
    }
    
    get behind(){
        let index = this.stackHead - 1;
        if (index < 0){
            index = this.players.length-1;
        }

        return this.players[index];
    }

    get ahead(){
        let index = this.stackHead + 1;
        if (index >= this.players.length){
            index = 0;
        }

        return this.players[index];
    }

    get newest(){
        return this.players.length-1;
    }

    set newest(newest){

    }

    nextPlayer(){
        this.stackHead += 1;
        if (this.stackHead >= this.players.length){
            this.stackHead = 0;
        }
        this.currPlayer = this.players[this.stackHead];
    }

}


class Dice {
    constructor(dice, sides){
        this.number_of_die = dice;
        this.number_of_sides = sides;
        this.sum = 0;
    }

    get dice(){
        return this.number_of_die;
    }

    get sides(){
        return this.number_of_sides;
    }

    set dice(number_of_die){
        this.number_of_die = number_of_die;
    }

    set sides(number_of_sides){
        this.number_of_sides = number_of_sides;
    }

    get rollTotal(){
        return this.sum;
    }

    set rollTotal(roll){
        this.sum = roll;
    }

    roll(){
        let roll = [];
        for (let i = 0; i < this.number_of_die; i++){
            roll.push((Math.floor((Math.random() * 100)) % this.sides) + 1);
        }

        console.log(roll);
        this.sum = roll.reduce((total, num) => {
            return total += num;
        });
        
        console.log(this.sum);
        return roll;
    }

}

class Game {
    constructor (playerPool){
        this.people = playerPool;
        this.__doublesData = {
            roll: [],
            names: [],
            topPositions: [],
            leftPositions: [],
            rotations: [],
            __doublesRollNum: 0
        }
        this.__code;
        this.__inProgress = false;
        this.__lastRoll = {
            roll: [],
            topPositions: [],
            leftPositions: [],
            rotations: []
        }
        // can the dice live here?
        //this.__dice = new Dice(2,6);
    }

    set code(code) {
        this.__code = code;
    }

    get code(){
        return this.__code;
    }

    set players(players) {
        this.people = players;
    }

    get players(){
        return this.people;
    }

    set doublesData(data){
        this.__doublesData = data
    }

    get doublesRollNum(){
        return this.__doublesData.__doublesRollNum;
    }

    set doublesRollNum(num){
        this.__doublesData.__doublesRollNum = num;
    }

    get lastRoll(){
        return this.__lastRoll;
    }

    set lastRoll(roll){
        this.__lastRoll.roll = roll.roll;
        this.__lastRoll.topPositions = roll.topPositions;
        this.__lastRoll.leftPositions = roll.leftPositions;
        this.__lastRoll.rotations = roll.rotations;
    }

    get inProgress(){
        return this.__inProgress;
    }

    set inProgress(game){

    }

    pushDoublesDataRoll(roll){
        roll.forEach((die) => {
            this.__doublesData.roll.push(die);
        });
    }

    pushDoublesDataName(name){
        this.__doublesData.names.push(name);
    }

    pushDoublesDataTopPosition(position){
        this.__doublesData.topPositions.push(position);
    }

    pushDoublesDataLeftPosition(position){
        this.__doublesData.leftPositions.push(position);
    }

    pushDoublesDataRotation(rotation){
        this.__doublesData.rotations.push(rotation);
    }

    get doublesData(){
        return this.__doublesData;
    }

    clearDoublesData(){
        this.__doublesData.roll = [];
        this.__doublesData.names = [];
        this.__doublesData.topPositions = [];
        this.__doublesData.leftPositions = [];
        this.__doublesData.rotations = [];

    }

    start(){
        this.__inProgress = true;
    }
}


if (typeof module !== "undefined" && module.exports){
    module.exports = {
        Dice: Dice,
        Player: Player,
        PlayerPool: PlayerPool,
        Game: Game
    };
}