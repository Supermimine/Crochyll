import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/dist/vuetify.min.css'
import '@mdi/font/css/materialdesignicons.css'
import { router } from './tools/router'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import { getTheme } from "@/tools/appTools";
import { createHead } from '@unhead/vue/client'

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

const app = createApp(App)
const head = createHead()

app.use(head)
app.use(router)
app.use(vuetify)
app.mount('#app')