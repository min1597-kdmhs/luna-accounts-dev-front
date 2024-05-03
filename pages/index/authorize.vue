<script setup lang='ts'>
import axios from 'axios';

const { $sessionInitlization, $application, $modal, $request, $permissions, $toast, $router, $errorConvert, $loadingView } = useNuxtApp()
const $route = useRoute()
const runtimeConfig = useRuntimeConfig()
const optionalPermissions: any = reactive({
})

onMounted(async () => {
    $loadingView.status = true
    await $sessionInitlization()
    if($permissions.permissions.length == 0) {
        try {
            const _result = await axios.post(`${ runtimeConfig.public.apiEndpoint }/v0/app/${ $request.client_id }/scope`, { scope: decodeURIComponent($request.scope as string) }, { headers: { authorization: window.localStorage.getItem('session') } })
            if(_result.status == 200) {
                $permissions.scopes = _result.data.data.scopes
                $permissions.permissions = _result.data.data.permissions
            } else throw { response: _result }
        } catch(_error) { $modal.add('alert', '요청을 처리하지 못했어요.', `오류가 발생하여 요청을 처리하지 못했어요.<br>자세한 내용은 아래를 확인해주세요.<br><div class='border rounded-lg p-3 mt-1'><b>${ $errorConvert(_error) }</b></div>`, undefined, true) }

    }
    $loadingView.status = false
})

function permissionName (_permissionName: string) {
    switch (_permissionName) {
        case 'openid': return '고유식별코드'
        case 'username': return '사용자 이름'
        case 'phone': return '등록된 전화번호'
        case 'email': return '등록된 이메일 주소'
        case 'profile': return '프로필 정보'
        case 'birthday': return '생일'
        case 'gender': return '성별'
        default: return _permissionName
    }
}

async function authorize () {
    try {
        const _authorize = async () => {
            const _permissions = $permissions.permissions.filter(_permission => { return _permission.isRequired }).map(_permission => { return _permission.id })
            for(const _optionalPermission in optionalPermissions) {
                if(optionalPermissions[_optionalPermission] == true) _permissions.push(_optionalPermission)
            }
            const _result = await axios.post(`${ runtimeConfig.public.apiEndpoint }/v0/authorize/${ $application.uuid }/${ $route.query.uuid }`, { permissions: _permissions }, { headers: { authorization: window.localStorage.getItem('session') } })
            if(_result.status == 200) {
                $toast.add('success', `${ $application.name }의 권한 요청을 승인했어요.`)
                $router.push({ name: 'index-select-account' })
            } else throw { response: _result }
        }
        if($application.status == 'Warned') {
            $modal.add('form', '주의', `${ $application.name }은 인증되지 않았으며 다수의 신고가 들어온 어플리케이션이에요.<br>인증을 진행할 경우 해당 어플리케이션에서 사용자의 개인정보를 조회할 수 있어요.<br>계속해서 어플리케이션 인증을 진행할까요?`, [  ], false, _authorize, { cancel: '취소', continue: '승인' })
            document.querySelector('button#authorize')?.removeAttribute('disabled')
            document.querySelector('button#authorize')?.removeAttribute('loading')
        } else _authorize()
    } catch(_error) {
        try {
            if(typeof _error == 'object') {
                const _result = (_error as any).response.data
                if(_result.error.description.en == 'Login is required.') $router.push({ name: 'index' })
                else throw 'An unknown error has occured.'
            } else throw 'Failed to authorize.'
        } catch(_error) {
            $toast.add('danger', $errorConvert(_error))
        }
    }
}
</script>

<template lang='pug'>
div.w-full.rounded-xl.bg-white.shadow-md.my-2(class='max-xs:px-3 max-xs:py-2 min-sm:px-5 min-sm:py-3 dark:bg-zinc-900')
    div.w-full
        div.w-full.my-2
            h3.font-bold.text-2xl 권한 승인
            h3.font-light.text-md.-mt-1
                b.inline-block.font-medium {{ $application.name }}
                i.fas.fa-badge-check(class='mx-0.5' v-if="[ 'Verified', 'Family' ].indexOf($application.status) !== -1")
                i.fas.fa-exclamation-triangle(class='mx-0.5' v-if="[ 'Warned' ].indexOf($application.status) !== -1")
                | 에 다음과 같은 권한을 제공해요.
        div.w-full.mt-5
            div.flex.flex-wrap.gap-2
                div.mt-2
                    h3.font-semibold.text-md 필수권한
                div.w-full.flex.justify-start.items-center.gap-2(v-for='permission in $permissions.permissions.filter(_permission => { return _permission.isRequired })')
                    div.w-10.h-10.flex.justify-center.items-center
                        i(:class='permission.icon')
                    div.flex-grow.min-w-0.flex.justify-start.items-center
                        h3.font-regular.text-md 사용자의 {{ permissionName(permission.name) }}을(를) 확인합니다.
                    div.w-fit.flex.justify-end.items-center
                        h3.font-regular.text-sm.text-red-500.whitespace-nowrap *필수
                div.mt-2(v-if='$permissions.permissions.filter(_permission => { return !_permission.isRequired }).length !== 0')
                    h3.font-semibold.text-md 선택권한
                div.w-full.flex.justify-start.items-center.gap-2(v-for='permission in $permissions.permissions.filter(_permission => { return !_permission.isRequired })')
                    div.w-10.h-10.flex.justify-center.items-center
                        i(:class='permission.icon')
                    div.flex-grow.min-w-0.flex.justify-start.items-center
                        h3.font-regular.text-md 사용자의 {{ permissionName(permission.name) }}을(를) 확인합니다.
                    div.w-fit.flex.justify-end.items-center
                        label.relative.inline-flex.items-center.cursor-pointer
                            input.sr-only.peer(type='checkbox' v-model='optionalPermissions[permission.id]')
                            div.w-11.h-6.bg-gray-200.rounded-full.peer(class='peer-focus:outline-none dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[""] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600')
                div.mt-2
                    h3.font-semibold.text-md {{ $application.name }} 약관
                div.w-full.flex.justify-start.items-center.gap-2
                    div.w-10.h-10.flex.justify-center.items-center
                        i.fas.fa-book
                    div.flex-grow.min-w-0.flex.justify-start.items-center
                        h3.font-regular.text-md {{ $application.name }}의 이용약관에 동의합니다.
                    div.w-fit.flex.justify-end.items-center
                        h3.font-regular.text-sm.text-red-500.ml-2.whitespace-nowrap *필수
                div.w-full.flex.justify-start.items-center.gap-2
                    div.w-10.h-10.flex.justify-center.items-center
                        i.fas.fa-book
                    div.flex-grow.min-w-0.flex.justify-start.items-center
                        h3.font-regular.text-md {{ $application.name }}의 개인정보처리방침에 동의합니다.
                    div.w-fit.flex.justify-end.items-center
                        h3.font-regular.text-sm.text-red-500.ml-2.whitespace-nowrap *필수
        div.w-full.flex.justify-between.items-center.mt-3
            form-button(color='red' class='!w-fit' @click="$router.push({ name: 'index-select-account' })")
                i.far.fa-times.mr-1
                | 거부
            form-button#authorize(color='indigo' class='!w-fit' @click='authorize')
                i.fas.fa-check.mr-1
                | 승인
</template>