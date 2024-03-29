export class PlayerPool {
    constructor(array_of_players = []){
        // create new array of players
        this.players = [];
        array_of_players.forEach((player) => {
            this.players.push(new Player(player.__name, player.__id));
        });

        this.stackHead = 0;
        this.threeMan = 0;
    }

    static PlayerPool(obj){
        let newPP = new PlayerPool(obj.players.people.players)
        newPP.head = obj.players.people.stackHead
        newPP.threeMan = obj.players.people.__threeMan
        return newPP
    }

    equals(testPP){
        if (testPP == null){
            return false
        } else if (this.players.length !== testPP.list.length){
            return false
        }
        for (let i=0; i<this.players.length; i++){
            if (this.players[i].__id !== testPP.list[i].__id){
                return false
            }
        }
        return true;
    }

    addPlayer(newPlayer){
        this.players = [...this.players, newPlayer]
    }

    updatePlayerName(id, name){
        let indexToUpdate = this.findPlayerById(id)
        this.players[indexToUpdate].name = name
    }

    removePlayer(idToRemove){
        this.players = this.players.filter(player => player.__id !== idToRemove)

        if (this.stackHead >= this.players.length){
            this.stackHead = 0;
        }

        if (this.__threeMan >= this.players.length){
            this.__threeMan = 0;
        }
    }

    findPlayerById(id){
        return this.players.findIndex((player) => player.id === id)
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

    set current3Man(new3Man){
        this.threeMan = new3Man;
    }

    get current3Man(){
        return this.players[this.threeMan];
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

export class Player {
    constructor(name, id){
        this.__name = name;
        this.__id = id;
    }

    get name(){
        return this.__name
    }

    get id(){
        return this.__id
    }

    set name(name) {
        this.__name = name
    }

}

if (typeof module !== "undefined" && module.exports){
    module.exports = {
        Player: Player,
        PlayerPool: PlayerPool
    };
} 