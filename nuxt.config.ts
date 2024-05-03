const _metadata = {
  title: 'Luna Accounts',
  description: '루나 통합 계정 서비스',
  keywords: 'Luna',
  theme_color: '#8459FF',
  type: 'website',
  image: '/thumbnail.png',
  site_name: 'Luna Accounts',
  url: 'https://accounts.lunas.kr'
}

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: 'luna-default',
      meta: [
        { charset: 'UTF-8' },
        { content: 'text/html; charset=utf-8', },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1' },

      /* ThemeColor */
        { name: 'theme-color', content: _metadata.theme_color },

      /* Default Tag */
        { name: 'title', content: _metadata.title },
        { name: 'description', content: _metadata.description },

      /* Twitter */
        { name: 'twitter:title', content: _metadata.title },
        { name: 'twitter:description', content: _metadata.description },
        { name: 'twitter:image', content: _metadata.image },
        { name: 'twitter:card', content: _metadata.type },

      /* OpenGraph */
        { property: 'og:title', content: _metadata.title },
        { property: 'og:description', content: _metadata.description },
        { property: 'og:keywords', content: _metadata.keywords },
        { property: 'og:type', content: _metadata.type },
        { property: 'og:site_name', content: _metadata.site_name },
        { property: 'og:url', content: _metadata.url },

        { name: 'format-detection', content: 'telephone=no' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.svg' },
        { rel: 'stylesheet', href: '/assets/fontawesome/css/all.min.css' },
        { rel: 'stylesheet', href: '/assets/xeicon/xeicon.min.css' },
        { rel: 'stylesheet', href: '/assets/pretendard/web/static/pretendard.css' }
      ],
      script: [
        { defer: true, hid: 'adsense', src: '/assets/js/adsense.js' }
      ]
    },
    pageTransition: { name: 'page', mode: 'out-in' }
  },
  devServer: {
    host: '0.0.0.0'
  },
  runtimeConfig: {
    public: {
      apiEndpoint: process.env.API_ENDPOINT,
      build: process.env.BUILD,
      oAuth: {
        id: process.env.oAuth_id,
        scope: process.env.oAuth_scope
      }
    }
  },
  devtools: { enabled: false },
  modules: [ '@nuxtjs/tailwindcss'/*, [ '@nuxtjs/google-adsense', { id: 'ca-pub-7316884810353041' }]*/ ],
})