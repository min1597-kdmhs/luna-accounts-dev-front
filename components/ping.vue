<script setup lang='ts'>
const props = defineProps<{
    disabled: string
}>()
</script>
<template lang='pug'>
div.relative.flex.rounded-full
    div.absolute.inline-flex.h-full.w-full.rounded-full.bg-inherit.opacity-75(:class="{ 'animate-ping': props.disabled !== true && props.disabled !== 'true' }")
</template>