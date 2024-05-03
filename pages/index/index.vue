<script setup lang='ts'>
import axios from 'axios'

const { $sessionInitlization, $router, $loadingView, $toast, $modal, $errorConvert, $permissions, $request } = useNuxtApp()
const runtimeConfig = useRuntimeConfig()
const $route = useRoute()
const credentials: { username: string, password: string } = {
    username: '',
    password: ''
}

function push (page: string) {
    $router.push({ name: page })
}

function sso (type: 'naver' | 'kakao' | 'facebook' | 'google') {
    if(type == 'naver') {
        window.location.href = `https://nid.naver.com/oauth2.0/authorize?${ new URLSearchParams({
            client_id: 'IYgSdZbFlw0xsHjIAlJX',
            response_type: 'code',
            redirect_uri: `${ new URL(window.location.href).origin }/callback`,
            state: window.btoa(JSON.stringify({ platform: type, query: 'login', request: $request, continue: $route.query.continue ? $route.query.continue : undefined }))
        }).toString() }`
    } else if(type == 'kakao') {
        window.location.href = `https://kauth.kakao.com/oauth/authorize?${ new URLSearchParams({
            client_id: '0ef6b42297bf227091b43c3553cb0829',
            response_type: 'code',
            prompt: 'login',
            redirect_uri: `${ new URL(window.location.href).origin }/callback`,
            state: window.btoa(JSON.stringify({ platform: type, query: 'login', request: $request, continue: $route.query.continue ? $route.query.continue : undefined }))
        }).toString() }`
    } else if(type == 'facebook') {
        window.location.href = `https://www.facebook.com/v13.0/dialog/oauth?${ new URLSearchParams({
            client_id: '1385945318806340',
            redirect_uri: `${ new URL(window.location.href).origin }/callback`,
            state: window.btoa(JSON.stringify({ platform: type, query: 'login', request: $request, continue: $route.query.continue ? $route.query.continue : undefined }))
        }).toString() }`
    } else if(type == 'google') {
        window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${ new URLSearchParams({
            client_id: '849446987422-1s88gnu3pkui1l43fc3va1b4tk4eiftu.apps.googleusercontent.com',
            response_type: 'code',
            scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/user.phonenumbers.read https://www.googleapis.com/auth/userinfo.profile',
            access_type: 'offline',
            prompt: 'consent',
            redirect_uri: `${ new URL(window.location.href).origin }/callback`,
            state: window.btoa(JSON.stringify({ platform: type, query: 'login', request: $request, continue: $route.query.continue ? $route.query.continue : undefined }))
        }).toString() }`
    }
}

async function login ($event: Event) {
    try {
        const _result = await axios.post(`${ runtimeConfig.public.apiEndpoint }/v0/credentials/signin`, { type: 'username_and_password', credentials: { username: credentials.username, password: credentials.password } }, { headers: { authorization: window.localStorage.getItem('session') } })
        if(_result.status == 200) {
            if(typeof $route.query.continue == 'string') {
                window.location.href = `${ new URL(window.location.href).origin }${ window.atob(decodeURIComponent($route.query.continue)) }`
            } else {
                $router.push({ name: 'index-select-account' })
            }
        } else throw { response: _result }
    } catch (_error) {
        try {
            document.querySelector('button#login')?.removeAttribute('loading')
            document.querySelector('button#login')?.removeAttribute('disabled')
            if(typeof _error == 'object') {
                const _result = (_error as any).response.data
                if(_result.error.description.en == 'Already logged in.') push('index-select-account')
                else throw _error
            } else throw _error
        } catch(_error) {
            $toast.add('danger', $errorConvert(_error))
        }
    }
}

onMounted(async () => {
    $loadingView.status = true
    await $sessionInitlization()
    try {
        const _result = await axios.get(`${ runtimeConfig.public.apiEndpoint }/v0/users`, { headers: { authorization: window.localStorage.getItem('session') } })
        if(_result.status == 200) {
            if(_result.data.data.length !== 0) {
                if(typeof $route.query.q == 'undefined') {
                    if(typeof $route.query.continue == 'string') {
                        window.location.href = `${ new URL(window.location.href).origin }${ decodeURIComponent($route.query.continue) }`
                    } else {
                        $router.push({ name: 'index-select-account' })
                    }
                }
            }
            $loadingView.status = false
            return
        } else throw { response: _result }
    } catch(_error) {
        try {
            $loadingView.status = false
            const _result = (_error as any).response.data
            if(typeof _error == 'object') {
                if(_result.error.description.en == 'Login is required.') return
                else throw _error
            } else throw _error
        } catch(_error) { $modal.add('alert', '요청을 처리하지 못했어요.', `오류가 발생하여 요청을 처리하지 못했어요.<br>자세한 내용은 아래를 확인해주세요.<br><div class='border rounded-lg p-3 mt-1'><b>${ $errorConvert(_error) }</b></div>`, undefined, true) }
    }
})
</script>

<template lang='pug'>
div.w-full.rounded-xl.bg-white.shadow-md.my-2(class='max-xs:px-3 max-xs:py-2 min-sm:px-5 min-sm:py-3 dark:bg-zinc-900')
    div.w-full
        div.w-full.my-2
            h3.font-bold.text-2xl 로그인
            h3.font-light.text-md.-mt-1.leading-8
                b.inline-block.font-medium {{ $application.name }}
                i.fas.fa-badge-check(class='mx-0.5' v-if="[ 'Verified', 'Family' ].indexOf($application.status) !== -1")
                i.fas.fa-exclamation-triangle(class='mx-0.5' v-if="[ 'Warned' ].indexOf($application.status) !== -1")
                | 에 루나 통합 계정을 이용하여 로그인해요.
        div.w-full.my-1
            label.w-fit.font-regular.text-sm.cursor-pointer(for='username') 사용자 이름 또는 이메일 주소
            form-input#username(placeholder='사용자 이름 또는 이메일 주소를 입력하세요.' v-model='credentials.username')
        div.w-full.my-1
            label.w-fit.font-regular.text-sm.cursor-pointer(for='password') 비밀번호
            form-input#password(placeholder='비밀번호를 입력해주세요.' type='password' v-model='credentials.password')
        div.w-full.my-1.flex.justify-end.items-center.gap-2
            h3.font-regular.text-sm 계정을 잊어버렸나요?
            nuxt-link.font-regular.text-sm.text-blue-400.cursor-pointer(:to="{ name: 'index-find-account' }") 내 계정 찾기
        div.w-full.my-1.flex.justify-end.items-center.gap-2
            h3.font-regular.text-sm 핸드폰으로 간편하게 로그인 하세요!
            nuxt-link.font-regular.text-sm.text-blue-400.cursor-pointer(@click='$QR.data.isActive = true') QR 로그인
        div.w-full.mt-3.flex.justify-between.items-center
            form-button(color='zinc' class='!w-fit' @click="push('index-register')") 회원가입
            form-button#login(color='indigo' class='!w-fit' @click='login') 로그인
        template
            div.w-full.flex.items-center.mt-3.mb-1.gap-1
                h3.font-semibold.text-sm.whitespace-nowrap SNS 로그인
                hr.w-full.border-dashed.border-zinc-900.flex-grow.min-w-0(class='dark:border-zinc-300')
            div.w-full.grid.grid-cols-2.gap-2
                form-button.col-span-1.text-white(class='bg-[#2DB400] hover:bg-[#219800] disabled:bg-[#138100]' @click="sso('naver')")
                    i.xi-naver.mr-1
                    | Naver
                form-button.col-span-1.text-black(class='bg-[#FEE500] hover:bg-[#E0BF00] disabled:bg-[#B29300]' @click="sso('kakao')")
                    i.xi-kakaotalk.mr-1
                    | Kakaotalk
                form-button.col-span-1.text-white(class='bg-[#4267B2] hover:bg-[#38569F] disabled:bg-[#1B3E7C]' @click="sso('facebook')")
                    i.xi-facebook.mr-1
                    | Facebook
                form-button.col-span-1.text-white(class='bg-[#DB4437] hover:bg-[#CA3927] disabled:bg-[#A92013]' @click="sso('google')")
                    i.xi-google.mr-1
                    | Google

</template>