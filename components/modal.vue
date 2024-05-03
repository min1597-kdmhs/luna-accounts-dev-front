<script setup lang='ts'>
const { $modal, $JSON } = useNuxtApp()

let data = reactive({})

function cancel (srl: number) {
    $modal.modals[srl].isActive = false
}
function confirm (srl: number) {
    const callback = $modal.modals[srl].callback
    if(typeof callback == 'function') {
        if(typeof $modal.modals[srl].forms == 'undefined') {
            callback()
        } else {
            let _data: any = {}
            for(const _form of $modal.modals[srl].forms ?? []) {
                _data[_form.name] = _form.value
            }
            callback(_data)
        }
    }
    cancel(srl)
}
function uploadFile (_event: Event) {
    const _inputElement = _event.target as HTMLInputElement
    const _srl = _inputElement.getAttribute('srl')
    if(typeof _srl !== 'string') return
    if((_event.target as HTMLInputElement).files == null) {
        return
    }
    const _render = new FileReader()
    _render.onload = (event) => {
        ($modal.modals[Number(_srl.split(':')[0])].forms ?? [])[Number(_srl.split(':')[1])].value = event.target?.result as string
    }
    _render.readAsDataURL(((_event.target as HTMLInputElement).files as FileList)[0])
}
</script>

