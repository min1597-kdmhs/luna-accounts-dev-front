<script setup lang='ts'>
import axios from 'axios'

const { $modal, $router, $loadingView, $toast, $errorConvert, $userinfo, $time } = useNuxtApp()
const runtimeConfig = useRuntimeConfig()
const $route = useRoute()

onBeforeMount(async () => {

})
onMounted(async () => {
    $loadingView.status = true
    if(typeof window.localStorage.getItem('access_token') !== 'string') {
        $router.push({ name: 'index' })
    }
    try {
        const _result = await axios.get(`${ runtimeConfig.public.apiEndpoint }/portal/userinfo`, { headers: { authorization: `${ window.localStorage.getItem('access_token') }` } })
        if(_result.status == 200) {
            $userinfo.id = _result.data.data.id
            $userinfo.username = _result.data.data.username
            $userinfo.profile = _result.data.data.profile
            $userinfo.birthday = _result.data.data.birthday
            $userinfo.gender = _result.data.data.gender
            $userinfo.emails = _result.data.data.emails
            $userinfo.phones = _result.data.data.phones
            $userinfo.authorized_apps = _result.data.data.authorized_apps
            $userinfo.owned_apps = _result.data.data.owned_apps
            $userinfo.last_password_updated_at = _result.data.data.last_password_updated_at
            $userinfo.last_authorized_at = _result.data.data.last_authorized_at

            $loadingView.status = false
        } else throw { response: _result }
    } catch(_error) {
        $loadingView.status = false
        $modal.add('alert', '요청을 처리하지 못했어요.', `오류가 발생하여 요청을 처리하지 못했어요.<br>자세한 내용은 아래를 확인해주세요.<br><div class='border rounded-lg p-3 mt-1'><b>${ $errorConvert(_error) }</b></div>`, undefined, true)
    }
})
</script>

