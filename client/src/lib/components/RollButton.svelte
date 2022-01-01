<script lang="ts">
import { store } from '$lib/store';

    import clsx from 'clsx'
    import { createEventDispatcher } from 'svelte'

    export let type: 'standard' | 'doubles' = 'standard'

    const dispatch = createEventDispatcher<{'roll': null}>()

</script>


    <div class={clsx('w-44 h-12 m-auto my-6 p-15 flex justify-center items-center text-xl font-bold tracking-wider border border-3 border-gray-500 rounded-lg cursor-pointer transform-gpu transition duration-200 hover:scale-110 active:scale-105', 
    {
        'bg-[#d6d600] text-gray-700': type === 'standard',
        'bg-purple-900 text-gray-100': type === 'doubles',
    },
    {
        'pointer-events-none bg-[#d6d600]/30': $store.ruleBeingMade && $store.game.players.currentPlayer.name === $store.name
    })}
    on:click={() => dispatch('roll')}>
        Roll
    </div>
