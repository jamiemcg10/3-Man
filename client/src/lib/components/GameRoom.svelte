<script lang="ts">
    import PlayerPool from '$lib/components/PlayerPool.svelte'
    import Die from '$lib/components/Die.svelte'
    import Table from './Table.svelte'
    import RollButton from './RollButton.svelte'
    import { store } from '../store'

    const socket = $store.socket
    let message = ''
    let consecutiveRolls = 0

    $: if ($store.game.players.currentPlayer.id !== $store.id){
        consecutiveRolls = 0
    }

    socket.on('roll', (roll) => {
        console.log(roll)
        $store.game.lastRoll = roll
    })

    function rollDice(){
        consecutiveRolls += 1
        socket.emit('roll', {gameID: $store.gameID})
    }
</script>

<p class="absolute top-3 left-3 text-yellow-300 font-bold">Room code: {$store.code}</p>
<div class="flex flex-col w-3/4 m-auto -mt-10">
    <div>
        <h3>Players</h3>
        <PlayerPool />
    </div>
    {#if $store.game.players.currentPlayer.id === $store.id}
        <RollButton type={"standard"} on:roll={rollDice}/>
    {/if}
    <div>{message}</div>
    <Table>
        <Die id={1} />
        <Die id={2} />
    </Table>
</div>