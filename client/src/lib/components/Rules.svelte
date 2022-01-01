<script lang="ts">
    import { store } from '$lib/store'
    import { tick } from 'svelte'

    const socket = $store.socket
    let rulesEl: HTMLDetailsElement
    let newRuleEl: HTMLInputElement
    let rules = ['Roll a 7, the player ahead of/after you drinks',
            'Roll an 11, the player behind/before you drinks',
            'Roll a 3 on either die, the 3 man drinks',
            'Become the 3 man if you roll a 3 (1 + 2)',
            'Create a new rule if you make someone drink for 5 rolls in a row']

    let newRuleText = ''

    $: isCurrentPlayer = $store.game?.players?.currentPlayer?.id == $store.id

    socket.on('player making rule', async ({ name })=> {
        // TODO: use name to update message
        $store.ruleBeingMade = true
        await tick()
        if (isCurrentPlayer) {
            rulesEl.open = true
            window.scrollTo(0,document.body.scrollHeight)
            console.log(newRuleEl)
            newRuleEl.focus()
        }
    })

    socket.on('new rule', ({ rule }) => {
        $store.ruleBeingMade = false
        console.log($store.ruleBeingMade)
        rules = [...rules, rule]
        rulesEl.open = true
        window.scrollTo(0,document.body.scrollHeight)
    })

    function submitNewRule(){
        socket.emit('new rule', { newRuleText })
        newRuleText = ''
    }
</script>

<details class="mt-5 ml-4 cursor-pointer" bind:this={rulesEl} on:toggle={() => { window.scrollTo(0,document.body.scrollHeight) }}>
    <summary>House Rules</summary>
    <ul class="mb-4 ml-8 list-disc text-sm cursor-default">
        {#each rules as rule}
            <li>{rule}</li>
        {/each}
        {#if $store.ruleBeingMade && isCurrentPlayer }
            <li>
                <input 
                    type="text" 
                    class="h-8 mt-2 p-2 w-80" 
                    bind:value="{newRuleText}"
                    bind:this={newRuleEl}
                />
                <button class="w-16 h-8 ml-4" on:click="{submitNewRule}">Add</button>
            </li>
        {/if}
    </ul>
</details>