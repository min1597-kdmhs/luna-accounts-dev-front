<script setup lang='ts'>
import axios from 'axios';

const { $modal, $toast, $router, $errorConvert, $loadingView, $sessionInitlization } = useNuxtApp()
const runtimeConfig = useRuntimeConfig()
const $route = useRoute()

const credentials: { username: string, password: string } = reactive({
    username: '',
    password: ''
})

let resetPasswordToken: { token: string } = reactive({ token: '' })

const data: {
    status: number,
    type: 'username' | 'password' | null
} = reactive({
    status: 0,
    type: null
})
const certifications: {
    [ method in 'phone' | 'email' ]: {
        id: string,
        target: string,
        status: 'waiting' | 'pending' | 'success'
    }
} = reactive({
    phone: {
        id: '',
        target: '+82 ',
        status: 'waiting'
    },
    email: {
        id: '',
        target: '',
        status: 'waiting'
    }
})

function select (_type: 'username' | 'password') {
    if(data.status == 0) {
        data.status = 1
        data.type = _type
    } else {
        $toast.add('danger', '잘못된 접근입니다.')
    }
}

async function certification (_method: 'phone' | 'email') {
    try {
        const _result = await axios.put(`${ runtimeConfig.public.apiEndpoint }/v0/certification`, { type: _method, target: certifications[_method].target }, { headers: { authorization: window.localStorage.getItem('session') } })
        if(_result.status == 201) {
            if(_result.data.data.status == 'pending') {
                certifications[_method].status = 'pending'
                let _verificationCode: string = ''
                switch (_method) {
                    case 'email':
                        _verificationCode = await new Promise((resolve, reject) => {
                            $modal.add('form', '인증번호', '입력한 이메일 주소로 인증번호를 보냈어요.<br>제한시간 안에 인증번호를 입력해주세요.', [ { type: 'input', title: '인증번호', name: 'verificationCode', placeholder: '인증번호를 입력해주세요.' } ], true, (data: { verificationCode: string }) => { resolve(data.verificationCode) })
                        })
                        break
                    case 'phone':
                        _verificationCode = await new Promise((resolve, reject) => {
                            $modal.add('form', '인증번호', '입력한 전화번호로 인증번호를 보냈어요.<br>제한시간 안에 인증번호를 입력해주세요.', [ { type: 'input', title: '인증번호', name: 'verificationCode', placeholder: '인증번호를 입력해주세요.' } ], true, (data: { verificationCode: string }) => { resolve(data.verificationCode) })
                        })
                        break
                }
                if(!_verificationCode || _verificationCode.length !== 6) throw 'Invalid verification code.'

                const _verificationResult = await axios.post(`${ runtimeConfig.public.apiEndpoint }/v0/certification/${ _result.data.data.id }`, { code: _verificationCode }, { headers: { authorization: window.localStorage.getItem('session') } })
                if(_verificationResult.status == 200) {
                    certifications[_method].id = _result.data.data.id
                    certifications[_method].status = 'success'
                    $toast.add('success', `${ _method == 'email' ? '이메일 주소' : '전화번호' } 인증에 성공했어요.<br>요청을 계속해주세요.`)
                } else throw _verificationResult.data.error.description.en
            } else if(_result.data.data.status == 'successed') {
                certifications[_method].id = _result.data.data.id
                certifications[_method].status = 'success'
                $toast.add('success', `${ _method == 'email' ? '이메일 주소' : '전화번호' } 인증에 성공했어요.<br>요청을 계속해주세요.`)
            } else throw '인증 정보를 불러오는데 실패했어요.'
        } else throw { response: _result }
    } catch(_error) {
        document.querySelector(`#${ _method }-button`)?.removeAttribute('disabled')
        document.querySelector(`#${ _method }-button`)?.removeAttribute('loading')
        certifications[_method].status = 'waiting'
        $toast.add('danger', $errorConvert(_error))
    }
}

async function findUsername () {
    try {
        if(certifications.phone.status !== 'success' && certifications.email.status !== 'success') throw '전화번호 또는 이메일 주소 중 1가지 이상 인증해야해요.'
        const _result = await axios.post(`${ runtimeConfig.public.apiEndpoint }/v0/credentials/find-account`, { type: 'username', certifications: [ certifications.email.status == 'success' ? certifications.email.id : certifications.phone.id ] }, { headers: { authorization: window.localStorage.getItem('session') } })
        if(_result.status == 200) {
            $toast.add('success', `등록된 전화번호로 사용자 이름을 전송했어요.<br>문자를 확인하여 로그인해보세요!`)
            data.status = 0
            data.type = null
            certifications.email = { id: '', target: '', status: 'waiting' }
            certifications.phone = { id: '', target: '+82 ', status: 'waiting' }
        } else throw { response: _result }
    } catch(_error) {
        const button = document.querySelector(`#find-button`) as Element
        button.removeAttribute('disabled')
        button.removeAttribute('loading')
        $toast.add('danger', $errorConvert(_error))
    }
}

