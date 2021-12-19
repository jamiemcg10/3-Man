<script lang="ts">
        let rules = ['Roll a 7, the player ahead of/after you drinks',
                'Roll an 11, the player behind/before you drinks',
                'Roll a 3 on either die, the 3 man drinks',
                'Become the 3 man if you roll a 3 (1 + 2)',
                'Create a new rule if you make someone drink for 5 rolls in a row']

</script>

<details class="absolute top-[90vh] left-[5%]">
    <summary>House Rules</summary>
    <ul class="mb-8 ml-8 list-disc text-sm">
        {#each rules as rule}
            <li>{rule}</li>
        {/each}
    </ul>
</details>