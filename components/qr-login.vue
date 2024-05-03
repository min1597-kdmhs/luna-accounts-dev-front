<script setup lang='ts'>
import axios from 'axios'
import QRCode from 'qrcode'

const { $appConfig, $QR, $router, $toast, $application, $sessionInitlization } = useNuxtApp()
const runtimeConfig = useRuntimeConfig()
let _websocket: WebSocket

onMounted(async () => {
    await $sessionInitlization()
    $QR.data.isActive = true
    _websocket = new WebSocket(`ws://${ new URL(runtimeConfig.public.apiEndpoint).host }`)
    _websocket.onopen = _event => {
        _websocket.onmessage = async _data => {
            const _decodedData = JSON.parse(_data.data)
            if(_decodedData.success == true) {
                const _keys = Object.keys(_decodedData.data)
                if(_keys.includes('client_id') == true) {
                    const _result = await axios.post(`${ runtimeConfig.public.apiEndpoint }/v0/credentials/signin`, { type: 'qr_login', client_id: _decodedData.data.client_id, application_id: $application.uuid }, { headers: { authorization: window.localStorage.getItem('session') } })
                    if(_result.status == 200) {
                        const _QR = await QRCode.toString(`${ new URL(window.location.href).origin }/qr-login?id=${ encodeURIComponent(_result.data.data.remote_id) }`, { type: 'svg', color: { dark: '#FFFFFF', light: '#000000' }, margin: 1 })
                        $QR.data.code = (_QR.split('<path')[0] + '<path' + _QR.split('<path')[2]).replace(' stroke="#FFFFFF"', '').replace('<svg ', '<svg class="stroke-black dark:stroke-white w-full h-full" ')
                        $QR.data.verificationCode = _result.data.data.verification_code
                        $QR.data.isLoading = false

                    } else throw { response: _result }
                } else if(_keys.includes('login') == true) {
                    $QR.close()
                    $toast.add('success', '로그인에 성공했어요.<br>요청을 계속해주세요!')
                    $router.push({ name: 'index-select-account' })
                }
            }
        }
    }
})
onBeforeUnmount(() => {
    _websocket.close()
})
</script>

<template lang='pug'>
div
    div.w-screen.h-screen.fixed.left-0.top-0.z-40(class='max-sm:block min-md:table bg-black/50')
        div(class='min-md:table-cell min-md:align-middle max-sm:w-full max-sm:h-auto max-sm:fixed max-sm:left-0 max-sm:bottom-0')
            div.z-40(class='min-md:flex min-md:mx-auto min-md:p-5 min-md:rounded-xl min-md:shadow-lg min-md:transition-all min-md:box-border min-md:bg-white min-md:relative min-md:max-w-[90vw] min-md:w-[30rem] min-md:dark:bg-zinc-900 max-sm:w-full max-sm:h-auto')
                div(class='max-sm:w-full max-sm:flex max-sm:p-5 max-sm:rounded-t-3xl max-sm:shadow-lg max-sm:transition-all max-sm:dark:bg-zinc-900 max-sm:bg-white min-md:block min-md:flex-grow')
                    div(class='max-sm:flex-grow min-md:w-full')
                        div.absolute.top-3.right-5
                            i.far.fa-times.cursor-pointer(@click='$QR.close()')
                        div.font-bold.text-lg.text-black(class='dark:text-white') QR 간편 로그인
                        div.text-sm.leading-5(class='my-2.5')
                            div
                                div.w-full.flex.justify-center
                                    div.w-48.h-48.bg-zinc-100.flex.justify-center.items-center.p-4.rounded-lg#qr-code(class='dark:bg-zinc-800')
                                        div.w-full.h-full.flex.justify-center.items-center(v-if="$QR.data.isLoading")
                                            loader.w-16.h-16
                                        div.w-full.h-full(v-else v-html="$QR.data.code")
                                div.w-full.flex.justify-center.my-5
                                    div.bg-zinc-100.p-3.rounded-md.flex.justify-between.items-center(class='dark:bg-zinc-800')
                                        h3.font-light.text-md.text-black(class='dark:text-white')
                                            | 인증 코드
                                            span.w-fit.px-2.py-1.bg-zinc-200.rounded-lg.mx-1(class='dark:bg-zinc-700' v-if='$QR.data.isLoading')
                                                loader.w-4.h-4(class='!inline-block')
                                            span.w-fit.px-2.py-1.bg-zinc-200.rounded-lg.mx-1(class='dark:bg-zinc-700' v-else) {{ $QR.data.verificationCode }}
                                            | 을 선택하세요.
                                div.w-full.text-center.mt-3
                                    h3.font-semibold.text-xl.text-black(class='dark:text-white') 간편 로그인

                                    h3.font-light.text-sm.text-black.whites(class='dark:text-white') QR코드 스캔 후 인증코드를 입력해 어디서나 간편하고 안전하게 로그인하세요.
</template>