import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/dist/vuetify.min.css'
import '@mdi/font/css/materialdesignicons.css'
import { router } from './router/router'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import { getTheme, language } from "@/tools/appTools";
import { createHead } from '@unhead/vue/client'
import { setLocale } from './i18n/index'
import i18n from './i18n';

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  theme: {
    defaultTheme: getTheme(),
  },
})

const defaultLocale = language();
setLocale(defaultLocale);

const app = createApp(App)
const head = createHead()

app.use(head)
app.use(router)
app.use(vuetify)
app.use(i18n)
app.mount('#app')