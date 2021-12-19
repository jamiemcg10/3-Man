<script lang="ts">
    import { store } from '$lib/store'
    export let id: number
    //export let value: number

    console.log($store.game.lastRoll)
    $: roll = $store.game.lastRoll
</script>

<div class="relative inline-block bg-white w-10 rounded-md border border-gray-500"
style="left: {roll.leftPositions[id-1]*100}%;
        top: {roll.topPositions[id-1]*100}%;
        transform: rotate({roll.rotations[id-1]}deg);">
    <img src="/{roll.roll[id-1]}.png" alt="die{id}">
</div>