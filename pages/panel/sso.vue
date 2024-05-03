a<script setup lang='ts'>
import axios from 'axios';

const { $userinfo, $errorConvert, $toast, $modal, $loadingView, $sessionInitlization } = useNuxtApp()
const runtimeConfig = useRuntimeConfig()
let linkedSSO: { linked: Array<{ platform: 'naver' | 'kakao' | 'facebook' | 'google', id: string, added_at: string }> } = reactive({ linked: [] })

function sso (type: 'naver' | 'kakao' | 'facebook' | 'google') {
    document.querySelector(`#${ type }`)?.removeAttribute('disabled')
    document.querySelector(`#${ type }`)?.removeAttribute('loading')
    if(linkedSSO.linked.filter(_sso => _sso.platform == type).length == 1) {
        $modal.add('form', '연결 해제', '간편 로그인 연결 정보를 삭제할까요?', [], false, async () => {
            const _result = await axios.delete(`${ runtimeConfig.public.apiEndpoint }/portal/sso/${ linkedSSO.linked.filter(_sso => _sso.platform == type)[0].id }`, { headers: { authorization: window.localStorage.getItem('access_token') } })
            if(_result.status == 200) {
                $toast.add('success', '정상적으로 간편 SNS 로그인 정보가 삭제되었습니다.')
                linkedSSO.linked = linkedSSO.linked.filter(_sso => _sso.platform !== type)
            } else throw { response: _result }

        }, { continue: '연결해제', cancel: '취소' })
    } else {
        if(type == 'naver') {
            window.location.href = `https://nid.naver.com/oauth2.0/authorize?${ new URLSearchParams({
                client_id: 'IYgSdZbFlw0xsHjIAlJX',
                response_type: 'code',
                redirect_uri: `${ new URL(window.location.href).origin }/callback`,
                state: window.btoa(JSON.stringify({ platform: type, query: 'link' }))
            }).toString() }`
        } else if(type == 'kakao') {
            window.location.href = `https://kauth.kakao.com/oauth/authorize?${ new URLSearchParams({
                client_id: '0ef6b42297bf227091b43c3553cb0829',
                response_type: 'code',
                prompt: 'login',
                redirect_uri: `${ new URL(window.location.href).origin }/callback`,
                state: window.btoa(JSON.stringify({ platform: type, query: 'link' }))
            }).toString() }`
        } else if(type == 'facebook') {
            window.location.href = `https://www.facebook.com/v13.0/dialog/oauth?${ new URLSearchParams({
                client_id: '1385945318806340',
                redirect_uri: `${ new URL(window.location.href).origin }/callback`,
                state: window.btoa(JSON.stringify({ platform: type, query: 'link' }))
            }).toString() }`
        } else if(type == 'google') {
            window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${ new URLSearchParams({
                client_id: '849446987422-1s88gnu3pkui1l43fc3va1b4tk4eiftu.apps.googleusercontent.com',
                response_type: 'code',
                scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/user.phonenumbers.read https://www.googleapis.com/auth/userinfo.profile',
                access_type: 'offline',
                prompt: 'consent',
                redirect_uri: `${ new URL(window.location.href).origin }/callback`,
                state: window.btoa(JSON.stringify({ platform: type, query: 'link' }))
            }).toString() }`
        }
    }
}

onMounted(async () => {
    $loadingView.status = true
    await $sessionInitlization()
    $loadingView.status = false

    try {
        const _result = await axios.get(`${ runtimeConfig.public.apiEndpoint }/portal/sso`, { headers: { authorization: window.localStorage.getItem('access_token') } })
        if(_result.status == 200) {
            linkedSSO.linked = _result.data.data.sso
        } else throw { response: _result }
    } catch(_error) {  }
})
</script>
<template lang='pug'>
div.w-full.h-full
    div.w-full.my-2.mb-4
        nuxt-link.cursor-pointer(:to="{ name: `panel` }")
            div.flex.justify-start.items-center.gap-2
                i.fas.fa-chevron-left
                h3.font-bold.text-2xl 루나 통합 계정
            h3.font-light.text-sm.-mt-1 간편 로그인 정보를 관리해요.
    div.w-full.grid.grid-cols-2.gap-2(class='max-sm:grid-cols-2 min-md:grid-cols-2')
        form-button.col-span-1.text-white#naver(class='bg-[#2DB400] hover:bg-[#219800] disabled:bg-[#138100]' @click="sso('naver')")
            i.xi-naver.mr-1
            | Naver
            b.ml-1(v-if="linkedSSO.linked.filter(_sso => _sso.platform == 'naver').length == 1") 연결해제
        form-button.col-span-1.text-black#kakao(class='bg-[#FEE500] hover:bg-[#E0BF00] disabled:bg-[#B29300]' @click="sso('kakao')")
            i.xi-kakaotalk.mr-1
            | Kakaotalk
            b.ml-1(v-if="linkedSSO.linked.filter(_sso => _sso.platform == 'kakao').length == 1") 연결해제
        form-button.col-span-1.text-white#facebook(class='bg-[#4267B2] hover:bg-[#38569F] disabled:bg-[#1B3E7C]' @click="sso('facebook')")
            i.xi-facebook.mr-1
            | Facebook
            b.ml-1(v-if="linkedSSO.linked.filter(_sso => _sso.platform == 'facebook').length == 1") 연결해제
        form-button.col-span-1.text-white#google(class='bg-[#DB4437] hover:bg-[#CA3927] disabled:bg-[#A92013]' @click="sso('google')")
            i.xi-google.mr-1
            | Google
            b.ml-1(v-if="linkedSSO.linked.filter(_sso => _sso.platform == 'google').length == 1") 연결해제
</template>