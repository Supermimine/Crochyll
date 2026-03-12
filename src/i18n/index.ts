import { createI18n } from 'vue-i18n'
import { ref } from 'vue'
import en from '../locales/en.json'

export type MessageSchema = typeof en
export const currentLocale = ref<string>('fr')

export const i18n = createI18n<[MessageSchema], string>({
  locale: 'fr',
  fallbackLocale: 'en',
  messages: {},
  missing(locale, key) {
    console.warn(`Clé manquante: ${locale}.${key}`)
    return `??${key}??`
  }
})

async function loadLocaleMessages(locale: string) {
  const modules = import.meta.glob<{ default: Record<string, unknown> }>(
    '../locales/**/*.json'
  )

  const messages: Record<string, unknown> = {}

  for (const path in modules) {
    if (path.endsWith(`/${locale}.json`)) {
      const module = await modules[path]()
      Object.assign(messages, module.default)
    }
  }

  return messages
}

export async function setLocale(locale: string) {
  
  if (!i18n.global.availableLocales.includes(locale)) {
    const messages = await loadLocaleMessages(locale)
    i18n.global.setLocaleMessage(locale, messages as MessageSchema)
  }
  
  i18n.global.locale = locale
  currentLocale.value = locale
}

export default i18n