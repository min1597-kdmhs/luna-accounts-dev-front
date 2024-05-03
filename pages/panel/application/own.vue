<script setup lang='ts'>
import axios from 'axios';

const { $userinfo, $errorConvert, $modal, $toast, $appConfig } = useNuxtApp()
const runtimeConfig = useRuntimeConfig()

function createApp () {
    $modal.add('form', '신규 어플리케이션 생성', '루나 통합 계정을 통해 로그인 할 어플리케이션을 생성해요.', [ { type: 'file', title: '어플리케이션 로고 (최대 50mb)', name: 'image', placeholder: '어플리케이션 이미지를 업로드해주세요.' }, { type: 'input', title: '어플리케이션 이름', name: 'name', placeholder: '어플리케이션 이름을 입력해주세요.' }, { type: 'input', title: '어플리케이션 설명', name: 'description', placeholder: '어플리케이션 설명을 입력해주세요.' }, { type: 'input', title: '홈페이지 URL', name: 'homepage_uri', placeholder: '홈페이지 URL을 입력해주세요.' }, { type: 'input', title: '이용약관 URL', name: 'terms_uri', placeholder: '서비스 이용약관 URL을 입력해주세요.' }, { type: 'input', title: '개인정보처리방침 URL', name: 'privacy_uri', placeholder: '개인정보처리방침 URL을 입력해주세요.' } ], false, async (_data: { image: string, name: string, description: string, homepage_uri: string, terms_uri: string, privacy_uri: string }) => {
        const _result = await axios.put(`${ runtimeConfig.public.apiEndpoint }/portal/app`, _data, { headers: { authorization: `${ window.localStorage.getItem('access_token') }` } })
        if(_result.status == 200) {
            $userinfo.owned_apps = $userinfo.owned_apps ? [ ... $userinfo.owned_apps, { id: _result.data.data.id, image: _data.image, name: _data.name, permissions: [  ], redirect_uris: [  ], managers: [ { id: $userinfo.id as string, full_name: `${ $userinfo.profile?.first_name }${ `${ $userinfo.profile?.middle_name ? ' ' : '' }${ $userinfo.profile?.middle_name ?? '' } ${ $userinfo.profile?.last_name }` }` } ], secret_key: 'Please refresh to check.' } ] : [ { id: _result.data.data.id, image: _data.image, name: _data.name, permissions: [  ], redirect_uris: [  ], managers: [ { id: $userinfo.id as string, full_name: `${ $userinfo.profile?.first_name }${ `${ $userinfo.profile?.middle_name ? ' ' : '' }${ $userinfo.profile?.middle_name } ${ $userinfo.profile?.last_name }` }` } ], secret_key: 'Please refresh to check.' } ]
            $toast.add('success', '어플리케이션이 정상적으로 생성되었어요.<br>권한과 Redirect URI 등을 설정해주세요!')
        } else throw { response: _result }
    })
}
</script>
<template lang='pug'>
div.w-full.h-full
    div.w-full.my-2.mb-4
        h3.font-bold.text-2xl 루나 통합 계정
        h3.font-light.text-md.-mt-1 내가 소유한 어플리케이션을 관리해요.
    div.w-full.mt-2.grid.gap-2(class='max-sm:grid-cols-1 min-md:grid-cols-2')
        template(v-if='$userinfo.owned_apps !== null')
            template(v-if='$userinfo.owned_apps.length !== 0' v-for='ownedApp in $userinfo.owned_apps')
                nuxt-link.transition-all.w-full.flex.gap-2.items-center.group.py-3.px-4.border.border-zinc-200.bg-white.rounded-lg.cursor-pointer(class='dark:bg-zinc-950 dark:border-zinc-800 hover:border-indigo-500 hover:text-indigo-500' :to="{ name: 'panel-application-uuid', params: { uuid: ownedApp.id } }")
                    img.w-8.h-8(:src='ownedApp.image')
                    div.flex-grow.min-w-0
                        h3.font-semibold.text-md.whitespace-nowrap.overflow-x-hidden.text-ellipsis {{ ownedApp.name }}
                        h3.font-light.text-sm.whitespace-nowrap.overflow-x-hidden.text-ellipsis.-mt-1 {{ ownedApp.id }}
            div.w-full.col-span-2(v-else)
                h3.text-center.font-light.text-red-400.mb-3 소유한 어플리케이션이 없어요.
        template(v-else)
            loader.w-5.h-5
    h3.text-center.font-semibold.text-blue-400.cursor-pointer(@click='createApp()')
        i.far.fa-plus.mr-1
        | 어플리케이션 생성하기
    nuxt-link.text-xs.font-light.text-right(class='min-md:hidden' :to="{ name: 'panel-application-authorized' }")
        | 승인(인증)한 어플리케이션 관리하기
        i.fal.fa-chevron-right.text-2xs.ml-1
</template>