async function resetPassword () {
    try {
        if(credentials.username == '') throw '사용자 이름을 입력해주세요.'
        if(certifications.phone.status !== 'success') throw '전화번호 인증을 완료해주세요.'
        if(certifications.email.status !== 'success') throw '이메일 주소 인증을 완료해주세요.'
        const _result = await axios.post(`${ runtimeConfig.public.apiEndpoint }/v0/credentials/find-account`, { type: 'password', certifications: [ certifications.email.id, certifications.phone.id ], username: credentials.username }, { headers: { authorization: window.localStorage.getItem('session') } })
        if(_result.status == 200) {
            resetPasswordToken.token = _result.data.data.token
            $modal.add('form', '비밀번호 재설정', '새롭게 설정할 비밀번호를 입력해주세요!', [ { type: 'input', title: '신규 비밀번호', name: 'password', placeholder: '새로운 비밀번호를 입력하세요.' } ], false, async (_data: { password: string }) => {
                try {
                    const _result = await axios.post(`${ runtimeConfig.public.apiEndpoint }/v0/credentials/password`, { password: _data.password, token: resetPasswordToken.token }, { headers: { authorization: window.localStorage.getItem('session') } })
                    if(_result.status == 200) {
                        try {
                            const _loginResult = await axios.post(`${ runtimeConfig.public.apiEndpoint }/v0/credentials/signin`, { credentials: { username: credentials.username, password: credentials.password } }, { headers: { authorization: window.localStorage.getItem('session') } })
                        } catch(_error) {  }
                        $toast.add('success', '비밀번호가 변경되었어요.<br>다시 한번 로그인해볼까요?')
                        $router.push({ name: 'index-select-account' })
                    } else throw { response: _result }
                } catch(_error) {
                    const button = document.querySelector(`#find-button`) as Element
                    button.removeAttribute('disabled')
                    button.removeAttribute('loading')
                    $toast.add('danger', $errorConvert(_error))
                }
            })
        } else throw { response: _result }
    } catch(_error) {
        const button = document.querySelector(`#find-button`) as Element
        button.removeAttribute('disabled')
        button.removeAttribute('loading')
        $toast.add('danger', $errorConvert(_error))
    }
}

onMounted(async () => {
    $loadingView.status = true
    await $sessionInitlization()
    $loadingView.status = false
})
</script>

