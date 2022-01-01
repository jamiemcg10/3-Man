<script lang="ts" context="module">

    export function load({page}) {
        const code = page.params.room
        const gameID = code[0] 

        return {
            props: {
                code,
                gameID
            }
        }
    }
</script>
<script lang="ts">
    // do mobile hover stuff
    
    import { PlayerPool, Player } from '../../../../modules/PlayerPool'
    import { onMount } from 'svelte'
    import WaitingRoom from '$lib/components/WaitingRoom.svelte'
    import GameRoom from '$lib/components/GameRoom.svelte'
    import Rules from '$lib/components/Rules.svelte'
    import NameForm from '$lib/components/NameForm.svelte'
    import { store } from '$lib/store'
    import { Game } from '../../../../modules/Game'
    import axios from 'axios'
    import { goto } from '$app/navigation'

    
    const socket = $store.socket
    const id = $store.socket.id
    const name = $store.name

    export let code: string
    export let gameID: string

    onMount(() => {
        
        if(!$store.validCode){
            axios.get(`http://localhost:5000/checkCode/${code}`)
                .then(r => {
                    if (!r.data.valid) {
                        goto('/?invalidCode=true')
                    }
                })
                .catch()
                } 
                
        $store.validCode = false
        
        $store.code = code
        $store.id = $store.socket.id
        $store.gameID = gameID
        socket.emit('join', gameID)
        socket.emit('get game data', {gameID, id})
    })

    socket.on('ping', () => {
        console.log('pong')
    })

    $: console.log($store.game?.players, $store.game?.inProgress)

    socket.on(`game data sent`, function({ gameData, requestingId }){
        console.log('--- BEGIN GAME DATA SENT ---')
        if (id === requestingId){
            console.log(gameData)
            let pp = new PlayerPool(gameData.people.players)
            let game = new Game(pp)

            if (gameData.inProgress){
                game.start()
            }

            $store = {
                ...$store, 
                code,
                gameID,
                game,
            }

            
        console.log({code}, {gameID}, {name}, {id})
        
        socket.emit('new player', {name, id, gameID})
        console.log('--- END GAME DATA SENT ---')
        }

    })
</script>

<div class="w-full m-auto mt-0">

    {#if !$store.name}
        <NameForm />
    {/if}
    {#if !$store.game?.inProgress}
        {#if $store.game?.players}    
        <div>
            <WaitingRoom />
        </div>
        {/if}
    {:else}
        <div>
            <GameRoom />
        </div>
    {/if}
    

</div>
<Rules />