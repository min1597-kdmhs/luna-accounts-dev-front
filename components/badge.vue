<script setup lang='ts'>
defineOptions({
    inheritAttrs: false
})
</script>

<template lang='pug'>
span.inline-flex.items-center.gap-1.rounded-md.text-xs.font-medium.border.border-slate-300(class='py-0.5 px-1.5 dark:border-slate-600')
    span.inline-block.rounded-full(class='w-1.5 h-1.5' v-bind='$attrs')
    slot
</template>