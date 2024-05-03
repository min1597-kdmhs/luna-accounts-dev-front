<script setup lang='ts'>
const props = defineProps<{ color: 'green' | 'yellow' | 'red' | 'zinc' | 'blue' | 'indigo' }>()
</script>

<template lang='pug'>
button.transition-all.flex.justify-center.items-center.cursor-pointer.font-medium.rounded-lg.text-sm.px-5.text-center.relative.z-0(
    class="py-2.5 disabled:cursor-not-allowed"
    :class="{ 'text-green-800 bg-green-200 dark:bg-green-700 dark:text-green-300 dark:hover:bg-green-600 hover:bg-green-300 disabled:bg-green-100 disabled:text-green-400 dark:disabled:bg-green-500': color == 'green', 'text-yellow-800 bg-yellow-200 dark:bg-yellow-700 dark:text-yellow-300 dark:hover:bg-yellow-600 hover:bg-yellow-300 disabled:bg-yellow-100 disabled:text-yellow-400 dark:disabled:bg-yellow-500': color == 'yellow', 'text-red-800 bg-red-200 dark:bg-red-700 dark:text-red-300 dark:hover:bg-red-600 hover:bg-red-300 disabled:bg-red-100 disabled:text-red-400 dark:disabled:bg-red-500': color == 'red', 'text-zinc-800 bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600 hover:bg-zinc-300 disabled:bg-zinc-100 disabled:text-zinc-400 dark:disabled:bg-zinc-500': color == 'zinc', 'text-blue-800 bg-blue-200 dark:bg-blue-700 dark:text-blue-300 dark:hover:bg-blue-600 hover:bg-blue-300 disabled:bg-blue-100 disabled:text-blue-400 dark:disabled:bg-blue-500': color == 'blue', 'text-indigo-800 bg-indigo-200 dark:bg-indigo-700 dark:text-indigo-300 dark:hover:bg-indigo-600 hover:bg-indigo-300 disabled:bg-indigo-100 disabled:text-indigo-400 dark:disabled:bg-indigo-500': color == 'indigo' }"
    @click="$refs.button.setAttribute('loading','true');$refs.button.setAttribute('disabled','true')"
    ref='button'
)
    loader.transition-all.w-4.h-4.absolute.left-3.mr-1.opacity-0
    slot
</template>

<style>
button[loading='true'] {
    white-space: nowrap;
    padding-left: 2.5rem !important;
    --tw-bg-opacity: 0.7;
    --tw-text-opacity: 0.7;
    -moz-transition: padding-left .1s ease-in;
    -o-transition: padding-left .1s ease-in;
    -webkit-transition: padding-left .1s ease-in;
    transition: padding-left .1s ease-in;
}
button[loading='true'] > div, button[loading='true'] > svg {
    display: block !important;
    opacity: 1 !important;
}
</style>