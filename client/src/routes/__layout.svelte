<script lang="ts" context="module">
    import '../styles.css'

</script>
<div class="h-full">
    <h1 class="mb-12 pt-12 text-center">3 Man!</h1>
    <slot />
    
    <div class="fixed bottom-0 left-1/2 transform -translate-x-1/2 text-sm text-blue-400 hover:text-yellow-300 hover:scale-105 active:scale-[103%]">
        <a href="/contact" target="_blank" id="report-link">Report an Issue</a>
    </div>
</div>