<script setup lang='ts'>
import axios from 'axios'

const { $router, $appConfig, $toast, $modal, $errorConvert, $loadingView, $application, $request, $permissions, $sessionInitlization } = useNuxtApp()
const runtimeConfig = useRuntimeConfig()
const $route = useRoute()

const users: Array<{
    id: string,
    username: string,
    profile: {
        first_name: string,
        middle_name: string | null,
        last_name: string,
        nickname: string,
    },
    gender: 'male' | 'female',
    birthday: string
    emails: Array<{
        id: string,
        email_address: string,
        is_verified: boolean,
        added_at: string,
    }>,
    phones: Array<{
        id: string,
        phone_number: string,
        is_verified: boolean,
        added_at: string,
    }>,
    authorizations: Array<{
        id: string,
        application: {
            id: string,
            name: string
        };
        permissions: Array<string | {
            id: string,
            name: string,
            description?: string,
            icon?: string
        }>,
        is_active: boolean
    }>
}> = reactive(new Array())

let processUser: { id: string } = reactive({ id: '' })

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

onMounted(async () => {
    $loadingView.status = true
    await $sessionInitlization()
    try {
        const _result = await axios.get(`${ runtimeConfig.public.apiEndpoint }/v0/users`, { headers: { authorization: window.localStorage.getItem('session') } })
        if(_result.status == 200) {
            if(_result.data.data.length == 0) {
                $router.push({ name: 'index' })
            } else {
                for(const _userinfo of _result.data.data) {
                    users.push(_userinfo)
                }
                $loadingView.status = false
            }
        } else throw { response: _result }
    } catch(_error) {
        $loadingView.status = false
        try {
            if(typeof _error == 'object') {
                const _result = (_error as any).response.data
                if(_result.error.description.en == 'Login is required.') $router.push({ name: 'index' })
                else throw 'An unknown error has occured.'
            } else throw 'Failed to load system.'
        } catch(_error) {
            $toast.add('danger', $errorConvert(_error))
        }
    }
})
async function select (_uuid: string) {
    processUser.id = _uuid
    try {
        const _result = await axios.post(`${ runtimeConfig.public.apiEndpoint }/v0/authenticate/${ $application.uuid }/${ _uuid }`, { permissions: $permissions.scopes, response_type: $request.response_type, code_challenge: $request.code_challenge, code_challenge_method: $request.code_challenge_method, redirect_uri: new URL($request.redirect_uri as string).origin }, { headers: { authorization: window.localStorage.getItem('session') } })
        if(_result.status == 200) {
            processUser.id = ''
            if([ 'Normal', 'Warned' ].includes($application.status as string)) {
                await new Promise((_resolve, _reject) => { $modal.add('form', '검증되지 않은 어플리케이션', `해당 어플리케이션은 ${ $application.status == 'Normal' ? '루나의 인증이 진행되지 않았어요.' : '검증되지 않았으며 다수의 도용 신고가 접수되었어요.' }<br>로그인을 하실 경우 아래 개인정보가 어플리케이션에 제공돼요.<br><div class='border rounded-lg p-3 mt-1'><b>${ $permissions.scopes.map(_scope => permissionName($permissions.permissions.find(_permission => _permission.id == _scope)?.name as string)).join(', ') }</b></div>로그인을 계속할까요?`, undefined, false, _resolve, { cancel: '취소', continue: '로그인' }) })
            }
            const _url = new URL($request.redirect_uri as string)
            $toast.add('info', '처리가 완료되어 이전 사이트로 이동하고 있어요.<br>1분 이상 이동이 되지 않으면 이 페이지를 새로고침하거나 고객센터로 문의해주세요!')
            window.location.href = `${ _url.href }${ _url.search == '' ? '?' : _url.search + '&' }state=${ encodeURIComponent($request.state as string) }${ $request.response_type == 'code' ? `&code=${ encodeURIComponent(_result.data.data.token) }&expires_in=${ encodeURIComponent(_result.data.data.expires_in) }` : `&access_token=${ encodeURIComponent(_result.data.data.token) }&token_type=${ encodeURIComponent(_result.data.data.token_type) }&expires_in=${ encodeURIComponent(_result.data.data.expires_in) }` }`
        } else throw { response: _result }
    } catch(_error) {
        processUser.id = ''
        try {
            if(typeof _error == 'object') {
                const _result = (_error as any).response.data
                if(_result.error.description.en == 'Login is required.') $router.push({ name: 'index' })
                else if(_result.error.description.en == 'Not authorized.') $router.push({ name: 'index-authorize', query: { uuid: _uuid } })
                else if(_result.error.description.en == 'Duplicated code verifier.') $toast.add('danger', '중복된 인증 코드입니다.<br>사이트 관리자에게 문의하세요.')
                else if(_result.error.description.en == 'Wrong permission authorized.') {
                    $modal.add('form', '권한 승인 해제', `${ $application.name }에서 승인하지 않은 권한을 요청했어요.<br>안전한 요청 처리를 위해 기존 인증을 해제하고 새로운 인증을 진행해야해요.`, undefined, false, async () => {
                        try {
                            const _result = await axios.delete(`${ runtimeConfig.public.apiEndpoint }/v0/unauthorize/${ $application.uuid }/${ _uuid }`, { headers: { authorization: window.localStorage.getItem('session') } })
                            if(_result.status == 200) {
                                $toast.add('success', `기존 인증을 해제했어요.<br>다시 인증을 하기 위해 권한 인증 페이지로 이동할게요.`)
                                $router.push({ name: 'index-authorize', query: { uuid: _uuid } })
                            } else throw { response: _result }
                        } catch(_error) {
                            try {
                                if(typeof _error == 'object') {
                                    const _result = (_error as any).response.data
                                    if(_result.error.description.en == 'Login is required.') $router.push({ name: 'index' })
                                    else throw '알수 없는 오류가 발생했어요.<br>자세한 내용은 고객센터로 몬의해주세요.'
                                } else throw '인증 해제에 실패했어요.<br>자세한 내용은 고객센터로 몬의해주세요.'
                            } catch(_error) {
                                $toast.add('danger', $errorConvert(_error))
                            }
                        }
                    }, { cancel: '취소', continue: '인증해제' })
                } else throw '알수 없는 오류가 발생했어요.'
            } else throw '로그아웃에 실패했어요.'
        } catch(_error) {
            $toast.add('danger', $errorConvert(_error))
        }
    }
}

