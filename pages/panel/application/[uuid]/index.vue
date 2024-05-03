<script setup lang='ts'>
import axios from 'axios';


const { $loadingView, $userinfo, $errorConvert, $appConfig, $toast, $modal, $sessionInitlization, $router, $copy } = useNuxtApp()
const runtimeConfig = useRuntimeConfig()
const $route = useRoute()
let values: {
    application: {
        id: string,
        name: string,
        permissions: Array<{
            id: string,
            name: string,
            icon: string,
            is_required?: boolean
        }>,
        callbacks?: Array<URL>,
        managers?: Array<{ id: string, fullName: string }>,
        terms?: string,
        privacy?: string,
        secretKey?: string
    } | null,
    type: string
} = reactive({
    application: null,
    type: ''
})
let display: {
    menu: number
} = reactive({
    menu: 0
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
function redirect (_idx: number) {
    const _blankPage = window.open('about:blank')
    if(_blankPage == null) throw ''
    switch (_idx) {
        case 0:
            _blankPage.location.href = values.application?.terms as string
            break
        case 1:
            _blankPage.location.href = values.application?.privacy as string
            break
    }
}
async function modifyPermission (_permissions: Array<{ id: string, isRequired: boolean }>): Promise<void> {
    const _processResult = await axios.post(`${ runtimeConfig.public.apiEndpoint }/portal/app/${ values.application?.id }/permission`, { permissions: _permissions.map(_permission => { return { id: _permission.id, is_required: _permission.isRequired } }) }, { headers: { authorization: window.localStorage.getItem('access_token') } })
    if(_processResult.status == 200) {
        const _appInfo = await axios.get(`${ runtimeConfig.public.apiEndpoint }/portal/app/${ values.application?.id }`, { headers: { authorization: window.localStorage.getItem('access_token') } })
        if(_appInfo.status == 200) {
            if($userinfo.owned_apps == null) throw 'Failed to fetch owned applications.'
            for(const _index in $userinfo.owned_apps) {
                if($userinfo.owned_apps[_index].id == values.application?.id) {
                    $userinfo.owned_apps[_index].permissions = _appInfo.data.data.permissions
                }
            }
            if(values.application) values.application.permissions = _appInfo.data.data.permissions

            $toast.add('success', '요청 권한을 수정했어요.')
        } else throw { response: _appInfo }
    } else throw { response: _processResult }
}
async function modifyRedirect (_redirects: Array<string>): Promise<void> {
    const _processResult = await axios.post(`${ runtimeConfig.public.apiEndpoint }/portal/app/${ values.application?.id }/redirect`, { redirects: _redirects }, { headers: { authorization: window.localStorage.getItem('access_token') } })
    if(_processResult.status == 200) {
        if($userinfo.owned_apps) {
            for(const _index in $userinfo.owned_apps) {
                if($userinfo.owned_apps[_index].id == values.application?.id) {
                    $userinfo.owned_apps[_index].redirect_uris = _redirects
                }
            }
        }
        if(values.application) values.application.callbacks = _redirects.map(_redirect => new URL(_redirect))

        $toast.add('success', '콜백 URI를 수정했어요.')
    } else throw { response: _processResult }
}
async function addPermission () {
    try {
        $loadingView.status = true
        const _result = await axios.get(`${ runtimeConfig.public.apiEndpoint }/portal/permission/${ values.application?.id }`, { headers: { authorization: window.localStorage.getItem('access_token') } })
        
        if(_result.status == 200) {
            $loadingView.status = false
            if(_result.data.data.length == 0) $toast.add('warning', '추가할 권한이 없어요.')
            else {
                $modal.add('form', '요청 권한 추가', `${ values.application?.name }에 추가할 요청권한을 선택하여 추가해요.`, [ { type: 'select', title: '권한', name: 'id', placeholder: '추가할 권한을 선택해주세요.', options: _result.data.data.permissions.filter((_permission: { id: string, name: string, description: string, is_metadata: boolean, is_required: boolean }) => values.application?.permissions.filter(__permission => __permission.id == _permission.id).length == 0).map((_permission: { id: string, name: string, description: string, is_metadata: boolean, is_required: boolean }) => { return {
                    name: permissionName(_permission.name),
                    value: _permission.id
                } }) }, { type: 'toggle', title: '필수여부', name: 'is_required', placeholder: '' } ], false, async (_data: { id: string, is_required: boolean }) => {
                    try {
                        await modifyPermission([ ... values.application?.permissions.map(_permission => { return { id: _permission.id, isRequired: _permission.is_required ?? false } }) ?? [  ], { id: _data.id, isRequired: _data.is_required ?? false } ])
                    } catch(_error) { $toast.add('danger', $errorConvert(_error)) }
                })
            }
        } else throw { response: _result }
    } catch(_error) {
        $loadingView.status = false
        $toast.add('danger', $errorConvert(_error))
    }
}
async function deletePermission (_uuid: string) {
    try {
        $modal.add('form', '요청 권한 삭제', '선택한 요청 권한을 삭제할게요.', [  ], false, async () => {
            try {
                if(values.application == undefined) throw 'Failed to fetch application.'
                await modifyPermission(values.application.permissions.filter(_permission => _permission.id !== _uuid).map(_permission => { return {
                    id: _permission.id,
                    isRequired: _permission.is_required ?? false
                } }))
            } catch(_error) { $toast.add('danger', $errorConvert(_error)) }
        })
    } catch(_error) {
        $toast.add('danger', $errorConvert(_error))
    }
}
async function addCallback () {
    try {
        $modal.add('form', '콜백 URL 추가', `${ values.application?.name }에 추가할 콜백 URL을 입력해주세요.`, [ { type: 'select', title: '프로토콜', name: 'protocol', placeholder: '프로토콜을 선택해주세요.', options: [ { name: 'HTTP(개발)', value: 'http' }, { name: 'HTTPS', value: 'https' } ] }, { type: 'input', title: 'URL', name: 'url', placeholder: '프로토콜을 제외한 URL을 입력해주세요.' } ], false, async (_data: { protocol: string, url: string }) => {
            if(/^(?:\S+(?::\S*)?@)?(?:(?:(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[0-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))|localhost)(?::\d{2,5})?(?:(\/|\?|#)[^\s]*)?$/.test(_data.url) !== true) throw 'Invalid url.'
            modifyRedirect([ ... values.application?.callbacks ?? [  ], new URL(`${ _data.protocol }://${ _data.url }`) ].map(_redirect => _redirect.href) as Array<string>)
        })
    } catch(_error) {
        $toast.add('danger', $errorConvert(_error))
    }
}
async function deleteCallback (_url: string) {
    try {
        $modal.add('form', '콜백 URL 삭제', '선택한 콜백 URL을 삭제할게요.', [  ], false, async () => {
            modifyRedirect(values.application?.callbacks?.filter(_callback => _callback.href !== _url).map(_redirect => _redirect.href) as Array<string>)
        })
    } catch(_error) {
        $toast.add('danger', $errorConvert(_error))
    }
}
async function deleteApp ($event: Event) {
    try {
        const _element = ($event.target as HTMLButtonElement)
        _element.removeAttribute('loading')
        _element.removeAttribute('disabled')
        $modal.add('form', '어플리케이션 삭제', '어플리케이션을 삭제할게요.<br>이 작업은 되돌릴 수 없어요. 신중히 선택해주세요.', [  ], false, async () => {
            try {
                const _result = await axios.delete(`${ runtimeConfig.public.apiEndpoint }/v0/app/${ values.application?.id }`, { headers: { authorization: window.localStorage.getItem('access_token') } })
                if(_result.status == 200) {
                    $userinfo.owned_apps = ($userinfo.owned_apps ?? [  ]).filter(_application => _application.id !== values.application?.id)
                    $toast.add('success', `어플리케이션을 삭제했어요.<br>소유중인 어플리케이션 목록으로 이동할게요.`)
                    $router.push({ name: 'panel-application-own' })
                } else throw { response: _result }
            } catch(_error) { $toast.add('danger', $errorConvert(_error)) }
        })
    } catch(_error) { $toast.add('danger', $errorConvert(_error)) }
}
async function unauthorize ($event: Event) {
    try {
        const _element = ($event.target as HTMLButtonElement)
        _element.removeAttribute('loading')
        _element.removeAttribute('disabled')
        $modal.add('form', '권한 승인 해제', `해당 어플리케이션의 인증을 해제할게요.`, undefined, false, async () => {
            try {
                const _result = await axios.delete(`${ runtimeConfig.public.apiEndpoint }/v0/unauthorize/${ values.application?.id }/${ $userinfo.id }`, { headers: { authorization: window.localStorage.getItem('session') } })
                if(_result.status == 200) {
                    $userinfo.authorized_apps = ($userinfo.authorized_apps ?? [  ]).filter(_application => _application.id !== values.application?.id)
                    $toast.add('success', `권한 인증을 해제했어요.<br>인증된 어플리케이션 목록으로 이동할게요.ㅋ`)
                    $router.push({ name: 'panel-application-authorized' })
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
    } catch(_error) { $toast.add('danger', $errorConvert(_error)) }
}
async function addManager () {
    $toast.add('warning', '현재 해당 기능은 지원하지 않아요.<br>고객센터를 통해 관리자를 초대해주세요.')
}
async function resetSecretKey ($event: Event) {
    ($event.target as HTMLDivElement).classList.add('!rotate-180')
    console.log(($event.target as HTMLDivElement))
    $toast.add('warning', '현재 해당 기능은 지원하지 않아요.<br>고객센터를 통해 이용해주세요.')
    setTimeout(() => {
        ($event.target as HTMLDivElement).classList.remove('!rotate-180')
    }, 300)
}
function decodeBase64 (_text: string) { return window.atob(_text) }
onMounted(async () => {
    $loadingView.status = true
    await $sessionInitlization()
    $loadingView.status = false
    if($userinfo.owned_apps?.find(_application => _application.id == $route.params.uuid)) {
        const _application = $userinfo.owned_apps.find(_application => _application.id == $route.params.uuid)
        if(typeof _application !== 'object') throw 'Failed to fetch application.'
        values.type = 'Owned'
        values.application = {
            id: _application.id,
            name: _application.name,
            permissions: _application.permissions.map(_permission => { return { id: _permission.id, name: _permission.name, icon: _permission.icon, is_required: _permission.is_required } }),
            callbacks: _application.redirect_uris.map(_redirectUri => { return new URL(_redirectUri) }),
            managers: _application.managers.map(_manager => { return { id: _manager.id, fullName: _manager.full_name } }),

            secretKey: _application.secret_key
        }
    } else if($userinfo.authorized_apps?.find(_application => _application.id == $route.params.uuid)) {
        const _application = $userinfo.authorized_apps.find(_application => _application.id == $route.params.uuid)
        if(typeof _application !== 'object') throw 'Failed to fetch application.'
        values.type = 'Authorized'
        values.application = {
            id: _application.id,
            name: _application.name,
            permissions: _application.permissions,
            terms: _application.terms,
            privacy: _application.privacy
        }
    } else $router.push({ name: 'panel-application-authorized' })
})
</script>
<template lang='pug'>
div.w-full.h-full
    div.w-full.mt-2
        h3.flex.justify-start.items-center.font-regular.text-md(v-if='values.application == null')
            loader.inline.w-4.h-4.mr-3
            | 어플리케이션 정보를 가져오고 있어요!
        template(v-else)
            nuxt-link.cursor-pointer(:to="{ name: `panel-application-${ values.type == 'Owned' ? 'own' : 'authorized' }` }")
                div.flex.justify-start.items-center.gap-2
                    i.fas.fa-chevron-left
                    h3.font-bold.text-2xl {{ values.application.name }}
                h3.font-light.text-sm.-mt-1 {{ values.application.id }}
            div.w-full.overflow-x-auto
                div.flex.justify-start.items-end.overflow-x-auto.mb-3
                    div.cursor-pointer.transition-all.px-6.py-1.border-b-2.whitespace-nowrap(class='hover:border-indigo-600' @click='display.menu = 0' :class="{ 'border-indigo-600': display.menu == 0 }") 어플리케이션
                    div.cursor-pointer.transition-all.px-6.py-1.border-b-2.whitespace-nowrap(class='hover:border-indigo-600' @click='display.menu = 1' v-if="values.type == 'Owned'" :class="{ 'border-indigo-600': display.menu == 1 }") 요청 권한
                    div.cursor-pointer.transition-all.px-6.py-1.border-b-2.whitespace-nowrap(class='hover:border-indigo-600' @click='display.menu = 2' v-if="values.type == 'Owned'" :class="{ 'border-indigo-600': display.menu == 2 }") 콜백 URL
                    div.cursor-pointer.transition-all.px-6.py-1.border-b-2.whitespace-nowrap(class='hover:border-indigo-600' @click='display.menu = 3' v-if="values.type == 'Owned'" :class="{ 'border-indigo-600': display.menu == 3 }") 관리자 목록
                    div.cursor-pointer.transition-all.px-6.py-1.border-b-2.whitespace-nowrap(class='hover:border-indigo-600' @click='display.menu = 4' v-if="values.type == 'Owned'" :class="{ 'border-indigo-600': display.menu == 4 }") 개발정보
                    div.flex-grow.min-w-0.border-b-2
            div.w-full(v-if='display.menu == 0')
                div.mb-3(v-if="values.type == 'Authorized'")
                    h3.font-semibold.text-lg 인증된 권한
                    div.w-full.flex.justify-start.items-center.gap-2.px-3(v-for='_permission in values.application.permissions')
                        div.w-10.h-10.flex.justify-center.items-center
                            i(:class='_permission.icon')
                        div.flex-grow.min-w-0.flex.justify-start.items-center
                            h3.font-light.text-sm.flex.justify-start.items-center.whitespace-nowrap 사용자의
                                b.font-bold.ml-1 {{ permissionName(_permission.name) }}
                                | 을(를) 확인합니다.
                div.w-full.flex.justify-between.items-center.gap-3.overflow-x-auto
                    div.flex.justify-start.items-center.gap-3
                        form-button.whitespace-nowrap(color='blue' @click='redirect(0)') 이용약관
                        form-button.whitespace-nowrap(color='blue' @click='redirect(1)') 개인정보처리방침
                    form-button.whitespace-nowrap(color='red' v-if="values.type == 'Authorized'" @click='unauthorize') 인증해제
                    form-button.whitespace-nowrap(color='red' v-if="values.type == 'Owned'" @click='deleteApp') 삭제
            div.w-full(v-if='display.menu == 1')
                div.mb-3(v-if="values.type == 'Owned'")
                    h3.font-semibold.text-lg 요청 권한 목록
                    h3.font-regular.text-sm.text-red-400(v-if='values.application.permissions.length == 0') 등록된 요청 권한이 존재하지 않습니다.
                    div.w-full.flex.justify-start.items-center.gap-2.px-3(v-for='_permission in values.application.permissions')
                        h3.font-regular.text-red-400.whitespace-nowrap(v-if='_permission.is_required == true') 필수
                        h3.font-regular.text-indigo-400.whitespace-nowrap(v-if='_permission.is_required == false') 선택
                        div.w-10.h-10.flex.justify-center.items-center
                            i(:class='_permission.icon')
                        div.flex-grow.min-w-0.flex.justify-start.items-center
                            h3.font-light.text-sm.flex.justify-start.items-center.whitespace-nowrap 사용자의
                                b.font-bold.ml-1 {{ permissionName(_permission.name) }}
                                | 을(를) 확인합니다.
                        i.cursor-pointer.fas.fa-times.text-red-500(@click='deletePermission(_permission.id)')
                    h3.cursor-pointer.font-medium.text-md.text-blue-400.text-center(@click='addPermission()')
                        i.far.fa-plus.mr-1
                        | 요청 권한 추가
            div.w-full(v-if='display.menu == 2')
                div.mb-3(v-if="values.type == 'Owned'")
                    h3.font-semibold.text-lg 콜백 URL 목록
                    h3.font-regular.text-sm.text-red-400(v-if='values.application.callbacks.length == 0') 등록된 콜백 URL이 존재하지 않습니다.
                    div.w-full.flex.justify-start.items-center.gap-2.px-3(v-for='_callback in values.application.callbacks')
                        h3.font-medium.text-yellow-400(v-if="_callback.protocol == 'http:'") 개발용
                        h3.font-medium.text-blue-500(v-if="_callback.protocol == 'https:'") 일반
                        h3.flex-grow.min-w-0.font-light {{ _callback }}
                        i.cursor-pointer.fas.fa-times.text-red-500(@click='deleteCallback(_callback.origin)')
                    h3.cursor-pointer.font-medium.text-md.text-blue-400.text-center(@click='addCallback()')
                        i.far.fa-plus.mr-1
                        | 콜백 URL 추가
            div.w-full(v-if='display.menu == 3')
                div.mb-3(v-if="values.type == 'Owned'")
                    h3.font-semibold.text-lg 관리자 목록
                    h3.font-regular.text-sm.text-red-400(v-if='values.application.managers.length == 0') 등록된 관리자가 존재하지 않습니다.
                    div.w-full.flex.justify-start.items-center.gap-2.px-4.py-2.border.rounded-lg.my-2(v-for='(_manager, _index) in values.application.managers')
                        div.bg-blue-200.text-blue-700.rounded-full.px-2.text-sm.whitespace-nowrap(class='py-0.5 dark:bg-blue-700 dark:text-blue-200' v-if='_index == 0') 소유자
                        div.bg-red-200.text-red-700.rounded-full.px-2.text-sm.whitespace-nowrap(class='py-0.5 dark:bg-red-700 dark:text-red-200' v-if='_index !== 0') 관리자
                        h3.flex-grow.min-w-0.font-light {{ _manager.fullName }} ({{ _manager.id }})
                    h3.cursor-pointer.font-medium.text-md.text-blue-400.text-center(@click='addManager()')
                        i.far.fa-plus.mr-1
                        | 관리자 초대
            div.w-full(v-if='display.menu == 4')
                div.mb-3(v-if="values.type == 'Owned'")
                    h3.font-semibold.text-lg 개발정보
                    div.w-full.flex.justify-start.items-center.gap-2.px-3
                        h3.font-regular.text-indigo-400.whitespace-nowrap Client ID
                        div.flex-grow.min-w-0.flex.justify-start.items-center.overflow-x-auto
                            h3.font-light.text-sm.flex.justify-start.items-center.whitespace-nowrap {{ values.application.id }}
                            h3.cursor-pointer.font-regular.text-sm.whitespace-nowrap.text-blue-400(@click="() => { $copy(values.application.id); $toast.add('info', '성공적으로 복사했어요.') }")
                                i.far.fa-copy.ml-2.mr-1
                                | 복사하기
                    div.w-full.flex.justify-start.items-center.gap-2.px-3
                        h3.font-regular.text-indigo-400.whitespace-nowrap Secret Key
                        div.flex-grow.min-w-0.flex.justify-start.items-center
                            h3.flex-grow.min-w-0.overflow-x-auto.font-light.text-sm.flex.justify-start.items-center.whitespace-nowrap {{ decodeBase64(values.application.secretKey) }}
                            h3.cursor-pointer.font-regular.text-sm.whitespace-nowrap.text-blue-400(@click="() => { $copy(decodeBase64(values.application.secretKey)); $toast.add('info', '성공적으로 복사했어요.') }")
                                i.far.fa-copy.ml-2.mr-1
                                | 복사하기
                        i.transition-all.cursor-pointer.fas.fa-sync.text-zinc-500(@click='resetSecretKey' class='hover:rotate-90')
</template>