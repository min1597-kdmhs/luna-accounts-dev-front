<script setup lang='ts'>
const props = defineProps<{
    option: string,
    value: string,
    placeholder: string,
    max: number,
    type: string
}>()
const data: {
    localvalue: Array<string | number | boolean>,
    localmax: number,
    display: boolean,
    options: Array<{
        name: string,
        description: string,
        options: Array<{ name: string, value: string | number | boolean }>
    }>,
    optioncount: number
} = reactive({
    localvalue: new Array(),
    localmax: 1,
    display: false,
    options: new Array(),
    optioncount: 0
})

const emit = defineEmits([ 'change' ])

function toggle () {
    data.display = !data.display
}
function select (_option: { name: string, value: string }) {
    const _localvalue = data.localvalue
    if(data.localvalue.indexOf(_option.value) == -1) {
        if((data.localmax ? data.localmax : 1) == 1) {
            data.localvalue[0] = _option.value
        } else {
            if(data.localvalue.length , data.localmax) {
                data.localvalue.push(_option.value)
            } else {
                data.localvalue.splice(0, 1)
                data.localvalue.push(_option.value)
                data.display = false
            }
        }
    } else {
        data.localvalue.splice(data.localvalue.indexOf(_option.value), 1)
    }
    if(data.localvalue.length == (data.localmax ? data.localmax : 1)) data.display = false
    emit('change', { before: _localvalue.join(','), after: data.localvalue.join(',') })
}
function osc (_event: Event) {
    if(window.innerWidth >= 768) {
        data.display = false
    } else {
        if(Array.from((_event.target as Element).classList).indexOf('w-screen') !== -1 && Array.from((_event.target as Element).classList).indexOf('h-screen') !== -1) data.display = false
    }
}
function getData (_type: string, _values: string): boolean | string {
    const _data = new Array()
    for(const _value of _values) {
        for(const _options of data.options) {
            for(const _option of _options.options) {
                if(_value == _option.value) {
                    switch (_type) {
                        case 'name':
                            _data.push(_option.name)
                            break
                        default: return false
                    }
                }
            }
        }
    }
    switch (_type) {
        case 'name': return _data.join(', ')
    }
    return false
}
onMounted(() => {
    let _count = 0
    for(const _options of JSON.parse(props.option)) {
        try {
            if(typeof _options.name !== 'string' || typeof _options.description !== 'string' || Array.isArray(_options.options) == false) throw 'Wrong option format.'
            for(const _option of _options.options) {
                if(typeof _option.name !== 'string' || [ 'string', 'number', 'boolean' ].indexOf(typeof _option.value) == -1) throw 'Wrong option format.'
                _count ++
            }
        } catch(err) {
            // Plugin.Toast.add(Plugin.Interface.ToastTypes.danger, 'An unknown error has occured.')
            return
        }
    }
    data.options = JSON.parse(props.option)

    data.optioncount = _count

    if(_count < (props.max ? props.max : 1)) data.localmax = _count
    else data.localmax = props.max

    if(typeof props.value == 'string' && props.value !== '') data.localvalue = props.value.split(',')
})

watch(() => props.value, () => {
    data.localvalue = typeof props.value == 'string' ? props.value.split(',') : []
})

watch(() => props.max, () => {
    if(data.optioncount < (props.max ? props.max : 1)) data.localmax = data.optioncount
    else data.localmax = props.max
})
</script>

