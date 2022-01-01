<script lang="ts">
    import PlayerPool from '$lib/components/PlayerPool.svelte'
    import { store } from '../store'

    const socket = $store.socket

    socket.on('go to game page', function(data) {
        console.log("going to game page");
        $store.game.inProgress = true 
            console.log($store.game)
    });
</script>


<div class="w-3/4 m-auto flex flex-col items-center">
    <div class="text-center text-yellow-300 font-black text-7xl">
        { $store.code }
    </div>

    <PlayerPool />
    
    <button 
        class="h-12 w-40 mt-20 mb-4 px-4 py-2 hover:text-yellow-300 hover:scale-110 active:scale-105" 
        on:click={() => socket.emit('start game', {gameID: $store.gameID})}>
            Play!
    </button>
</div>