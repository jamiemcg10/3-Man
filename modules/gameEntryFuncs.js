export function nameIsBlank(){
    if ($('#name').val() === ""){                        
        $('.warning').remove();
        $('.flex-container').append('<div class="warning">Please enter a name</div>');
        return true;
    }

    return false;
}

export function renderGamePage(code, houseRules){
    $('body').children().remove();    
    $('body').append('<div id="report-issue"><a href="/contact" target="_blank" id="report-link">Report an Issue</a></div>');
    $('body').append(`<p id="room-code">Room code: ${code}</p>`);
    $('body').append('<h1 class="game-title">3 Man!</h1>');
    $('body').append('<div id="master-flex-container"></div>');
    $('#master-flex-container').append('<div class="flex-container"></div>');
    $('.flex-container').append('<div><h2>Players</h2><div class="player-pool" id="player-pool"></div></div>');
    $('.flex-container').append('<button id="roll-btn">Roll</button>');
    $('.flex-container').append('<button id="doubles-roll-btn">Roll</button>');
    $('.flex-container').append('<div id="message-box"></div>');
    $('.flex-container').append('<div id="table"></div>');

    $('body').append(houseRules);
    $('details').addClass('game-rules');  
    
    $('#report-issue').css('margin-bottom', '-9.5vh');
    $('#report-issue').css('float', 'right');


}
