<script setup lang='ts'>
const props = defineProps<{
    type: 'success' | 'warning' | 'danger' | 'info',
    force: boolean
}>()

const data = reactive({
    isActive: true
})

function closeAlert (alert: Element) {
    data.isActive = false
    setTimeout(function () {
        if(alert.parentElement?.parentElement?.outerHTML) alert.parentElement.parentElement.outerHTML = ''
    }, 500)
}
</script>

<template lang='pug'>
transition(name="alert")
    div.w-full.group.p-4.flex.items-center.gap-3.rounded-lg.relative(:class="{'bg-green-500': type == 'success','bg-yellow-500': type == 'warning','bg-red-500': type == 'danger','bg-blue-500': type == 'info'}" v-if="data.isActive")
        div.w-6.h-6.flex.justify-center.items-center.text-xl(:class="{'text-white':type=='success' || type=='danger' || type=='info','text-black':type=='warning'}")
            i.far(:class="{'fa-check-circle':type=='success','fa-exclamation-circle':type=='warning','fa-exclamation-triangle':type=='danger','fa-info-circle':type=='info'}")
        h3.font-medium.text-md.break-all(:class="{'text-white':type=='success'||type=='danger'||type=='info','text-black':type=='warning','mr-6': !force}")
            slot
        h3.absolute.right-5(:class="{'text-white':type=='success'||type=='danger'||type=='info','text-black':type=='warning'}" v-if="!force")
            i.far.fa-times.cursor-pointer(@click="closeAlert($event.target)")
</template>

<style>
.alert-leave-active {
    animation: alert-in .5s reverse;
}
@keyframes alert-in {
    0% {
        opacity: 0;
    }
    100% {
        opacity: 1;
    }
}
</style>