<script setup lang='ts'>
const { $userinfo, $errorConvert, $toast } = useNuxtApp()
</script>
<template lang='pug'>
div.w-full.h-full
    div.w-full.my-2.mb-4
        h3.font-bold.text-2xl 루나 통합 계정
        h3.font-light.text-md.-mt-1 내가 승인(인증)한 어플리케이션을 관리해요.
    div.w-full.mt-2.grid.gap-2(class='max-sm:grid-cols-1 min-md:grid-cols-2')
        template(v-if='$userinfo.authorized_apps !== null')
            template(v-if='$userinfo.authorized_apps.length !== 0' v-for='authorizedApp in $userinfo.authorized_apps')
                nuxt-link.transition-all.w-full.flex.gap-2.items-center.group.py-3.px-4.border.border-zinc-200.bg-white.rounded-lg.cursor-pointer(class='dark:bg-zinc-950 dark:border-zinc-800 hover:border-indigo-500 hover:text-indigo-500' :to="{ name: 'panel-application-uuid', params: { uuid: authorizedApp.id } }")
                    img.w-8.h-8(:src='authorizedApp.image')
                    div.flex-grow.min-w-0
                        h3.font-semibold.text-md.whitespace-nowrap.overflow-x-hidden.text-ellipsis {{ authorizedApp.name }}
                        h3.font-light.text-sm.whitespace-nowrap.overflow-x-hidden.text-ellipsis.-mt-1 {{ authorizedApp.id }}
            div.w-full.col-span-2(v-else)
                h3.text-center.font-light.text-red-400.mb-3 내가 승인(인증)한 어플리케이션이 없어요.
        template(v-else)
            loader.w-5.h-5
        nuxt-link.text-xs.font-light.text-right(class='min-md:hidden' :to="{ name: 'panel-application-own' }")
            | 소유한 어플리케이션 관리하기
            i.fal.fa-chevron-right.text-2xs.ml-1
</template>