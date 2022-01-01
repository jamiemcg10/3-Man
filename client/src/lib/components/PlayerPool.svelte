<script lang="ts">
    import Player from './Player.svelte'
    import { Player as Person } from '../../../../modules/PlayerPool'
    import { store } from '../store'

    const socket = $store.socket

    $: console.log($store.game.players.list)

    socket.on(`remove player`, function({ id }) {
        console.log("remove player from waiting room/game")

        $store.game.players.removePlayer(id)
        $store.game.players = $store.game.players
    });

    socket.on('add player', function({ name, id }) {
        console.log('add a player', name, id)
        console.log($store, $store.game)
        $store.game.players.addPlayer(new Person(name, id))
        $store.game.players = $store.game.players

        if ($store.game.inProgress) {
            $store.game.players.threeMan = $store.game.players.players.length - 1
            $store.game.players = $store.game.players
        }
    })

</script>

<div class="player-pool mt-2 min-h-[6rem] flex flex-wrap justify-center">
    {#each $store.game.players.list as player, i}
        <Player {player} id={i} />
    {/each}

</div>