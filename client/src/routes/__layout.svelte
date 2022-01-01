<script lang="ts" context="module">
    import '../styles.css'
    import clsx from 'clsx'
    import { store } from '$lib/store'
</script>

<div class="h-full flex flex-col">
    <div class="{clsx('mb-10 pt-12 text-center', 
        $store.game?.inProgress ? 'text-[2.75rem]' : 'text-6xl'
    )}">3 Man!</div>
    
        <slot />
    
    <div class="w-full text-center bg-[#202b38]">
        <a class="text-sm text-blue-400 transform hover:text-yellow-300 active:text-blue-200" href="/contact" target="_blank" id="report-link">Report an Issue</a>
    </div>
</div>