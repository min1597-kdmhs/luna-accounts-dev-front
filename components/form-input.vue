<script setup lang='ts'>
import { vMaska } from 'maska'
defineOptions({
    inheritAttrs: false
})
const props = defineProps<{
    icon: string,
    vMask: string,
    id: string,
    value: string,
    money: string
}>()

const emit = defineEmits([
    'change'
])

const data: {
    localvalue: string,
    temporaryvalue: string,
    beforevalue: string | null,
    localmoney?: {
        decimal: string,
        thousands: string,
        prefix: string,
        suffix: string,
        precision: number,
        masked: boolean
    }
} = reactive({
    localvalue: '',
    temporaryvalue: '',
    beforevalue: null,
    localmoney: undefined
})

function change (_data?: string) {
    data.beforevalue = data.temporaryvalue
    if(typeof _data == 'string') data.localvalue = _data
    console.log({ before: data.beforevalue, after: data.localvalue })
    emit('change', { before: data.beforevalue, after: data.localvalue })
}

watch(() => props.value, function () {
    data.localvalue = props.value ? props.value : ''
})

watch(() => data.localvalue, function () {
    change()
    data.temporaryvalue = data.localvalue
})

onMounted(() => {
    if(typeof props.value == 'string' && props.value !== '') change(props.value)
    if(typeof props.money == 'string') data.localmoney = JSON.parse(props.money)
})
</script>

<template lang='pug'>
div.relative.z-0
    div.flex.absolute.inset-y-0.left-0.items-center.pl-3.pointer-events-none.text-gray-900(class='dark:text-gray-400' v-if="typeof icon == 'string'")
        i(:class='icon')
    input.block.w-full.bg-white.transition.border.border-gray-300.text-gray-900.text-sm.rounded-lg.shadow-sm.outline-none(
        class='p-2 focus:ring-indigo-500 focus:border-indigo-500 focus:shadow-md disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:text-gray-400 disabled:cursor-not-allowed dark:bg-black dark:border-gray-700 dark:text-gray-400'
        v-model='data.localvalue'
        :class="{ 'pl-8': typeof icon == 'string'}"
        v-bind='$attrs'
        v-maska
        :data-maska='vMask'
        data-maska-tokens='9:[0-9]:multiple'
        :id='id'
        v-money='data.localmoney'
    )
</template>