<template lang='pug'>
toast
modal
div.w-full.h-full.flex.justify-center.items-center.px-3.relative
    div.w-full.max-w-4xl
        div.w-full
            div.w-full.flex.justify-center.itmes-center
                svg.w-fit.h-16.mb-1.cursor-pointer(width='957' height='147' viewBox='0 0 957 147' fill='none' xmlns='http://www.w3.org/2000/svg')
                    path(d='M38.1918 2.66602H69.8283L43.2524 82.2312C42.0646 85.7876 41.4706 87.5658 41.8254 88.9813C42.136 90.2204 42.909 91.2936 43.9859 91.9807C45.2161 92.7657 47.0908 92.7657 50.8403 92.7657H88.937L82.6652 111.543C82.0087 113.508 81.6804 114.491 81.0723 115.217C80.5353 115.859 79.8459 116.355 79.0673 116.662C78.1855 117.008 77.1494 117.008 75.0772 117.008H11.1066C7.35705 117.008 5.4823 117.008 4.25209 116.223C3.17523 115.536 2.4022 114.463 2.09163 113.224C1.73684 111.808 2.33077 110.03 3.51865 106.474L19.0959 59.8371L28.6438 31.2515L33.4178 16.9588V16.9588C34.7515 12.9659 32.6965 8.63211 28.761 7.1377L16.9954 2.67L38.1918 2.66602ZM227.728 2.66602L203.198 76.104C200.351 84.6323 195.697 92.0813 189.24 98.4507C182.84 104.821 175.117 109.743 166.075 113.218C157.052 116.64 147.433 118.351 137.221 118.351C126.952 118.351 118.505 116.64 111.877 113.218C105.267 109.743 100.862 104.821 98.6602 98.4507C96.514 92.0813 96.8653 84.6323 99.7139 76.104L111.978 39.385L118.111 21.0255V21.0255C118.402 20.1532 118.548 19.717 118.644 19.3264C119.695 15.068 117.848 10.6217 114.089 8.36109C113.744 8.15374 113.333 7.94915 112.509 7.53999L102.705 2.67L124.243 2.66602H155.879L132.221 73.4981C131.008 77.1305 130.786 80.3681 131.557 83.2109C132.329 86.0536 133.941 88.291 136.392 89.923C138.9 91.5549 142.068 92.3709 145.898 92.3709C149.783 92.3709 153.525 91.5549 157.123 89.923C160.775 88.291 163.91 86.0536 166.524 83.2109C169.139 80.3681 171.053 77.1305 172.266 73.4981L194.1 8.1315C194.756 6.16605 195.084 5.18332 195.693 4.45681C196.23 3.81524 196.919 3.31868 197.698 3.01261C198.579 2.66602 199.615 2.66602 201.688 2.66602H227.728ZM300.813 117.008H279.717C277.746 117.008 276.76 117.008 275.91 116.689C275.159 116.406 274.486 115.947 273.95 115.35C273.343 114.675 272.984 113.757 272.266 111.921L250.299 55.7239C250.207 55.49 249.982 55.3361 249.731 55.3361V55.3361V55.3361C249.482 55.3361 249.261 55.4952 249.182 55.7311L228.716 117.008H208.186C204.437 117.008 202.562 117.008 201.332 116.223C200.255 115.536 199.482 114.463 199.171 113.224C198.816 111.808 199.41 110.03 200.598 106.474L233.446 8.13155C234.102 6.16609 234.43 5.18336 235.038 4.45683C235.575 3.81526 236.265 3.31869 237.043 3.01262C237.925 2.66602 238.961 2.66602 241.034 2.66602H262.329L285.649 63.7239C285.754 63.9986 286.017 64.1801 286.311 64.1801V64.1801C286.617 64.1801 286.888 63.985 286.984 63.6955L305.543 8.13164C306.199 6.16614 306.527 5.18339 307.135 4.45686C307.672 3.81528 308.362 3.3187 309.141 3.01262C310.022 2.66602 311.058 2.66602 313.131 2.66602H339.005L300.813 117.008Z' fill='#8459FF')
                    path(d='M319.792 116.848C316.048 116.848 314.176 116.848 312.947 116.064C311.87 115.378 311.097 114.306 310.786 113.069C310.429 111.655 311.02 109.879 312.2 106.326L344.774 8.26517C345.428 6.29543 345.755 5.31056 346.363 4.58235C346.9 3.9393 347.59 3.44148 348.37 3.13462C349.252 2.78711 350.29 2.78711 352.366 2.78711H387.318L406.262 59.8174L415.734 88.3325L420.47 102.59V102.59C421.248 104.931 421.636 106.101 422.256 107.1C423.062 108.401 424.156 109.5 425.454 110.312C426.451 110.935 427.62 111.328 429.958 112.115L444.025 116.85L425.206 116.848H398.761C396.633 116.848 395.569 116.848 394.67 116.486C393.877 116.167 393.179 115.649 392.643 114.983C392.035 114.229 391.726 113.211 391.107 111.175L367.604 33.8809C367.523 33.6124 367.275 33.429 366.995 33.429V33.429C366.714 33.429 366.467 33.6122 366.385 33.8804L341.079 116.848H319.792ZM379.131 71.7906L386.005 94.3975H350.925L357.825 71.7906H379.131Z' fill='#8459FF')
                    path(d='M376.835 71.7998C377.975 71.8047 378.795 70.7075 378.467 69.6163L378.285 69.0098L379.135 71.7998H376.835V71.7998Z' fill='#8459FF')
                    path(d='M383.835 94.3903H386.005L386.855 97.1903L386.628 96.4454C386.252 95.2193 385.118 94.3841 383.835 94.3903V94.3903Z' fill='#8459FF')
                    path(d='M447.522 117L477.552 30.0352H500.734L530.824 117H511.425L489.503 49.6743H488.783L466.801 117H447.522ZM512.266 82.8267V96.9404H475.35L479.95 82.8267H512.266Z' class='fill-black dark:fill-white')
                    path(d='M560.335 118.261C553.769 118.261 548.063 116.86 543.219 114.057C538.374 111.214 534.67 107.25 532.108 102.166C529.545 97.0806 528.264 91.2349 528.264 84.6284C528.264 77.9819 529.565 72.1162 532.168 67.0312C534.771 61.9463 538.474 58.0024 543.279 55.1997C548.083 52.3569 553.729 50.9355 560.215 50.9355C565.781 50.9355 570.726 51.9565 575.05 53.9985C579.374 56.0005 582.757 58.8833 585.2 62.647C587.682 66.4106 589.043 70.7549 589.284 75.6797H572.467C572.147 73.5176 571.466 71.6157 570.425 69.9741C569.384 68.3325 568.003 67.0713 566.281 66.1904C564.6 65.2695 562.678 64.7891 560.516 64.749C557.673 64.7891 555.19 65.5698 553.068 67.0913C550.946 68.6128 549.285 70.855 548.083 73.8179C546.882 76.7407 546.282 80.2441 546.282 84.3281C546.282 88.4922 546.862 92.0557 548.023 95.0186C549.225 97.9414 550.886 100.204 553.008 101.805C555.13 103.367 557.633 104.127 560.516 104.087C562.598 104.127 564.479 103.727 566.161 102.886C567.843 102.005 569.224 100.764 570.305 99.1626C571.426 97.561 572.147 95.5991 572.467 93.2769H589.284C589.003 98.2417 587.642 102.606 585.2 106.37C582.797 110.133 579.454 113.056 575.17 115.138C570.886 117.22 565.941 118.261 560.335 118.261ZM623.493 118.261C616.927 118.261 611.221 116.86 606.376 114.057C601.532 111.214 597.828 107.25 595.266 102.166C592.703 97.0806 591.422 91.2349 591.422 84.6284C591.422 77.9819 592.723 72.1162 595.326 67.0312C597.928 61.9463 601.632 58.0024 606.436 55.1997C611.241 52.3569 616.887 50.9355 623.373 50.9355C628.938 50.9355 633.883 51.9565 638.207 53.9985C642.532 56.0005 645.915 58.8833 648.357 62.647C650.84 66.4106 652.201 70.7549 652.441 75.6797H635.625C635.305 73.5176 634.624 71.6157 633.583 69.9741C632.542 68.3325 631.161 67.0713 629.439 66.1904C627.757 65.2695 625.835 64.7891 623.673 64.749C620.83 64.7891 618.348 65.5698 616.226 67.0913C614.104 68.6128 612.442 70.855 611.241 73.8179C610.04 76.7407 609.439 80.2441 609.439 84.3281C609.439 88.4922 610.02 92.0557 611.181 95.0186C612.382 97.9414 614.044 100.204 616.166 101.805C618.288 103.367 620.79 104.127 623.673 104.087C625.755 104.127 627.637 103.727 629.319 102.886C631 102.005 632.382 100.764 633.463 99.1626C634.584 97.561 635.305 95.5991 635.625 93.2769H652.441C652.161 98.2417 650.8 102.606 648.357 106.37C645.955 110.133 642.612 113.056 638.328 115.138C634.043 117.22 629.099 118.261 623.493 118.261ZM686.651 118.261C680.124 118.261 674.439 116.86 669.594 114.057C664.789 111.254 661.086 107.331 658.483 102.286C655.881 97.2007 654.579 91.3149 654.579 84.6284C654.579 77.9019 655.881 72.0161 658.483 66.9712C661.086 61.8862 664.789 57.9424 669.594 55.1396C674.439 52.3369 680.124 50.9355 686.651 50.9355C693.097 50.9355 698.742 52.3369 703.587 55.1396C708.472 57.9424 712.196 61.8862 714.758 66.9712C717.321 72.0161 718.602 77.9019 718.602 84.6284C718.602 91.3149 717.321 97.2007 714.758 102.286C712.196 107.331 708.472 111.254 703.587 114.057C698.742 116.86 693.097 118.261 686.651 118.261ZM686.771 104.508C689.694 104.508 692.196 103.647 694.278 101.925C696.36 100.204 697.922 97.8413 698.963 94.8384C700.004 91.7954 700.524 88.3521 700.524 84.5083C700.524 80.6245 700.004 77.1812 698.963 74.1782C697.922 71.1753 696.36 68.813 694.278 67.0913C692.196 65.3696 689.694 64.5088 686.771 64.5088C683.728 64.5088 681.145 65.3696 679.023 67.0913C676.901 68.813 675.3 71.1753 674.219 74.1782C673.178 77.1812 672.637 80.6245 672.597 84.5083C672.637 88.3521 673.178 91.7954 674.219 94.8384C675.3 97.8413 676.901 100.204 679.023 101.925C681.145 103.647 683.728 104.508 686.771 104.508ZM765.544 51.7764H783.201V117H766.204V105.229H765.484C763.962 109.112 761.48 112.195 758.036 114.478C754.593 116.72 750.489 117.841 745.724 117.841C741.36 117.841 737.516 116.86 734.193 114.898C730.87 112.896 728.287 110.053 726.446 106.37C724.604 102.646 723.683 98.2817 723.683 93.2769V51.7764H741.46V90.2139C741.46 92.7363 741.921 94.9585 742.842 96.8804C743.802 98.7622 745.124 100.224 746.805 101.265C748.527 102.266 750.529 102.766 752.811 102.766C755.053 102.806 757.155 102.306 759.117 101.265C761.079 100.184 762.641 98.6221 763.802 96.5801C764.963 94.5381 765.544 92.0757 765.544 89.1929V51.7764ZM808.702 117H790.924V51.7764H807.861V63.1875H808.582C810.063 59.3438 812.505 56.3408 815.909 54.1787C819.352 52.0166 823.456 50.9355 828.221 50.9355C832.705 50.9355 836.629 51.9165 839.992 53.8784C843.396 55.8403 846.018 58.6831 847.86 62.4067C849.742 66.0903 850.683 70.4346 850.683 75.4395V117H832.905V78.5024C832.905 75.8599 832.445 73.5776 831.524 71.6558C830.643 69.7339 829.302 68.2725 827.5 67.2715C825.738 66.2305 823.636 65.71 821.194 65.71C818.712 65.71 816.529 66.2505 814.648 67.3315C812.766 68.3726 811.304 69.9141 810.263 71.9561C809.222 73.998 808.702 76.4204 808.702 79.2231V117ZM892.64 65.1094H853.602V51.7764H892.64V65.1094ZM880.388 36.1611V96.9404C880.388 98.6221 880.628 99.9434 881.108 100.904C881.629 101.825 882.33 102.486 883.21 102.886C884.131 103.287 885.252 103.487 886.574 103.487C887.174 103.527 887.915 103.527 888.796 103.487C889.677 103.447 890.558 103.407 891.438 103.367L893.541 103.187V117.24C890.818 117.681 887.715 117.901 884.231 117.901C879.827 117.901 876.003 117.24 872.76 115.919C869.517 114.558 866.995 112.516 865.193 109.793C863.431 107.03 862.55 103.567 862.55 99.4028V36.1611H880.388ZM933.936 71.1753C933.536 68.853 932.394 67.0112 930.513 65.6499C928.631 64.2886 926.208 63.6079 923.246 63.6079C921.324 63.6079 919.602 63.8882 918.08 64.4487C916.559 65.0093 915.338 65.79 914.417 66.791C913.536 67.792 913.096 68.9331 913.096 70.2144C913.096 71.7358 913.756 73.0571 915.078 74.1782C916.399 75.2993 918.541 76.1602 921.504 76.7607L933.275 79.1631C939.561 80.4844 944.246 82.6064 947.329 85.5293C950.452 88.4121 952.034 92.1758 952.074 96.8203C952.034 101.064 950.812 104.808 948.41 108.051C946.008 111.254 942.624 113.757 938.26 115.559C933.896 117.36 928.851 118.261 923.125 118.261C917.32 118.261 912.295 117.44 908.051 115.799C903.847 114.117 900.523 111.755 898.081 108.712C895.639 105.629 894.177 101.965 893.697 97.7212H911.534C911.975 100.244 913.196 102.166 915.198 103.487C917.2 104.768 919.862 105.389 923.185 105.349C925.308 105.389 927.189 105.148 928.831 104.628C930.473 104.067 931.734 103.287 932.615 102.286C933.496 101.245 933.936 100.043 933.936 98.6821C933.936 97.0005 933.215 95.6191 931.774 94.5381C930.372 93.417 928.15 92.5361 925.107 91.8955L914.297 89.7334C908.091 88.5322 903.386 86.3701 900.183 83.2471C897.02 80.084 895.438 76.1001 895.438 71.2954C895.438 67.1714 896.559 63.5679 898.802 60.4849C901.044 57.4019 904.227 55.0396 908.351 53.3979C912.515 51.7563 917.4 50.9355 923.005 50.9355C928.411 50.9355 933.135 51.7563 937.179 53.3979C941.263 55.0396 944.426 57.3818 946.668 60.4248C948.951 63.4678 950.252 67.0513 950.572 71.1753H933.936Z' class='fill-black dark:fill-white')
        div.w-full.rounded-xl.bg-white.shadow-md.my-2(class='max-xs:px-3 max-xs:py-2 min-sm:px-5 min-sm:py-3 dark:bg-zinc-900')
            div.w-full
                div.w-full.flex.items-start
                    div.w-screen.h-16.bg-white.fixed.bottom-0.left-0.flex.items-cetner.border-t.border-zinc-400(class='dark:border-zinc-800 min-md:hidden dark:bg-zinc-900')
                        div.transition-all.cursor-pointer.flex.justify-center.items-center(class='w-1/5 hover:text-indigo-600')
                            div.text-center
                                i.fas.fa-bullhorn.text-lg
                                h3.font-light.text-xs.-mt-1 공지사항
                        nuxt-link.transition-all.cursor-pointer.flex.justify-center.items-center(class='w-1/5 hover:text-indigo-600' :to="{ name: 'panel-application-authorized' }" :class="{ 'text-indigo-600': [ 'panel-application-authorized', 'panel-application-own' ].includes($route.name) }")
                            div.text-center
                                i.fas.fa-store.text-lg
                                h3.font-light.text-xs.-mt-1 어플리케이션
                        nuxt-link.transition-all.cursor-pointer.flex.justify-center.items-center(class='w-1/5 hover:text-indigo-600' :to="{ name: 'panel' }" :class="{ 'text-indigo-600': $route.name == 'panel' }")
                            div.text-center
                                i.fas.fa-home.text-lg
                                h3.font-light.text-xs.-mt-1 홈
                        div.transition-all.cursor-pointer.flex.justify-center.items-center(class='w-1/5 hover:text-indigo-600')
                            div.text-center
                                i.fas.fa-history.text-lg
                                h3.font-light.text-xs.-mt-1 활동기록
                        div.transition-all.cursor-pointer.flex.justify-center.items-center(class='w-1/5 hover:text-indigo-600')
                            div.text-center
                                i.fas.fa-user-headset.text-lg
                                h3.font-light.text-xs.-mt-1 고객센터
                    div.w-52.flex.flex-wrap.gap-1(class='min-w-[13rem] max-sm:hidden')
                        h3.font-semibold.text-xs.mt-2 대시보드
                        nuxt-link.cursor-pointer.transition-all.w-full.px-5.py-2.flex.justify-between.items-center.rounded-lg.mr-5(:to="{ name: 'panel' }" class='hover:ml-2 hover:mr-3 hover:bg-zinc-100 dark:hover:bg-zinc-800' :class="{ 'bg-zinc-100 dark:bg-zinc-800 ml-2 !mr-3': $route.name == 'panel' }")
                            h3.font-normal.text-sm 내 정보
                            i.far.fa-chevron-right.text-xs
                        div.cursor-pointer.transition-all.w-full.px-5.py-2.flex.justify-between.items-center.rounded-lg.mr-5(class='hover:ml-2 hover:mr-3 hover:bg-zinc-100 dark:hover:bg-zinc-800')
                            h3.font-normal.text-sm 활동기록
                            i.far.fa-chevron-right.text-xs
                        h3.font-semibold.text-xs.mt-2 어플리케이션 관리
                        nuxt-link.cursor-pointer.transition-all.w-full.px-5.py-2.flex.justify-between.items-center.rounded-lg.mr-5(:to="{ name: 'panel-application-own' }" class='hover:ml-2 hover:mr-3 hover:bg-zinc-100 dark:hover:bg-zinc-800' :class="{ 'bg-zinc-100 dark:bg-zinc-800 ml-2 !mr-3': $route.name == 'panel-application-own' }")
                            h3.font-normal.text-sm 내 어플리케이션
                            i.far.fa-chevron-right.text-xs
                        nuxt-link.cursor-pointer.transition-all.w-full.px-5.py-2.flex.justify-between.items-center.rounded-lg.mr-5(:to="{ name: 'panel-application-authorized' }" class='hover:ml-2 hover:mr-3 hover:bg-zinc-100 dark:hover:bg-zinc-800' :class="{ 'bg-zinc-100 dark:bg-zinc-800 ml-2 !mr-3': $route.name == 'panel-application-authorized' }")
                            h3.font-normal.text-sm 승인한 어플리케이션
                            i.far.fa-chevron-right.text-xs
                        h3.font-semibold.text-xs.mt-2 루나 통합 계정
                        div.cursor-pointer.transition-all.w-full.px-5.py-2.flex.justify-between.items-center.rounded-lg.mr-5(class='hover:ml-2 hover:mr-3 hover:bg-zinc-100 dark:hover:bg-zinc-800')
                            h3.font-normal.text-sm 공지사항
                            i.far.fa-chevron-right.text-xs
                        div.cursor-pointer.transition-all.w-full.px-5.py-2.flex.justify-between.items-center.rounded-lg.mr-5(class='hover:ml-2 hover:mr-3 hover:bg-zinc-100 dark:hover:bg-zinc-800')
                            h3.font-normal.text-sm 고객센터
                            i.far.fa-chevron-right.text-xs
                    div.flex-grow.min-w-0
                        nuxt-page
        div.w-full.h-20.bg-white.rounded-xl.mt-2
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

<style lang='css'>

    @keyframes qr-login-desktop-in {
        0% {
            opacity: 0;
            transform: scale(1.3);
        }
        100% {
            opacity: 1;
            transform: scale(1);
        }
    }
    @keyframes qr-login-mobile-in {
        0% {
            opacity: 0;
        }
        100% {
            opacity: 1;
        }
    }
    @keyframes qr-login-mobile-margin-bottom-in {
        0% {
            margin-bottom: -100vh;
        }
        100% {
            margin-bottom: 0rem;
        }
    }
    @media (min-width: 768px) {
        .qr-login-enter-active {
            animation: qr-login-desktop-in .5s;
        }
        .qr-login-leave-active {
            animation: qr-login-desktop-in .5s reverse;
        }
    }
    @media (max-width: 767px) {
        .qr-login-enter-active {
            animation: qr-login-mobile-in .5s;
        }
        .qr-login-leave-active {
            animation: qr-login-mobile-in .5s reverse;
        }
        .qr-login-enter-active > div > div {
            animation: qr-login-mobile-margin-bottom-in .5s;
        }
        .qr-login-leave-active > div > div {
            animation: qr-login-mobile-margin-bottom-in .5s reverse;
        }
    }
</style>