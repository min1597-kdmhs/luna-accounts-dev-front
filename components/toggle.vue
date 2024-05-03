<template lang='pug'>
label.relative.inline-flex.items-center.cursor-pointer
    input.sr-only.peer(type='checkbox' v-model='this.localvalue' @change='this.update')
    div.w-11.h-6.bg-gray-200.rounded-full.peer(class="dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600")
    span.ml-3.text-sm.font-medium.text-gray-900(class='dark:text-gray-300')
        slot
</template>
<script lang='ts'>
/* Module */
    export default {
        name: 'Toggle',
        data: function (): {
            localvalue: boolean
        } {
            return {
                localvalue: false
            }
        },
        methods: {
            update: function () {
                console.log(this.localvalue)
                this.$emit('_change', { before: !this.localvalue, after: this.localvalue })
            }
        }
    }
/* Module */
</script>