<template lang='pug'>
div
    transition-group(name='modal')
        template(v-for='(modal, index) in $modal.modals')
            div.w-screen.h-screen.fixed.left-0.top-0.z-40(class='max-sm:block min-md:table bg-black/50' :key='modal.srl' :id='modal.srl' v-if='modal.isActive' :data-disabled='modal.isActive ? false : true')
                div(class='min-md:table-cell min-md:align-middle max-sm:w-full max-sm:h-auto max-sm:fixed max-sm:left-0 max-sm:bottom-0')
                    div.overflow-y-auto.flex.justify-center.items-center.h-full(class='max-sm:w-full max-sm:max-h-screen min-md:max-h-screen min-md:py-12')
                        div(class='min-md:flex min-md:mx-auto min-md:p-5 min-md:rounded-xl min-md:shadow-lg min-md:transition-all min-md:box-border min-md:bg-white min-md:relative min-md:max-w-[90vw] min-md:w-[30rem] min-md:dark:bg-gray-800 max-sm:w-full max-sm:h-auto')
                            div(class='max-sm:w-full max-sm:flex max-sm:p-5 max-sm:mt-32 max-sm:rounded-t-3xl max-sm:shadow-lg max-sm:transition-all max-sm:dark:bg-gray-800 max-sm:bg-white min-md:block min-md:flex-grow')
                                div(class='max-sm:flex-grow min-md:w-full')
                                    div.absolute.top-3.right-5(v-if='modal.isForced == false' class='max-sm:hidden')
                                        i.far.fa-times.cursor-pointer(@click='cancel(modal.srl)')
                                    div.font-bold.text-lg.text-black(class='dark:text-white' v-html='modal.title')
                                    div.w-full.my-3
                                        div.text-sm.leading-5(class='mb-1' v-html='modal.content')
                                        div.w-full.flex.flex-wrap.gap-2(class='mb-2.5')
                                            template(v-for='(input, _index) in modal.forms' v-if="modal.forms")
                                                div.w-full(:class="{ 'flex justify-between': input.type == 'toggle' }")
                                                    label.w-fit.font-regular.text-sm.cursor-pointer(:for='input.name') {{ input.title }}
                                                    form-input(v-if="input.type == 'input'" :id='input.name' :placeholder='input.placeholder' :value='$modal.modals[index].forms[_index].value' v-model='$modal.modals[index].forms[_index].value' :type="input.name.includes('password') ? 'password' : 'text'")
                                                    select-input(v-if="input.type == 'select'" :value='$modal.modals[index].forms[_index].value' @change="$modal.modals[index].forms[_index].value = $event.after" :placeholder='input.placeholder' :option=`$JSON.encode([
                                                        {
                                                            name: input.title,
                                                            description: '',
                                                            options: input.options
                                                        }
                                                    ])`)
                                                    toggle(v-if="input.type == 'toggle'" :value='$modal.modals[index].forms[_index].value' @_change="$modal.modals[index].forms[_index].value = $event.after" :placeholder='input.placeholder')
                                                    template(v-if="input.type == 'file'")
                                                        label.transition-all.w-full.h-32.flex.flex-col.items-center.justify-center.border-2.border-zinc-300.border-dashed.rounded-lg.cursor-pointer.bg-zinc-50(class='dark:hover:bg-bray-800 dark:bg-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:hover:border-zinc-500 dark:hover:bg-zinc-600' :for='input.name' v-if="typeof $modal.modals[index].forms[_index].value !== 'string'")
                                                            div.flex.flex-col.items-center.justify-center.pt-5.pb-6
                                                                svg.w-8.h-8.mb-4.text-gray-500(class='dark:text-gray-400' aria-hidden='true' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 16')
                                                                    path(stroke='currentColor' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2')
                                                                p.mb-2.text-sm.text-gray-500(class='dark:text-gray-400')
                                                                    span.font-semibold 클릭하여 업로드
                                                                    | 또는 끌어와 업로드
                                                                p.text-xs.text-gray-500(class='dark:text-gray-400') SVG, PNG, JPG(JPEG) 또는 GIF
                                                            input.hidden(type='file' :id='input.name' @change='uploadFile' accept='.png,.jpg,.jpeg' :srl='`${ index }:${ _index }`')
                                                        h3.font-semibold.text-sm.text-green-400(v-else) 업로드가 완료되었습니다.
                                    div.gap-3(class='max-sm:grid max-sm:grid-cols-2 min-md:flex' :class="modal.type == 'alert' || modal.isForced == true ? 'min-md:justify-end' : 'min-md:justify-end'")
                                        div(class='max-sm:w-full min-md:w-24' :class="modal.type == 'alert' ? 'max-sm:col-span-2' : 'max-sm:col-span-1'" v-if='modal.isForced !== true')
                                            form-button.w-full(color='zinc' @click='cancel(modal.srl)')
                                                h3.font-regular.text-sm.whitespace-nowrap {{ modal.buttonText?.cancel ? modal.buttonText.cancel : '닫기' }}
                                        div(class='max-sm:w-full min-md:w-24' v-if="modal.type == 'form'" :class="modal.isForced == true ? 'max-sm:col-span-2' : 'max-sm:col-span-1'")
                                            form-button.w-full(color='indigo' @click='confirm(modal.srl)')
                                                h3.font-regular.text-sm.whitespace-nowrap {{ modal.buttonText?.continue ? modal.buttonText.continue : '제출' }}
</template>

<style lang='css'>

    @keyframes modal-desktop-in {
        0% {
            opacity: 0;
            transform: scale(1.3);
        }
        100% {
            opacity: 1;
            transform: scale(1);
        }
    }
    @keyframes modal-mobile-in {
        0% {
            opacity: 0;
        }
        100% {
            opacity: 1;
        }
    }
    @keyframes modal-mobile-margin-bottom-in {
        0% {
            margin-bottom: -100vh;
        }
        100% {
            margin-bottom: 0px;
        }
    }
    @media (min-width: 768px) {
        .modal-enter-active {
            animation: modal-desktop-in .5s;
        }
        .modal-leave-active {
            animation: modal-desktop-in .5s reverse;
        }
    }
    @media (max-width: 767px) {
        .modal-enter-active {
            animation: modal-mobile-in .5s;
        }
        .modal-leave-active {
            animation: modal-mobile-in .5s reverse;
        }
        .modal-enter-active > div > div {
            animation: modal-mobile-margin-bottom-in .5s;
        }
        .modal-leave-active > div > div {
            animation: modal-mobile-margin-bottom-in .5s reverse;
        }
    }
</style>