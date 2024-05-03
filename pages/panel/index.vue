<script setup lang='ts'>
const { $userinfo, $errorConvert, $toast, $modal } = useNuxtApp()
function changeNickname () {
    $modal.add('form', '프로필 수정', '새롭게 바꿀 멋진 사용자 별칭을 입력해주세요!', [ { type: 'input', name: 'nickname', title: '새로운 사용자 별칭', placeholder: '새로운 사용자 별칭을 입력해주세요.' } ], false, undefined, { cancel: '취소', continue: '변경하기' })
}
function changePassword () {
    $modal.add('form', '비밀번호 변경', '사용자 안전을 위해 기존 비밀번호와 새로운 비밀번호를 모두 입력해주세요.', [ { type: 'input', name: 'password', title: '기존 비밀번호', placeholder: '기존 비밀번호를 입력해주세요.' }, { type: 'input', name: 'new_password', title: '새로운 비밀번호', placeholder: '새로운 비밀번호를 입력해주세요.' }, { type: 'input', name: 'new_password', title: '새로운 비밀번호 확인', placeholder: '새로운 비밀번호를 다시한번 입력해주세요.' } ], false, undefined, { cancel: '취소', continue: '변경하기' })
}
</script>
<template lang='pug'>
div.w-full.h-full
    div.w-full.my-2.mb-4
        h3.font-bold.text-2xl 루나 통합 계정
        h3.font-light.text-md.-mt-1 내 계정 정보를 확인하고 수정해요.
    div.w-full.grid.gap-3(class='max-sm:grid-cols-1 min-md:grid-cols-2')
        div.col-span-1.w-full
            label.w-fit.font-light.text-sm 사용자 이름
            div.w-full.flex.justify-end.flex-wrap
                h3.flex-grow.min-w-0.text-md.font-semibold.text-black.whitespace-nowrap.overflow-x-hidden.text-ellipsis(class='dark:text-white')
                    template(v-if='$userinfo.username !== null') {{ $userinfo.username }}
                    loader.w-4.h-4(v-else)
        div.col-span-1.w-full
            label.w-fit.font-regular.text-sm 이름
            div.w-full.flex.justify-between.flex-wrap
                div.min-w-0.flex-grow.flex.items-center.gap-1
                    div.w-10
                        h3.flex-grow.min-w-0.text-md.font-medium.text-black.whitespace-nowrap.overflow-x-hidden.text-ellipsis(class='dark:text-white')
                            template(v-if='$userinfo.profile !== null') {{ $userinfo.profile.last_name }}
                            loader.w-4.h-4(v-else)
                    div.flex-grow.min-w-0
                        h3.flex-grow.min-w-0.text-md.font-medium.text-black.whitespace-nowrap.overflow-x-hidden.text-ellipsis(class='dark:text-white')
                            template(v-if='$userinfo.profile !== null') {{ $userinfo.profile.first_name }}
                            loader.w-4.h-4(v-else)
                //- h3.text-md.font-medium.text-blue-400.cursor-pointer 개명신고
        div.col-span-1.w-full
            label.w-fit.font-light.text-sm 사용자 별칭
            div.w-full.flex.justify-end.flex-wrap
                h3.flex-grow.min-w-0.text-md.font-semibold.text-black.whitespace-nowrap.overflow-x-hidden.text-ellipsis(class='dark:text-white')
                    template(v-if='$userinfo.profile !== null') {{ $userinfo.profile.nickname }}
                    loader.w-4.h-4(v-else)
                //- h3.text-md.font-medium.text-blue-400.cursor-pointer(@click='changeNickname') 변경하기
        div.col-span-1.w-full
            label.w-fit.font-light.text-sm 생년월일
            div.w-full.flex.justify-end.flex-wrap
                h3.flex-grow.min-w-0.text-md.font-semibold.text-black.whitespace-nowrap.overflow-x-hidden.text-ellipsis(class='dark:text-white')
                    template(v-if='$userinfo.birthday !== null') {{ $userinfo.birthday }}
                    loader.w-4.h-4(v-else)
        div.col-span-1.w-full
            label.w-fit.font-light.text-sm 최근 비밀번호 변경일시
            div.w-full.flex.justify-end.flex-wrap
                h3.flex-grow.min-w-0.text-md.font-semibold.text-black.whitespace-nowrap.overflow-x-hidden.text-ellipsis(class='dark:text-white')
                    template(v-if='$userinfo.last_password_updated_at !== null') {{ new Date($userinfo.last_password_updated_at).toLocaleString() }}
                    loader.w-4.h-4(v-else)
                h3.text-md.font-medium.text-blue-400.cursor-pointer(@click='changePassword') 변경하기
        div.col-span-1.w-full
            label.w-fit.font-light.text-sm 최근 인증(로그인) 일시
            div.w-full.flex.justify-end.flex-wrap
                h3.flex-grow.min-w-0.text-md.font-semibold.text-black.whitespace-nowrap.overflow-x-hidden.text-ellipsis(class='dark:text-white')
                    template(v-if='$userinfo.last_authorized_at !== null') {{ new Date($userinfo.last_authorized_at).toLocaleString() }}
                    loader.w-4.h-4(v-else)
                h3.text-md.font-medium.text-blue-400.cursor-pointer 기록보기
        div.col-span-1.w-full
            label.w-fit.font-light.text-sm SNS 간편로그인 연동
            div.w-full.flex.justify-end.flex-wrap
                nuxt-link.text-md.font-medium.text-blue-400.cursor-pointer(:to="{ name: 'panel-sso' }") 바로가기
</template>