async function logout (_uuid: string) {
    const _userinfo = users.filter(_user => { return _user.id == _uuid })[0]
    $modal.add('form', '로그아웃', `"${ _userinfo.profile.first_name } ${ _userinfo.profile.last_name }"님의 계정에서 로그아웃할까요?<br>`, undefined, false, async () => {
        try {
            const _result = await axios.post(`${ runtimeConfig.public.apiEndpoint }/v0/credentials/signout/${ _uuid }`, {  }, { headers: { authorization: window.localStorage.getItem('session') } })
            if(_result.status == 200) {
                $toast.add('success', '로그아웃이 완료되었어요.<br>다른 계정으로 로그인해주세요.')
                $router.push({ name: 'index' })
            } else throw { response: _result }
        } catch(_error) {
            try {
                if(typeof _error == 'object') {
                    const _result = (_error as any).response.data
                    if(_result.error.description.en == 'Login is required.') $router.push({ name: 'index' })
                    else throw '알수 없는 오류가 발생했어요.<br>자세한 내용은 고객센터로 몬의해주세요.'
                } else throw '로그아웃에 실패했어요.<br>자세한 내용은 고객센터로 몬의해주세요.'
            } catch(_error) {
                $toast.add('danger', $errorConvert(_error))
            }
        }
    }, { cancel: '취소', continue: '로그아웃' })
}
</script>

<template lang='pug'>
div.w-full.rounded-xl.bg-white.shadow-md.my-2(class='max-xs:px-3 max-xs:py-2 min-sm:px-5 min-sm:py-3 dark:bg-zinc-900')
    div.w-full
        div.w-full.my-2
            h3.font-bold.text-2xl 계정선택
            h3.font-light.text-md.-mt-1
                b.inline-block.font-medium {{ $application.name }}
                i.fas.fa-badge-check(class='mx-0.5' v-if="[ 'Verified', 'Family' ].indexOf($application.status) !== -1")
                i.fas.fa-exclamation-triangle(class='mx-0.5' v-if="[ 'Warned' ].indexOf($application.status) !== -1")
                | 에 로그인할 Luna Accounts 계정을 선택해요.
        div.w-full.my-1.flex.flex-wrap.gap-2.max-h-52.overflow-y-auto.overflow-x-hidden(class='min-sm:px-3')
            div.w-full.relative.flex.justify-start.items-center.group(v-if='users.length !== 0' v-for='userinfo in users' class='max-xs:overflow-x-auto min-sm:overflow-hidden')
                div.w-full.h-full.absolute.left-0.top-0.rounded-lg.flex.justify-center.items-center.z-10(class='bg-black/50' v-if='processUser.id == userinfo.id')
                    loader.w-8.h-8
                div.transition-all.cursor-pointer.w-full.flex.justify-start.items-center.gap-3.border.rounded-lg.p-3.overflow-x-auto(class='dark:border-zinc-700' :class="{ 'min-sm:group-hover:mr-2 hover:bg-zinc-100 dark:hover:bg-zinc-800': processUser.id !== userinfo.id }" @click='select(userinfo.id)')
                    div.w-12.h-12.min-w-12.border(class='max-xs:hidden')
                    div.flex-grow.min-w-0.flex.justify-between.items-center
                        div.flex-grow.min-w-0
                            h3.font-semibold.text-md.whitespace-nowrap {{ userinfo.profile.first_name }}{{ userinfo.profile.middle_name }}{{ userinfo.profile.last_name }} ({{ userinfo.username }})
                            h3.font-regular.text-sm.whitespace-nowrap.-mt-1 {{ userinfo.emails[0].email_address }}
                            h3.font-regular.text-sm.whitespace-nowrap.-mt-1.text-zinc-600(class='dark:text-zinc-400') {{ userinfo.id }}
                div.cursor-pointer.transition-all.-mr-20.w-20.h-full.rounded-lg.border.border-red-600.text-red-600.flex.justify-center.items-center(class='max-xs:ml-4 min-sm:opacity-0 min-sm:group-hover:right-0 min-sm:group-hover:opacity-100 min-sm:group-hover:mr-0 hover:bg-red-600 hover:text-white' @click='logout(userinfo.id)' v-if='processUser.id !== userinfo.id')
                    div.text-center
                        i.fas.fa-sign-out-alt
                        h3.font-medium.text-md.whitespace-nowrap 로그아웃
            div.w-full.flex.justify-center.items-center.my-1(v-else)
                loader.w-4.h-4.mr-1
                h3.font-semibold.text-md.whitespace-nowrap 정보를 불러오는중...
            nuxt-link.cursor-pointer.w-full.flex.justify-center.items-center(:to="{ name: 'index', query: { ... $route.query, q: true } }")
                h3.font-semibold.text-md.text-blue-400
                    i.far.fa-plus.mr-1
                    | 다른 계정으로 로그인
</template>