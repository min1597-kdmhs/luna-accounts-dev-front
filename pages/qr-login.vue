<script setup lang='ts'>
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'

const { $appConfig, $modal, $toast, $loadingView, $errorConvert, $router, $sessionInitlization } = useNuxtApp()
const runtimeConfig = useRuntimeConfig()
const $route = useRoute()

let data: { uuid: string, status: number, userUuid: string | null, browser: string, applicationName: string | null, expiresAt: string | null, remoteToken: string | null, dummyVerificationCode: Array<string> } = reactive({
    uuid: '',
    status: 0,
    userUuid: null,
    browser: '',
    applicationName: null,
    expiresAt: null,
    remoteToken: null,
    dummyVerificationCode: new Array()
})

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
onMounted(async () => {
    $loadingView.status = true
    await $sessionInitlization()
    if(typeof $route.query.id !== 'string') {
        $modal.add('alert', '요청을 처리하지 못했어요.', `오류가 발생하여 요청을 처리하지 못했어요.<br>자세한 내용은 아래를 확인해주세요.<br><div class='border rounded-lg p-3 mt-1'><b>잘못된 접근입니다.</b></div>`, undefined, true)
        return
    }
    data.uuid = decodeURIComponent($route.query.id)
    try {
        const _qrResult = await axios.get(`${ runtimeConfig.public.apiEndpoint }/v0/credentials/remote/${ $route.query.id }`, { headers: { authorization: window.localStorage.getItem('session') } })
        if(_qrResult.status == 200) {
            const _expiresDate = new Date(_qrResult.data.data.expires_at)
            data.browser = _qrResult.data.data.device_name
            data.dummyVerificationCode = _qrResult.data.data.verification_codes
            data.applicationName = _qrResult.data.data.application_name
            data.remoteToken = _qrResult.data.data.remote_token
            data.expiresAt = `${ _expiresDate.getFullYear() }-${ _expiresDate.getMonth() + 1 }-${ _expiresDate.getDate() } ${ _expiresDate.getHours() < 10 ? `0${ _expiresDate.getHours() }` : _expiresDate.getHours() }:${ _expiresDate.getMinutes() < 10 ? `0${ _expiresDate.getMinutes() }` : _expiresDate.getMinutes() }`
        } else throw { response: _qrResult }
        const _result = await axios.get(`${ runtimeConfig.public.apiEndpoint }/v0/users`, { headers: { authorization: window.localStorage.getItem('session') } })
        if(_result.status == 200) {
            if(_result.data.data.length == 0) {
                window.location.href = `${ new URL(window.location.href).origin }/?continue=${ encodeURIComponent(window.btoa((`/qr-login?id=${ encodeURIComponent(data.uuid) }`))) }`
            } else {
                console.log(_result.data.data)
                for(const _userinfo of _result.data.data) {
                    users.push(_userinfo)
                }
                $loadingView.status = false
            }
        } else throw { response: _result }
    } catch(_error) { $modal.add('alert', '요청을 처리하지 못했어요.', `오류가 발생하여 요청을 처리하지 못했어요.<br>자세한 내용은 아래를 확인해주세요.<br><div class='border rounded-lg p-3 mt-1'><b>${ $errorConvert(_error) }</b></div>`, undefined, true) }

})

function select (_uuid: string) {
    data.userUuid = _uuid
}
async function verify (_code: string) {
    try {
        const _result = await axios.post(`${ runtimeConfig.public.apiEndpoint }/v0/credentials/signin`, { type: 'qr_login', remote_token: data.remoteToken, user_id: data.userUuid, verification_code: _code }, { headers: { authorization: window.localStorage.getItem('session') } })
        if(_result.status == 200) {
            $modal.add('alert', '로그인 성공', '해당 브라우저에 로그인이 완료되었어요.<br>브라우저로 이동해주세요.', undefined, true)
        } else throw { response: _result }
    } catch(_error) {
        $toast.add('danger', $errorConvert(_error))
    }
}
</script>

