<script lang="ts">
    import { store } from '$lib/store'
    import { onMount } from 'svelte'

    const socket = $store.socket
    let name: string
    let nameEl: HTMLInputElement
    let warning: string

    function updateName(){
        $store.name = name
        socket.emit('update name', { id: $store.id, name, gameID: $store.gameID })
    }

    onMount(() => {
        nameEl.focus()
    })
</script>

<!-- blur background -->
<div class="fixed top-0 z-[1] flex justify-center items-center w-full h-full bg-gray-700/50 "> 
    <div class="flex flex-col px-12 py-12 rounded-lg items-center justify-center justify-self-center bg-[#0e1318] bg-opacity-95 backdrop-blur-sm">
        <p class="-ml-5 mb-8 font-semibold self-start">Not so fast. What's your name?</p>
        <input 
            bind:this={nameEl}
             type="text" 
             class="w-60 p-2 mb-5 placeholder-gray-600 tracking-wide focus:outline-white" 
             placeholder="Name"
             bind:value={name}
         >
         <button 
             class="w-60 mb-5 hover:text-yellow-300 hover:scale-110 active:scale-105"
             on:click={updateName}
         >
             GO
         </button>
 
         {#if warning}
             <div class="text-yellow-300 mt-6 mb-12">{warning}</div>
         {/if}
     </div>
 </div>