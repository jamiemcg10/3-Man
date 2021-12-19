export class Game {
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
        this.inProgress = false;
        this.__lastRoll = {
            roll: [6,6],
            topPositions: [.25,.75],
            leftPositions: [.9,.1],
            rotations: [45,135]
        }
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
        this.inProgress = true;
    }
}


if (typeof module !== "undefined" && module.exports){
    module.exports = Game;
} 