<template lang='pug'>
div.w-full.rounded-xl.bg-white.shadow-md.my-2(class='max-xs:px-3 max-xs:py-2 min-sm:px-4 min-sm:py-3 dark:bg-zinc-900')
    div.w-full
        div.w-full.my-2
            h3.font-bold.text-2xl 내 계정 찾기
            h3.font-light.text-md.-mt-1
                b.inline-block.font-medium {{ $application.name }}
                i.fas.fa-badge-check(class='mx-0.5' v-if="[ 'Verified', 'Family' ].indexOf($application.status) !== -1")
                i.fas.fa-exclamation-triangle(class='mx-0.5' v-if="[ 'Warned' ].indexOf($application.status) !== -1")
                | 에 로그인할 계정의 정보를 찾습니다.
        div.w-full.mt-5
            div.flex.flex-wrap.gap-2(v-if='data.status == 0')
                div.transition-all.cursor-pointer.w-full.border.rounded-xl.px-4.py-3.flex.justify-between.items-center.group(class='hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:border-zinc-700' @click="select('username')")
                    div.flex-grow.min-w-0
                        h3.font-semibold.text-lg
                            i.far.fa-address-card.mr-1
                            | 사용자 이름 찾기
                        h3.font-regular.text-sm 이메일 주소 또는 전화번호 인증
                    div
                        i.transition-all.far.fa-chevron-right.mr-1.ml-0(class='group-hover:mr-0 group-hover:ml-1')
                div.transition-all.cursor-pointer.w-full.border.rounded-xl.px-4.py-3.flex.justify-between.items-center.group(class='hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:border-zinc-700' @click="select('password')")
                    div.flex-grow.min-w-0
                        h3.font-semibold.text-lg 
                            i.far.fa-key.mr-1
                            | 비밀번호 재설정
                        h3.font-regular.text-sm 이메일 주소 및 전화번호 인증
                    div
                        i.transition-all.far.fa-chevron-right.mr-1.ml-0(class='group-hover:mr-0 group-hover:ml-1')
            div.w-full.flex.flex-wrap.gap-2(v-if="data.status == 1 && data.type == 'username'")
                div.w-full(v-if="certifications.email.status == 'waiting'")
                    label.w-fit.font-regular.text-sm.cursor-pointer(for='phone-number') 전화번호
                    div.w-full.flex.justify-between.items-center.gap-2
                        div.flex-grow.min-w-0
                            form-input#phone-number(type='text' placeholder='전화번호를 입력하세요.' :vMask="'+## 9'" :value='certifications.phone.target' v-model='certifications.phone.target' :disabled="certifications.phone.status !== 'waiting'")
                        div.transition-all.overflow-hidden.w-0.whitespace-nowrap(:class="{'!w-[5rem]': (certifications.phone.target.replace(/ /gi, '')).length > 5}" v-if="certifications.phone.status == 'waiting'")
                            form-button.w-full#phone-button(color='indigo' @click="certification('phone')") 인증
                        div.transition-all.overflow-hidden.w-0.whitespace-nowrap(class='w-[5rem]' v-if="certifications.phone.status == 'success'")
                            form-button.w-full(color='zinc' disabled='true') 인증완료
                div.w-full(v-if="certifications.phone.status == 'waiting'")
                    label.w-fit.font-regular.text-sm.cursor-pointer(for='email-address') 이메일 주소
                    div.w-full.flex.justify-between.items-center.gap-2
                        div.flex-grow.min-w-0
                            form-input#email-address(type='text' placeholder='이메일 주소를 입력하세요.' v-model='certifications.email.target' :disabled="certifications.email.status !== 'waiting'")
                        div.transition-all.overflow-hidden.w-0.whitespace-nowrap(:class="{'!w-[5rem]': (certifications.email.target.replace(/ /gi, '')).length > 1}" v-if="certifications.email.status == 'waiting'")
                            form-button.w-full#email-button(color='indigo' @click="certification('email')") 인증
                        div.transition-all.overflow-hidden.w-0.whitespace-nowrap(class='w-[5rem]' v-if="certifications.email.status == 'success'")
                            form-button.w-full(color='zinc' disabled='true') 인증완료

            div.w-full.flex.flex-wrap.gap-2(v-if="data.status == 1 && data.type == 'password'")
                div.w-full
                    label.w-fit.font-regular.text-sm.cursor-pointer(for='username') 사용자 이름
                    form-input#username(placeholder='사용자 이름을 입력해주세요.' type='text' v-model='credentials.username')
                div.w-full
                    label.w-fit.font-regular.text-sm.cursor-pointer(for='phone-number') 전화번호
                    div.w-full.flex.justify-between.items-center.gap-2
                        div.flex-grow.min-w-0
                            form-input#phone-number(type='text' placeholder='전화번호를 입력하세요.' :vMask="'+## 9'" :value='certifications.phone.target' v-model='certifications.phone.target' :disabled="certifications.phone.status !== 'waiting'")
                        div.transition-all.overflow-hidden.w-0.whitespace-nowrap(:class="{'!w-[5rem]': (certifications.phone.target.replace(/ /gi, '')).length > 5}" v-if="certifications.phone.status == 'waiting'")
                            form-button.w-full#phone-button(color='indigo' @click="certification('phone')") 인증
                        div.transition-all.overflow-hidden.w-0.whitespace-nowrap(class='w-[5rem]' v-if="certifications.phone.status == 'success'")
                            form-button.w-full(color='zinc' disabled='true') 인증완료
                div.w-full
                    label.w-fit.font-regular.text-sm.cursor-pointer(for='email-address') 이메일 주소
                    div.w-full.flex.justify-between.items-center.gap-2
                        div.flex-grow.min-w-0
                            form-input#email-address(type='text' placeholder='이메일 주소를 입력하세요.' v-model='certifications.email.target' :disabled="certifications.email.status !== 'waiting'")
                        div.transition-all.overflow-hidden.w-0.whitespace-nowrap(:class="{'!w-[5rem]': (certifications.email.target.replace(/ /gi, '')).length > 1}" v-if="certifications.email.status == 'waiting'")
                            form-button.w-full#email-button(color='indigo' @click="certification('email')") 인증
                        div.transition-all.overflow-hidden.w-0.whitespace-nowrap(class='w-[5rem]' v-if="certifications.email.status == 'success'")
                            form-button.w-full(color='zinc' disabled='true') 인증완료
            div.w-full.mt-3.flex.justify-between.items-center(v-if='data.status == 1')
                form-button(color='zinc' class='!w-fit' @click="data.status = 0") 돌아가기
                form-button#find-button(color='indigo' class='!w-fit' @click="data.type == 'username' ? findUsername() : resetPassword()") {{ data.type == 'username' ? '사용자 이름 찾기' : '비밀번호 재설정' }}
            div.w-full.mt-1.flex.justify-end.items-center.gap-2(v-if='data.status == 0')
                h3.font-regular.text-sm 계정을 찾으셨나요?
                nuxt-link.font-regular.text-sm.text-blue-400.cursor-pointer(:to="{ name: 'index', query: { ... $route.query, q: true } }") 로그인하기
</template>