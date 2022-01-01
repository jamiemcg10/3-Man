<script lang="ts">
    import axios from 'axios'
    import clsx from 'clsx'

    let subject: string
    let message: string
    let status: string

    async function submit(){
        
        axios.post('http://localhost:5000/sendEmail', {subject, message})
        .then((response)=>{
            status = 'Your message was sent sucessfully'
        })
        .catch((_e)=>{
            status = 'There was a problem sending your message'
        })
    }
</script>
{#if status}
    <p class="p-5">{status}</p>
{:else}
    <div>
        <div class="w-11/12 m-auto my-4 text-4xl">Report an Issue</div>
        <form class="flex flex-col w-11/12 m-auto" action="" method="POST">
            <label for="subject" class="text-xl mb-1">Subject</label>
            <input type="text" name="subject" bind:value={subject} class="mb-4 p-2 focus:outline-white">

            <label for="message" class="text-xl mb-1">Message</label>
            <textarea name="message" bind:value={message} class="h-96 mb-10 p-2 focus:outline-white"></textarea>

            <button type="button" class={clsx("w-28 hover:text-yellow-300 hover:scale-110 active:scale-105", (!subject || !message) && 'pointer-events-none opacity-50')} on:click={submit}>Send</button>
        </form>
    </div>
{/if}
