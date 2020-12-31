function generatePositions(numPositions){
    let topPositions = [];
    let leftPositions = [];
    let rotations = [];

    for (let i=0; i<numPositions; i++){
        topPositions.push(Math.random());
        leftPositions.push(Math.random());
        rotations.push(Math.random());
    }

    return [topPositions, leftPositions, rotations];
}

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