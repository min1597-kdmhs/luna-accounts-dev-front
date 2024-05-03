<script setup lang='ts'>
import axios from 'axios'

const { $router, $sessionInitlization, $modal, $toast, $errorConvert, $loadingView, $JSON } = useNuxtApp()
const runtimeConfig = useRuntimeConfig()

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

const credentials: { username: string, password: string } = reactive({ username: '', password: '' })
const profile: {
    name: { firstName: string, middleName: string, lastName: string },
    nickname: string,
    birthday: string,
    gender: 'male' | 'female' | null
} = reactive({
    name: { firstName: '', middleName: '', lastName: '', },
    nickname: '',
    birthday: '',
    gender: null
})

function push (page: string) {
    $router.push({ name: page })
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

async function register () {
    try {
        if(credentials.username == '' || credentials.password == '') throw 'CustomizedError:사용자 이름 및 비밀번호를 입력해주세요.'
        if(profile.name.firstName == '' || profile.name.lastName == '') throw 'CustomizedError:이름을 모두 입력해주세요.'
        if(profile.nickname == '') throw 'CustomizedError:사용자 별명을 입력해주세요.'
        if(profile.birthday.length < 10) throw 'CustomizedError:생년월일을 입력해주세요.'
        if(new Date(profile.birthday).getTime() >= new Date().getTime()) throw 'CustomizedError:생년월일은 미래를 입력할 수 없습니다.'
        if(new Date(profile.birthday).getTime() <= new Date('1900-01-01').getTime()) throw 'CustomizedError:19세기 이전 출생자는 고객센터를 통해 인증해주세요.'
        if(profile.gender == null) throw 'CustomizedError:성별을 선택해주세요.'
        
        if(certifications.phone.status !== 'success') throw 'CustomizedError:전화번호 인증을 완료해주세요.'
        if(certifications.email.status !== 'success') throw 'CustomizedError:이메일 인증을 완료해주세요.'
        const _result = await axios.put(`${ runtimeConfig.public.apiEndpoint }/v0/credentials/register`, { credentials: { username: credentials.username, password: credentials.password }, certifications: [ certifications.email.id, certifications.phone.id ], profile: { first_name: profile.name.firstName, middle_name: profile.name.middleName, last_name: profile.name.lastName, nickname: profile.nickname, birthday: profile.birthday, gender: profile.gender } }, { headers: { authorization: window.localStorage.getItem('session') } })
        if(_result.status == 200) {
            try {
                const _loginResult = await axios.post(`${ runtimeConfig.public.apiEndpoint }/v0/credentials/signin`, { credentials: { username: credentials.username, password: credentials.password } }, { headers: { authorization: window.localStorage.getItem('session') } })
            } catch(_error) {}
            $toast.add('success', '회원가입에 성공했어요.<br>잠시후 계정 선택 화면으로 이동해요.')
            push('index')
        } else throw { response: _result }
    } catch(_error) {
        $toast.add('danger', $errorConvert(_error))
        document.querySelector('#register-button')?.removeAttribute('disabled')
        document.querySelector('#register-button')?.removeAttribute('loading')
    }
}
onMounted(async () => {
    $loadingView.status = true
    await $sessionInitlization()
    $loadingView.status = false
})
</script>

<template lang='pug'>
div.w-full.rounded-xl.bg-white.shadow-md.my-2(class='max-xs:px-3 max-xs:py-2 min-sm:px-5 min-sm:py-3 dark:bg-zinc-900')
    div.w-full
        div.w-full.my-2
            h3.font-bold.text-2xl 회원가입
            h3.font-light.text-md.-mt-1.leading-8
                b.inline-block.font-medium {{ $application.name }}
                i.fas.fa-badge-check(class='mx-0.5' v-if="[ 'Verified', 'Family' ].indexOf($application.status) !== -1")
                i.fas.fa-exclamation-triangle(class='mx-0.5' v-if="[ 'Warned' ].indexOf($application.status) !== -1")
                | 에 루나 통합 계정을 이용하여 로그인해요.
        div.w-full.grid.gap-3(class='max-sm:grid-cols-1 min-md:grid-cols-6')
            div.w-full.col-span-6
                div.w-full.my-1.grid.gap-3(class='max-sm:grid-cols-1 min-md:grid-cols-2')
                    div.w-full
                        label.w-fit.font-regular.text-sm.cursor-pointer(for='username') 사용자 이름
                        form-input#username(placeholder='사용자 이름을 입력해주세요.' v-model='credentials.username')
                    div.w-full
                        label.w-fit.font-regular.text-sm.cursor-pointer(for='password') 비밀번호
                        form-input#password(placeholder='비밀번호를 입력해주세요.' type='password' v-model='credentials.password')
                    div.w-full.flex.items-center.gap-1
                        div.w-20
                            label.w-fit.font-regular.text-sm.cursor-pointer(for='last-name') 성
                            form-input#last-name(type='text' placeholder='성' v-model='profile.name.lastName')
                        div.flex-grow.min-w-0
                            label.w-fit.font-regular.text-sm.cursor-pointer(for='first-name') 이름
                            form-input#first-name(type='text' placeholder='이름' v-model='profile.name.firstName')
                    div.w-full
                        label.w-fit.font-regular.text-sm.cursor-pointer(for='nickname') 사용자 별명
                        form-input#nickname(placeholder='사용자 별명을 입력해주세요.' type='text' v-model='profile.nickname')
                    div.w-full
                        label.w-fit.font-regular.text-sm.cursor-pointer(for='birthday') 생년월일
                        form-input#birthday(type='text' placeholder='YYYY-MM-DD' :vMask="'####-##-##'" v-model='profile.birthday')
                    div.w-full
                        label.w-fit.font-regular.text-sm.cursor-pointer 성별
                        select-input(@change='profile.gender = $event.after' :value='profile.gender' placeholder='성별을 선택해주세요.' :option=`$JSON.encode([
                            {
                                name: '',
                                description: '',
                                options: [
                                    { name: '<i class="far fa-mars mr-1"></i> 남성', value: 'male' },
                                    { name: '<i class="far fa-venus mr-1"></i> 여성', value: 'female' }
                                ]
                            }
                        ])`)
                    div.w-full
                        label.w-fit.font-regular.text-sm.cursor-pointer(for='phone-number') 전화번호
                        div.w-full.flex.justify-between.items-center.gap-2
                            div.flex-grow.min-w-0
                                form-input#phone-number(type='text' placeholder='전화번호를 입력하세요.' :vMask="'+## 9'" :value='certifications.phone.target' v-model='certifications.phone.target' :disabled="certifications.phone.status !== 'waiting'")
                            div.transition-all.overflow-hidden.w-0.whitespace-nowrap(:class="{'!w-[5rem]': (certifications.phone.target.replace(/ /gi, '')).length > 5}" v-if="[ 'waiting', 'pending' ].indexOf(certifications.phone.status) !== -1")
                                form-button.w-full#phone-button(color='indigo' @click="certification('phone')") 인증
                            div.transition-all.overflow-hidden.w-0.whitespace-nowrap(class='w-[5rem]' v-if="certifications.phone.status == 'success'")
                                form-button.w-full(color='zinc' disabled='true') 인증완료
                    div.w-full
                        label.w-fit.font-regular.text-sm.cursor-pointer(for='email-address') 이메일 주소
                        div.w-full.flex.justify-between.items-center.gap-2
                            div.flex-grow.min-w-0
                                form-input#email-address(type='text' placeholder='이메일 주소를 입력하세요.' v-model='certifications.email.target' :disabled="certifications.email.status !== 'waiting'")
                            div.transition-all.overflow-hidden.w-0.whitespace-nowrap(:class="{'!w-[5rem]': (certifications.email.target.replace(/ /gi, '')).length > 1}" v-if="[ 'waiting', 'pending' ].indexOf(certifications.email.status) !== -1")
                                form-button.w-full#email-button(color='indigo' @click="certification('email')") 인증
                            div.transition-all.overflow-hidden.w-0.whitespace-nowrap(class='w-[5rem]' v-if="certifications.email.status == 'success'")
                                form-button.w-full(color='zinc' disabled='true') 인증완료
        div.w-full.flex.justify-between.items-center.mt-3
            form-button(color='zinc' class='!w-fit' @click="push('index')") 뒤로가기
            form-button#register-button(color='indigo' class='!w-fit' @click='register') 가입하기
</template>