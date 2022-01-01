<script lang="ts">
    import type { Player } from '../../../../modules/PlayerPool.js'
    import { store } from '../store'
    import clsx from 'clsx'

    export let player: Player
    export let id: number // it's important this is a number and not the Player id

    const socket = $store.socket


    socket.on('update player name', function({ name, id }) {
        $store.game.players.updatePlayerName(id, name)
        $store.game.players = $store.game.players
    })

</script>


<div class="px-6">
    <div class="{clsx('px-2 py-1 rounded-md border-gray-500 bg-gray-200 text-sm text-gray-800 tracking-wide whitespace-nowrap cursor-default transition duration-200',
    { 'border border-blue-300 border-2': player.name === $store.name})}"
    class:bg-yellow-200={id === $store.game.players.stackHead}
    class:bg-green-700={player.name === $store.drinking}
    >{player.name}
    {#if id === $store.game.players.threeMan}
        <img class="inline w-5" src="/jester-hat.png" alt="jester-hat">
    {/if}
    </div>
    <div class="dice-box h-8 mt-1 p-1 rounded-md flex w-full justify-center items-start border border-2 border-dashed border-gray-500 hover:border-yellow-300"
    class:invisible={true}></div>
</div>