<template lang='pug'>
div.relative(v-click-outside-element='osc')
    transition(name='modal')
        div.w-screen.h-screen.fixed.left-0.top-0.z-40(class='max-sm:block min-md:hidden bg-black/50' v-if='data.display' @click='osc')
            div.w-full.h-auto.fixed.left-0.bottom-0
                div.w-full.h-auto(class='min-md:flex')
                    div.transition-all.w-full.p-3.rounded-t-3xl.shadow-lg.bg-white(class='dark:bg-gray-800')
                        div.w-full.flex.flex-col.gap-2.max-h-60.overflow-y-auto.px-2.py-3
                            div.w-full(v-for='(items, index) of data.options')
                                div.w-full.px-1.flex.justify-between.items-center.gap-2.overflow-x-hidden
                                    div.flex.flex-grow.justify-start.items-end.gap-1.mb-1.min-w-0
                                        h3.text-sm.font-semibold.text-ellipsis.whitespace-nowrap(v-html='items.name')
                                        h3.flex-grow.text-xs.font-light.text-ellipsis.whitespace-nowrap.min-w-0.overflow-x-hidden(v-html='items.description')
                                    h3.text-xs.font-semibold.whitespace-nowrap(v-if='index == 0 && (data.localmax ? data.localmax : 1) !== 1') {{ data.localvalue.filter(function (_data) { return _data !== '' }).length }} / {{ (data.localmax ? data.localmax : 1) }}
                                div.w-full.flex.flex-col.gap-1
                                    div.transition-all.w-full.flex.justify-start.items-center.cursor-pointer.px-3.py-2.rounded-lg.flex.justify-between.items-center(class='hover:bg-gray-400/30 dark:hover:bg-black/30' v-for='item in items.options' :class="{ 'bg-gray-400/30 dark:bg-black/30': data.localvalue.indexOf(item.value) !== -1 }" @click="select(item)")
                                        h3.text-sm.flex-grow.text-ellipsis.overflow-x-hidden.whitespace-nowrap(v-html='item.name')
                                        div.w-6.flex.justify-center.items-center(v-if='data.localvalue.indexOf(item.value) !== -1')
                                            i.far.fa-check(v-if='!data.type')
                                            h3(v-else-if="data.type == 'order'") {{ data.localvalue.indexOf(item.value) + 1 }}
    div.block.w-full.bg-white.transition.border.border-gray-300.text-gray-900.text-sm.rounded-lg.shadow-sm.outline-none.cursor-pointer.text-ellipsis.overflow-x-hidden.whitespace-nowrap.pr-6(class="p-2.5 focus:ring-indigo-500 focus:border-indigo-500 focus:shadow-md disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:text-gray-400 disabled:cursor-not-allowed dark:bg-black dark:border-gray-700 dark:text-gray-400" @click='toggle()' v-html="data.localvalue.length !== 0 ? (getData('name', data.localvalue) ? getData('name', data.localvalue) : '&nbsp;') : (props.placeholder ? props.placeholder : '&nbsp;')" :class="{ '!border-indigo-500': data.display }")
    div.h-4.w-4.absolute.right-3.flex.justify-center.items-center.cursor-pointer(class='top-1/2 -translate-y-1/2' @click='toggle()')
        i.transition-all.far.fa-angle-down(:class="{ 'rotate-180': data.display }")
    div.w-full.absolute.rounded-lg.backdrop-blur.px-2.py-3.z-10(class='top-[105%] bg-white/50 dark:bg-gray-800/50 max-sm:hidden' v-if='data.display')
        div.w-full.flex.flex-col.gap-2.max-h-60.overflow-y-auto
            div.w-full(v-for='(items, index) of data.options')
                div.w-full.px-1.flex.justify-between.items-center.gap-2.overflow-x-hidden
                    div.flex.flex-grow.justify-start.items-end.gap-1.mb-1
                        h3.text-sm.font-semibold.text-ellipsis.whitespace-nowrap(v-html='items.name')
                        h3.flex-grow.text-xs.font-light.text-ellipsis.whitespace-nowrap.overflow-x-hidden(v-html='items.description')
                    h3.text-xs.font-semibold.whitespace-nowrap(v-if='index == 0 && (data.localmax ? data.localmax : 1) !== 1') {{ data.localvalue.filter(function (data) { return data !== '' }).length }} / {{ (data.localmax ? data.localmax : 1) }}
                div.w-full.flex.flex-col.gap-1
                    div.transition-all.w-full.flex.justify-start.items-center.cursor-pointer.px-3.py-2.rounded-lg.flex.justify-between.items-center(class='hover:bg-gray-400/30 dark:hover:bg-black/30' v-for='item in items.options' :class="{ 'bg-gray-400/30 dark:bg-black/30': data.localvalue.indexOf(item.value) !== -1 }" @click="select(item)")
                        h3.text-sm.flex-grow.text-ellipsis.overflow-x-hidden.whitespace-nowrap(v-html='item.name')
                        div.w-6.flex.justify-center.items-center(v-if='data.localvalue.indexOf(item.value) !== -1')
                            i.far.fa-check(v-if='!data.type')
                            h3(v-else-if="data.type == 'order'") {{ data.localvalue.indexOf(item.value) + 1 }}
</template>