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
        // roll dice - set sum and return value of roll
        let roll = [];
        for (let i = 0; i < this.number_of_die; i++){
            roll.push((Math.floor((Math.random() * 100)) % this.sides) + 1);
        }
        this.sum = roll.reduce((total, num) => {
            return total += num;
        });
        
        return roll;
    }

}

if (typeof module !== "undefined" && module.exports){
    module.exports = Dice;
}
