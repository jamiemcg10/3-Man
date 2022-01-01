<script lang="ts">
    import PlayerPool from '$lib/components/PlayerPool.svelte'
    import Die from '$lib/components/Die.svelte'
    import Table from './Table.svelte'
    import RollButton from './RollButton.svelte'
    import { store } from '../store'
    import { onDestroy } from 'svelte'

    const socket = $store.socket
    let message = ''
    let flashTimer: ReturnType<typeof setTimeout>

    onDestroy(() => {
        clearTimeout(flashTimer)
    })

    function flashColor(name: string){
        $store.drinking = name
        flashTimer = setTimeout(()=>{
            $store.drinking = ''
        }, 1000)
    }

    function rollDice(){
        socket.emit('roll', {gameID: $store.gameID})
    }

    socket.on('clear message board', () => {
        message = ''
    })

    socket.on('roll', (roll) => {
        console.log(roll)
        $store.game.lastRoll = roll
    })

    socket.on('drink', ({name}) => {
        flashColor(name)
        message += `${name} drinks!\n`
    })

    socket.on('new three man', ({ new3Man, name }) => {
        $store.game.players.threeMan = new3Man
        message += `${name} is the new 3 man!\n`
        console.log($store.game.players.currentPlayer.name, $store.name)
    })

    socket.on('switch to next player', () => {
        console.log('switching to next player')
        console.log($store.game.players.currentPlayer.name, $store.name)
        $store.game.endTurn()
        console.log($store.game.players.currentPlayer.name, $store.name)
    })

    socket.on('doubles spiral', () => {
        message += 'Doubles!\n'
    })

</script>

<p class="absolute top-3 left-3 text-yellow-300 font-bold">Room code: {$store.code}</p>
<div class="flex flex-col w-3/4 m-auto -mt-10">
    <div>
        <div class="text-2xl">Players</div>
        <PlayerPool />
    </div>
    <div class="min-h-[3rem]">
        {#if $store.game.players.currentPlayer.name === $store.name}
        <RollButton type={"standard"} on:roll={rollDice} />
    {/if}
    </div>
    <div class="min-h-[2rem] text-2xl font-bold text-center">{message}</div>
    <Table>
        <Die id={1} />
        <Die id={2} />
    </Table>
</div>