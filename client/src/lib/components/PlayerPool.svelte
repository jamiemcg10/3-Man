<script lang="ts">
    import Player from './Player.svelte'
    import { store } from '../store'

    $: console.log($store.game.players)

</script>

<div class="player-pool mt-2 flex flex-wrap justify-center" style="min-height: 10rem;">
    {#each $store.game.players.list as player, i}
        <Player {player} id={i} />
    {/each}

</div>