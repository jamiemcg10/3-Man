<script lang="ts" context="module">
    export function load({page}) {
        console.log(page.query, page.query.has('invalidCode'))
        return {
            props: {
                warning: page.query.has('invalidCode') ? 'Sorry, that room isn\'t being used' : ''
            }
        }
    }
</script>

<script lang="ts">
    import { goto } from '$app/navigation'
    import { store } from '$lib/store'
    import axios from 'axios'
    
    let code: number
    let name: string
    export let warning: string

    function enterKeyListener(e: KeyboardEvent){
        if (e.key === "Enter" && name){
            if (!code){
                start()
            } else {
                join()
            }
        }
    }

    function start(){
        console.log(name)
        if (!name){
            warning = 'Please enter a name'
            return;
        }

        $store.name = name
        console.log($store)
        axios.get('http://localhost:5000/getNewCode')
            .then(r => {
                console.log(r.data)
                if (r.data.success) {
                    $store.validCode = true
                    goto(`room/${r.data.code}`)
                } else {
                    warning = 'Sorry, all rooms are currently full'
                }                         
            })
            .catch()
    }

    function join(){
        if (!name){       
            //set error message                 
            return false;
        }

        if (!code){
            warning = 'Please enter a code'
            return false
        }

        $store.name = name
        axios.get(`http://localhost:5000/checkCode/${code}`)
            .then(r => {
                if (r.data.valid) {
                    $store.validCode = true
                    goto(`room/${code}`)
                } else {
                    warning = 'The code you entered is invalid'
                }
            })
            .catch()
    }
</script>

<svelte:body on:keypress="{enterKeyListener}"/>

<div class="flex flex-col items-center justify-center m-auto">
   <div class="flex flex-col items-center justify-center justify-self-center">
        <input 
            type="text" 
            class="w-60 p-2 mb-5 placeholder-gray-600 tracking-wide focus:outline-white" 
            placeholder="Name"
            bind:value={name}
        >
        <input 
            type="number" 
            class="w-60 p-2 mb-16 placeholder-gray-600 tracking-wide focus:outline-white" 
            placeholder="Table code (if joining)"
            bind:value={code}
        >
        
        <button 
            class="w-60 mb-5 hover:text-yellow-300 hover:scale-110 active:scale-105"
            on:click={() => start()}
        >
            Start new game
        </button>
        <button 
            class="w-60 mb-12 hover:text-yellow-300 hover:scale-110 active:scale-105"
            on:click={() => join()}
        >
            Join existing game
        </button>

        {#if warning}
            <div class="text-yellow-300 mt-6 mb-12">{warning}</div>
        {/if}
    </div>
</div>