<template lang='pug'>
toast
modal
div.w-full.h-full.flex.justify-center.items-center.px-3
    div.w-full.max-w-lg
        div.w-full
            div.w-full.flex.justify-center.itmes-center
                svg.w-fit.h-12.mb-1.cursor-pointer(viewBox='0 0 957 117' fill='none' xmlns='http://www.w3.org/2000/svg')
                    path(d='M38.1918 0.666016H69.8283L43.2524 80.2312C42.0646 83.7876 41.4706 85.5658 41.8254 86.9813C42.136 88.2204 42.909 89.2936 43.9859 89.9807C45.2161 90.7657 47.0908 90.7657 50.8403 90.7657H88.937L82.6652 109.543C82.0087 111.508 81.6804 112.491 81.0723 113.217C80.5353 113.859 79.8459 114.355 79.0673 114.662C78.1855 115.008 77.1495 115.008 75.0772 115.008H11.1066C7.35705 115.008 5.4823 115.008 4.25209 114.223C3.17523 113.536 2.4022 112.463 2.09163 111.224C1.73684 109.808 2.33077 108.03 3.51865 104.474L19.0959 57.8371L28.6438 29.2515L33.4178 14.9588C34.7515 10.9659 32.6965 6.63211 28.761 5.1377L16.9954 0.67L38.1918 0.666016ZM227.728 0.666016L203.198 74.104C200.351 82.6323 195.697 90.0813 189.24 96.4507C182.84 102.821 175.117 107.743 166.075 111.218C157.052 114.64 147.433 116.351 137.221 116.351C126.952 116.351 118.505 114.64 111.877 111.218C105.267 107.743 100.862 102.821 98.6602 96.4507C96.514 90.0813 96.8653 82.6323 99.7139 74.104L111.978 37.385L118.111 19.0255C118.402 18.1532 118.548 17.717 118.644 17.3264C119.695 13.068 117.848 8.62174 114.089 6.36109C113.744 6.15374 113.333 5.94915 112.509 5.53999L102.705 0.67L124.243 0.666016H155.879L132.221 71.4981C131.008 75.1305 130.786 78.3681 131.557 81.2109C132.329 84.0536 133.941 86.291 136.392 87.923C138.9 89.5549 142.068 90.3709 145.898 90.3709C149.783 90.3709 153.525 89.5549 157.123 87.923C160.775 86.291 163.91 84.0536 166.524 81.2109C169.139 78.3681 171.053 75.1305 172.266 71.4981L194.1 6.1315C194.756 4.16605 195.084 3.18332 195.693 2.45681C196.23 1.81524 196.919 1.31868 197.698 1.01261C198.579 0.666016 199.615 0.666016 201.688 0.666016H227.728ZM300.813 115.008H279.717C277.746 115.008 276.76 115.008 275.91 114.689C275.159 114.406 274.486 113.947 273.95 113.35C273.343 112.675 272.984 111.757 272.266 109.921L250.299 53.7239C250.207 53.49 249.982 53.3361 249.731 53.3361C249.482 53.3361 249.261 53.4952 249.182 53.7311L228.716 115.008H208.186C204.437 115.008 202.562 115.008 201.332 114.223C200.255 113.536 199.482 112.463 199.171 111.224C198.816 109.808 199.41 108.03 200.598 104.474L233.446 6.13156C234.102 4.16609 234.43 3.18336 235.038 2.45683C235.575 1.81526 236.265 1.31869 237.043 1.01262C237.925 0.666016 238.961 0.666016 241.034 0.666016H262.329L285.649 61.7239C285.754 61.9986 286.017 62.1801 286.311 62.1801C286.617 62.1801 286.888 61.985 286.984 61.6955L305.543 6.13164C306.199 4.16614 306.527 3.18339 307.135 2.45686C307.672 1.81528 308.362 1.3187 309.141 1.01262C310.022 0.666016 311.058 0.666016 313.131 0.666016H339.005L300.813 115.008Z' fill='#8459FF')
                    path(d='M319.792 114.848C316.048 114.848 314.176 114.848 312.947 114.064C311.87 113.378 311.097 112.306 310.786 111.069C310.429 109.655 311.02 107.879 312.2 104.326L344.774 6.26517C345.428 4.29543 345.755 3.31056 346.363 2.58235C346.9 1.9393 347.59 1.44148 348.369 1.13462C349.252 0.787109 350.29 0.787109 352.366 0.787109H387.318L406.262 57.8174L415.734 86.3325L420.47 100.59C421.248 102.931 421.636 104.101 422.256 105.1C423.062 106.401 424.156 107.5 425.454 108.312C426.451 108.935 427.62 109.328 429.958 110.115L444.025 114.85L425.206 114.848H398.761C396.633 114.848 395.569 114.848 394.67 114.486C393.877 114.167 393.179 113.649 392.643 112.983C392.035 112.229 391.726 111.211 391.107 109.175L367.604 31.8809C367.523 31.6124 367.275 31.429 366.995 31.429C366.714 31.429 366.467 31.6122 366.385 31.8804L341.079 114.848H319.792ZM379.131 69.7906L386.005 92.3975H350.925L357.825 69.7906H379.131Z' fill='#8459FF')
                    path(d='M376.835 69.7998C377.975 69.8047 378.795 68.7075 378.467 67.6163L378.285 67.0098L379.135 69.7998H376.835Z' fill='#8459FF')
                    path(d='M383.835 92.3903H386.005L386.855 95.1903L386.628 94.4454C386.252 93.2193 385.118 92.3841 383.835 92.3903Z' fill='#8459FF')
                    path(d='M447.522 115L477.552 28.0352H500.734L530.824 115H511.425L489.503 47.6743H488.783L466.801 115H447.522ZM512.266 80.8267V94.9404H475.35L479.95 80.8267H512.266Z' class='fill-black dark:fill-white')
                    path(d='M560.335 116.261C553.769 116.261 548.063 114.86 543.219 112.057C538.374 109.214 534.67 105.25 532.108 100.166C529.545 95.0806 528.264 89.2349 528.264 82.6284C528.264 75.9819 529.565 70.1162 532.168 65.0312C534.771 59.9463 538.474 56.0024 543.279 53.1997C548.083 50.3569 553.729 48.9355 560.215 48.9355C565.781 48.9355 570.726 49.9565 575.05 51.9985C579.374 54.0005 582.757 56.8833 585.2 60.647C587.682 64.4106 589.043 68.7549 589.284 73.6797H572.467C572.147 71.5176 571.466 69.6157 570.425 67.9741C569.384 66.3325 568.003 65.0713 566.281 64.1904C564.6 63.2695 562.678 62.7891 560.516 62.749C557.673 62.7891 555.19 63.5698 553.068 65.0913C550.946 66.6128 549.285 68.855 548.083 71.8179C546.882 74.7407 546.282 78.2441 546.282 82.3281C546.282 86.4922 546.862 90.0557 548.023 93.0186C549.225 95.9414 550.886 98.2036 553.008 99.8052C555.13 101.367 557.633 102.127 560.516 102.087C562.598 102.127 564.479 101.727 566.161 100.886C567.843 100.005 569.224 98.7642 570.305 97.1626C571.426 95.561 572.147 93.5991 572.467 91.2769H589.284C589.003 96.2417 587.642 100.606 585.2 104.37C582.797 108.133 579.454 111.056 575.17 113.138C570.886 115.22 565.941 116.261 560.335 116.261ZM623.493 116.261C616.927 116.261 611.221 114.86 606.376 112.057C601.532 109.214 597.828 105.25 595.266 100.166C592.703 95.0806 591.422 89.2349 591.422 82.6284C591.422 75.9819 592.723 70.1162 595.326 65.0312C597.928 59.9463 601.632 56.0024 606.436 53.1997C611.241 50.3569 616.887 48.9355 623.373 48.9355C628.938 48.9355 633.883 49.9565 638.207 51.9985C642.532 54.0005 645.915 56.8833 648.357 60.647C650.84 64.4106 652.201 68.7549 652.441 73.6797H635.625C635.305 71.5176 634.624 69.6157 633.583 67.9741C632.542 66.3325 631.161 65.0713 629.439 64.1904C627.757 63.2695 625.835 62.7891 623.673 62.749C620.83 62.7891 618.348 63.5698 616.226 65.0913C614.104 66.6128 612.442 68.855 611.241 71.8179C610.04 74.7407 609.439 78.2441 609.439 82.3281C609.439 86.4922 610.02 90.0557 611.181 93.0186C612.382 95.9414 614.044 98.2036 616.166 99.8052C618.288 101.367 620.79 102.127 623.673 102.087C625.755 102.127 627.637 101.727 629.319 100.886C631 100.005 632.382 98.7642 633.463 97.1626C634.584 95.561 635.305 93.5991 635.625 91.2769H652.441C652.161 96.2417 650.8 100.606 648.357 104.37C645.955 108.133 642.612 111.056 638.328 113.138C634.043 115.22 629.099 116.261 623.493 116.261ZM686.651 116.261C680.124 116.261 674.439 114.86 669.594 112.057C664.789 109.254 661.086 105.331 658.483 100.286C655.881 95.2007 654.579 89.3149 654.579 82.6284C654.579 75.9019 655.881 70.0161 658.483 64.9712C661.086 59.8862 664.789 55.9424 669.594 53.1396C674.439 50.3369 680.124 48.9355 686.651 48.9355C693.097 48.9355 698.742 50.3369 703.587 53.1396C708.472 55.9424 712.196 59.8862 714.758 64.9712C717.321 70.0161 718.602 75.9019 718.602 82.6284C718.602 89.3149 717.321 95.2007 714.758 100.286C712.196 105.331 708.472 109.254 703.587 112.057C698.742 114.86 693.097 116.261 686.651 116.261ZM686.771 102.508C689.694 102.508 692.196 101.647 694.278 99.9253C696.36 98.2036 697.922 95.8413 698.963 92.8384C700.004 89.7954 700.524 86.3521 700.524 82.5083C700.524 78.6245 700.004 75.1812 698.963 72.1782C697.922 69.1753 696.36 66.813 694.278 65.0913C692.196 63.3696 689.694 62.5088 686.771 62.5088C683.728 62.5088 681.145 63.3696 679.023 65.0913C676.901 66.813 675.3 69.1753 674.219 72.1782C673.178 75.1812 672.637 78.6245 672.597 82.5083C672.637 86.3521 673.178 89.7954 674.219 92.8384C675.3 95.8413 676.901 98.2036 679.023 99.9253C681.145 101.647 683.728 102.508 686.771 102.508ZM765.544 49.7764H783.201V115H766.204V103.229H765.484C763.962 107.112 761.48 110.195 758.036 112.478C754.593 114.72 750.489 115.841 745.724 115.841C741.36 115.841 737.516 114.86 734.193 112.898C730.87 110.896 728.287 108.053 726.446 104.37C724.604 100.646 723.683 96.2817 723.683 91.2769V49.7764H741.46V88.2139C741.46 90.7363 741.921 92.9585 742.842 94.8804C743.802 96.7622 745.124 98.2236 746.805 99.2646C748.527 100.266 750.529 100.766 752.811 100.766C755.053 100.806 757.155 100.306 759.117 99.2646C761.079 98.1836 762.641 96.6221 763.802 94.5801C764.963 92.5381 765.544 90.0757 765.544 87.1929V49.7764ZM808.702 115H790.924V49.7764H807.861V61.1875H808.582C810.063 57.3438 812.505 54.3408 815.909 52.1787C819.352 50.0166 823.456 48.9355 828.221 48.9355C832.705 48.9355 836.629 49.9165 839.992 51.8784C843.396 53.8403 846.018 56.6831 847.86 60.4067C849.742 64.0903 850.683 68.4346 850.683 73.4395V115H832.905V76.5024C832.905 73.8599 832.445 71.5776 831.524 69.6558C830.643 67.7339 829.302 66.2725 827.5 65.2715C825.738 64.2305 823.636 63.71 821.194 63.71C818.712 63.71 816.529 64.2505 814.648 65.3315C812.766 66.3726 811.304 67.9141 810.263 69.9561C809.222 71.998 808.702 74.4204 808.702 77.2231V115ZM892.64 63.1094H853.602V49.7764H892.64V63.1094ZM880.388 34.1611V94.9404C880.388 96.6221 880.628 97.9434 881.108 98.9043C881.629 99.8252 882.33 100.486 883.21 100.886C884.131 101.287 885.252 101.487 886.574 101.487C887.174 101.527 887.915 101.527 888.796 101.487C889.677 101.447 890.558 101.407 891.438 101.367L893.541 101.187V115.24C890.818 115.681 887.715 115.901 884.231 115.901C879.827 115.901 876.003 115.24 872.76 113.919C869.517 112.558 866.995 110.516 865.193 107.793C863.431 105.03 862.55 101.567 862.55 97.4028V34.1611H880.388ZM933.936 69.1753C933.536 66.853 932.394 65.0112 930.513 63.6499C928.631 62.2886 926.208 61.6079 923.246 61.6079C921.324 61.6079 919.602 61.8882 918.08 62.4487C916.559 63.0093 915.338 63.79 914.417 64.791C913.536 65.792 913.096 66.9331 913.096 68.2144C913.096 69.7358 913.756 71.0571 915.078 72.1782C916.399 73.2993 918.541 74.1602 921.504 74.7607L933.275 77.1631C939.561 78.4844 944.246 80.6064 947.329 83.5293C950.452 86.4121 952.034 90.1758 952.074 94.8203C952.034 99.0645 950.812 102.808 948.41 106.051C946.008 109.254 942.624 111.757 938.26 113.559C933.896 115.36 928.851 116.261 923.125 116.261C917.32 116.261 912.295 115.44 908.051 113.799C903.847 112.117 900.523 109.755 898.081 106.712C895.639 103.629 894.177 99.9653 893.697 95.7212H911.534C911.975 98.2437 913.196 100.166 915.198 101.487C917.2 102.768 919.862 103.389 923.185 103.349C925.308 103.389 927.189 103.148 928.831 102.628C930.473 102.067 931.734 101.287 932.615 100.286C933.496 99.2446 933.936 98.0435 933.936 96.6821C933.936 95.0005 933.215 93.6191 931.774 92.5381C930.372 91.417 928.15 90.5361 925.107 89.8955L914.297 87.7334C908.091 86.5322 903.386 84.3701 900.183 81.2471C897.02 78.084 895.438 74.1001 895.438 69.2954C895.438 65.1714 896.559 61.5679 898.802 58.4849C901.044 55.4019 904.227 53.0396 908.351 51.3979C912.515 49.7563 917.4 48.9355 923.005 48.9355C928.411 48.9355 933.135 49.7563 937.179 51.3979C941.263 53.0396 944.426 55.3818 946.668 58.4248C948.951 61.4678 950.252 65.0513 950.572 69.1753H933.936Z' class='fill-black dark:fill-white')
        div.w-full
            div.w-full.rounded-xl.bg-white.shadow-md.my-2(class='max-xs:px-3 max-xs:py-2 min-sm:px-5 min-sm:py-3 dark:bg-zinc-900')
                div.w-full
                    div.w-full.my-2
                        h3.font-semibold.text-3xl QR 로그인
                        h3.font-regular.text-md.-mt-1.whitespace-nowrap 핸드폰으로 안전하고 간편하게 로그인하세요.
                div.w-full.flex.justify-start.items-center.gap-3.border-l-4.pl-3.overflow-x-auto(class='dark:border-zinc-700' @click='select(userinfo.uuid)')
                    div.flex-grow.min-w-0.flex.justify-between.items-center
                        div.flex-grow.min-w-0
                            h3.font-semibold.text-md.whitespace-nowrap {{ data.browser }}에서 {{ data.applicationName }}에 로그인을 시도하였습니다.
                            h3.font-regular.text-sm.whitespace-nowrap.-mt-1 만료일시 : {{ (data.expiresAt ?? '').replace('T', ' ').replace('+09:00', '') }}
                div.w-full(v-if='!data.userUuid')
                    div.w-full.my-3
                        h3.font-semibold.text-md 계정 목록
                        h3.font-regular.text-sm.-mt-1 위 브라우저에서 로그인 할 계정을 선택해주세요.
                    div.w-full.flex.flex-wrap.gap-2
                        //- div.w-full.relative.flex.justify-start.items-center.group(v-for='userinfo in users' class='max-xs:overflow-x-auto min-sm:overflow-hidden')
                        //-     div.transition-all.cursor-pointer.w-full.flex.justify-start.items-center.gap-3.border.rounded-lg.p-3.overflow-x-auto(class='hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800' @click='select(userinfo.id)')
                        //-         div.w-12.h-12.border(class='max-xs:hidden')
                        //-         div.flex-grow.min-w-0.flex.justify-between.items-center
                        //-             div.flex-grow.min-w-0
                        //-                 h3.font-semibold.text-md.whitespace-nowrap {{ userinfo.profile.nickname }} ({{ userinfo.username }})
                        //-                 h3.font-regular.text-sm.whitespace-nowrap.-mt-1 {{ userinfo.emails[0].email_address }}
                        //-                 h3.font-regular.text-sm.whitespace-nowrap.-mt-1.text-zinc-600(class='dark:text-zinc-400') {{ userinfo.uuid }}
                        div.w-full.relative.flex.justify-start.items-center.group(v-for='userinfo in users' class='max-xs:overflow-x-auto min-sm:overflow-hidden')
                            div.transition-all.cursor-pointer.w-full.flex.justify-start.items-center.gap-3.border.rounded-lg.p-3.overflow-x-auto(class='dark:border-zinc-700' @click='select(userinfo.id)')
                                div.w-12.h-12.min-w-12.border(class='max-xs:hidden')
                                div.flex-grow.min-w-0.flex.justify-between.items-center
                                    div.flex-grow.min-w-0
                                        h3.font-semibold.text-md.whitespace-nowrap {{ userinfo.profile.first_name }}{{ userinfo.profile.middle_name }}{{ userinfo.profile.last_name }} ({{ userinfo.username }})
                                        h3.font-regular.text-sm.whitespace-nowrap.-mt-1 {{ userinfo.emails[0].email_address }}
                                        h3.font-regular.text-sm.whitespace-nowrap.-mt-1.text-zinc-600(class='dark:text-zinc-400') {{ userinfo.id }}
                div.w-full(v-else)
                    div.w-full.my-3
                        h3.font-semibold.text-md 인증코드
                        h3.font-regular.text-sm.-mt-1 브라우저 속 인증코드를 골라 선택해주세요.
                    div.w-full.flex.justify-center.items-center.gap-3
                        div.transition-all.cursor-pointer.w-fit.px-2.py-1.bg-zinc-200.rounded-lg(v-for='verificationCode in data.dummyVerificationCode' class='dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600' @click='verify(verificationCode)') {{ verificationCode }}
        div.w-full.h-8.rounded-xl.mt-2
            div.w-full.h-full.flex.justify-center.items-center.overflow-x-auto
                ins.w-full.h-8.adsbygoogle.overflow-hidden(style='display: block; height: 2rem;' data-ad-client='ca-pub-7316884810353041' data-ad-slot='4003729895' data-ad-format='horizontal' data-full-width-responsive='true')
        div.w-full
            h3.font-light.text-xs Copyright &copy; 2023{{ `-${ new Date().getFullYear() }` }} Luna co. All rights Reserved.
            h3.font-light.text-xs
                | 루나 운영본부 개발팀
                span.mx-2
                nuxt-link.inline-block.cursor-pointer 이용약관
                span.mx-1 &middot;
                nuxt-link.inline-block.cursor-pointer 개인정보처리방침
                span.mx-1 &middot;
                nuxt-link.inline-block.cursor-pointer 사업자정보
</template>