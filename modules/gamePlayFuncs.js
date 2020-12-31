

export function clearTable(){
    // remove dice and labels from the table
    $('.die').remove();
    $('.die-label').remove();
}

export function displayDice(dice, dicePositions, diceRotations, diceText){
    // display dice on table
    let tableHeight = $('#table').height();
    let tableWidth = $('#table').width();
    let tableMiddle = tableWidth / 2;

    let leftBounds = [,0,tableMiddle]; // left bounds of dice

    let i = 1;
    dice.forEach((die) => {
        let dieWidthAdjustment = Math.sqrt(2*(((document.documentElement.clientWidth/100) * 5)*((document.documentElement.clientWidth/100) * 5)));   // to keep die on table - diagonal width of die
        let top = getRandomLoc(0, tableHeight - dieWidthAdjustment, dicePositions[0][i-1]);
        let left = getRandomLoc(leftBounds[i], tableMiddle - dieWidthAdjustment, dicePositions[1][i-1]);
        if (diceText){ // add text and die to table
            $('#table').append(`<p class="die-label" id="die-label${i}">${diceText[i-1]}</p><img src="./assets/${die}.png" class="die" id="die${i}">`);  
        } else {  // add just die to table
            $('#table').append(`<img src="./assets/${die}.png" class="die" id="die${i}">`);  
        }

        // adjust die position and label
        $(`#die${i}`).css('left', `${left}px`);
        $(`#die${i}`).css('top', `${top}px`);
        $(`#die${i}`).css('position', `absolute`);
        $(`#die${i}`).css('transform', `rotate(${getRandomLoc(0,90,diceRotations[i-1])}deg)`);
        $(`#die-label${i}`).css('left', `${left}px`);
        $(`#die-label${i}`).css('top', `${top+$(`#die-label${i}`).height()}px`);
        $(`#die-label${i}`).css('position', `absolute`);
        
        $('.die').draggable({
            revert: 'invalid',
            cursorAt: {top: 0, left: 0},
            disabled: true
        });
        
        i = i+1;
    });

}

export function displayDoublesDice(dice, dicePositions, diceRotations, diceText, ids){
    // display doubles dice
    let tableHeight = $('#table').height();
    let tableWidth = $('#table').width();
    let tableMiddle = tableWidth / 2;

    let leftBounds = [,0,tableMiddle];  // left bounds of die/dice
   
    for (let i = 0; i < dice.length; i++){ 
        let j = ($('#table').children().length/2);

        $(`#${ids[i]}`).remove(); // remove die and add new die
        $('#table').append(`<p class="die-label" id="die-label${j}">${diceText[i]}</p><img src="./assets/${dice[i]}.png" class="die" id="${ids[i]}">`);  
    
        
        let dieWidthAdjustment = Math.sqrt(2*(((document.documentElement.clientWidth/100) * 5)*((document.documentElement.clientWidth/100) * 5)));   // diagonal width of die
        let top = getRandomLoc(0, tableHeight - dieWidthAdjustment, dicePositions[0][i]);
        let left = getRandomLoc(leftBounds[j+1], tableMiddle - dieWidthAdjustment, dicePositions[1][i]);
    
        // place dice and labels on table
        $(`#${ids[i]}`).css('left', `${left}px`);
        $(`#${ids[i]}`).css('top', `${top}px`);
        $(`#${ids[i]}`).css('position', `absolute`);
        $(`#${ids[i]}`).css('transform', `rotate(${getRandomLoc(0,90,diceRotations[i])}deg)`);
        $(`#die-label${j}`).css('left', `${left}px`);
        $(`#die-label${j}`).css('top', `${top+dieWidthAdjustment}px`);
        $(`#die-label${j}`).css('position', `absolute`);

        $('.die').draggable({
            revert: 'invalid',
            cursorAt: {top: 0, left: 0},
            disabled: true
        });
    
    }
        
}

export function showMessage(action, message){
    if (action === 'change') {
        $('#message-box').text(message);
    } else if (action === 'add') {
        $('#message-box').append(message);
    } else if (action === 'clear') {
        $('#message-box').text(``);
    }
    
}

function getRandomLoc(leftOrTopBound, rangeSize, randNum){
    // returns random location for die
    let rand = randNum;
    rand = rand*rangeSize;
    return leftOrTopBound + rand;
}