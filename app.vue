<script setup lang='ts'>
const { $globalConfig, $sessionInitlization, $modal } = useNuxtApp()

onBeforeMount(async () => {
  await $sessionInitlization()
})
onMounted(async () => {
  $globalConfig.network = window.navigator.onLine
  window.addEventListener('online', () => { $globalConfig.network = true })
  window.addEventListener('offline', () => {
    $globalConfig.network = false
    $modal.add('alert', '인터넷 연결 필요', '네트워크 연결이 해제되었어요.<br>루나 통합계정은 인터넷이 없을 경우 작동하지 않아요.<br>네트워크(Wi-Fi 또는 모바일 데이터 등)에 연결한 후 이용해주세요.')
  })
})
</script>

<template lang='pug'>
loading-view(:status='($developMode ? false : $globalConfig.network == false) || $loadingView.status')
NuxtPage
</template>

<style>
html {
  @apply bg-indigo-100;
  @apply dark:bg-black;
  @apply text-black;
  @apply dark:text-gray-300;
}
html, body, div#__nuxt, div#__layout {
  width: 100%;
  height: 100%;
}
body *:not(script):not(style):not(span) {
  display: block;
}
* {
  -webkit-box-sizing: border-box !important;
  -moz-box-sizing: border-box !important;
  -ms-box-sizing: border-box !important;
  box-sizing: border-box !important;
  font-family: Pretendard,system-ui,-apple-system,BlinkMacSystemFont,Roboto,"Helvetica Neue","Segoe UI","Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic",sans-serif;
}


.page-enter-active,.page-leave-active {
  transition: opacity 0.25s ease-in-out, transform 0.25s ease-in-out;
}
.page-enter {
  opacity: 0;
  transform: translate3d(15px, 0, 0);
  height: 100%;
  width: 100%;
}
.page-leave-to {
  opacity: 0;
  transform: translate3d(-15px, 0, 0);
  height: 100%;
  width: 100%;
}
</style>