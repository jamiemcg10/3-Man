<script lang="ts" context="module">
    export function load({page}) {
        const code = page.params.room
        return {
            props: {
                code
            }
        }
    }
</script>
<script lang="ts">
    // do mobile hover stuff
    
    // add concepts of current player and hat
    
    import { PlayerPool, Player } from '../../../../modules/PlayerPool'
    import { onMount } from 'svelte'
    import WaitingRoom from '$lib/components/WaitingRoom.svelte'
    import GameRoom from '$lib/components/GameRoom.svelte'
    import Rules from '$lib/components/Rules.svelte'
    import { store } from '$lib/store'
    import { Game } from '../../../../modules/Game';

    
    const socket = $store.socket
    const id = $store.id
    const name = $store.name

    export let code: string
    let gameID: string
    
    onMount(() => {
        gameID = code[0] 
        socket.emit('join', gameID)
        socket.emit('get game data', {gameID})
        socket.emit('new player', {name: name, id: id, gameID})
    })

    socket.on('ping', () => {
        console.log('pong')
    })

    $: console.log($store.game?.players, $store.game?.inProgress)

    socket.on(`game data sent`, function({ gameData }){
        console.log(gameData)
        let pp = new PlayerPool(gameData.people.players)
        let game = new Game(pp)

        $store = {
            ...$store, 
            code,
            gameID,
            game,
        }
    })
    
    socket.on(`remove player`, function(data) {
        console.log("remove player from waiting room/game")

        $store.game.players.removePlayer(data.name)
    });

    socket.on('add player', function(data) {
        console.log('add a player', data)
        $store.game.players.addPlayer(new Player(data.name, data.id))
        $store.game.players = $store.game.players
    })
</script>

<svelte:window on:unload={() => {
    socket.emit('remove player', {gameID: gameID, id: socket.id, code: code, removeID: 1});
    socket.close();
}}/>

{#if !$store.game?.inProgress}
    {#if $store.game?.players}    
        <WaitingRoom />
    {/if}
{:else}
    <GameRoom />
{/if}

<Rules />