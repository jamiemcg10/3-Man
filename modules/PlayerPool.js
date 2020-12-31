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

if (typeof module !== "undefined" && module.exports){
    module.exports = {
        Player: Player,
        PlayerPool: PlayerPool
    };
} 

