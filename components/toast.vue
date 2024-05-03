<script setup lang='ts'>
const { $toast } = useNuxtApp()
</script>

<template lang='pug'>
div.fixed.grid.grid-cols-1.gap-2.transition-all.overflow-y-auto.z-30#toast-area(class='bottom-2.5 left-[5vw] right-[5vw] max-h-[calc(100vh-1.25rem)] width-[90vw] md:left-auto md:right-5 md:width-min')
    transition-group(name='toast')
        div.w-full.transition-all.mx-auto.group.p-4.flex.items-center.gap-3.rounded-lg.cursor-pointer(class='md:w-96 md:max-w-[24rem]' :class="{'bg-green-500': toast.type == 'success', 'bg-yellow-500': toast.type == 'warning', 'bg-red-500': toast.type == 'danger', 'bg-blue-500': toast.type == 'info'}" :id='toast.srl' v-for='toast in $toast.toasts' :key='toast.srl' @click='$toast.toasts[toast.srl].isActive = false' v-show='toast.isActive' :data-disabled='toast.isActive ? false : true')
            h3.font-normal.text-md.break-all(:class="{'text-white': toast.type == 'success' || toast.type == 'danger' || toast.type == 'info', 'text-black': toast.type == 'warning'}" v-html='toast.message')
</template>

<style lang='css'>
.toast-enter-active {
    animation: toast-in .5s;
}
.toast-leave-active {
    animation: toast-in .5s reverse;
}
@keyframes toast-in {
    0% {
        opacity: 0;
        margin-bottom:-3.5rem;
    }
    100% {
        opacity: 1;
        margin-bottom:0;
    }
}
</style>