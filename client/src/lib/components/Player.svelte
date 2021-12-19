<script lang="ts">
    import type { Player } from '../../../../modules/PlayerPool.js'
    import { store } from '../store'

    export let player: Player
    export let id: number

</script>


<div class="px-6">
    <div class="p-2 rounded-md border-gray-500 bg-gray-200 text-gray-800 whitespace-nowrap cursor-default"
    class:bg-yellow-200={id === $store.game.players.stackHead}
    >{player.name}
    {#if id === $store.game.players.threeMan}
        <img class="inline w-6" src="/jester-hat.png" alt="jester-hat">
    {/if}
    </div>
    <div class="dice-box h-8 mt-1 p-1 rounded-md flex w-full justify-center items-start border border-2 border-dashed border-gray-500 hover:border-yellow-300"
    class:invisible={true}></div>
</div>