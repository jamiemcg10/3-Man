
// generate the position and rotation of a specified number of dice
function generatePositions(numDice){
    let topPositions = [];
    let leftPositions = [];
    let rotations = [];

    for (let i=0; i<numDice; i++){
        topPositions.push(Math.random());
        leftPositions.push(Math.random());
        rotations.push(Math.random());
    }

    return [topPositions, leftPositions, rotations];
}

// generates a game code for an empty room - returns -1 if all rooms are in use
function generateCode(games){
    for (let i=1; i<games.length; i++){
        if (games[i] === undefined | games[i] === null){
            let code = Math.floor((i + Math.random()) * 1000);
            games[0].push(Number(code));
            return code;
        }

        return -1;
    }
}

if (typeof module !== "undefined" && module.exports){
    module.exports = {generatePositions: generatePositions,
                    generateCode: generateCode
                };
}