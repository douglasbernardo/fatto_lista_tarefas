export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr:false,
  css: ['vuetify/lib/styles/main.sass','@mdi/font/css/materialdesignicons.min.css'],

  build: {
    transpile: ['vuetify'],
  },

  modules:[
    '@pinia/nuxt',
  ],

  compatibilityDate: '2024-10-29',
})