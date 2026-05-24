import emailjs from '@emailjs/browser'

const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY

export interface SendEmailParams {
  template: string
  email: string
  message: string
}

declare global {
  interface Window {
    grecaptcha: any
  }
}

const EMAIL_RATE_LIMIT = 3
const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000
const RATE_LIMIT_STORAGE_KEY = 'crochyll-email-rate-limit'

interface RateLimitRecord {
  count: number
  firstSendAt: number
}

type RateLimitStore = Record<string, RateLimitRecord>

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function getRateLimitStore(): RateLimitStore {
  if (typeof window === 'undefined' || !window.localStorage) {
    return {}
  }

  try {
    const raw = window.localStorage.getItem(RATE_LIMIT_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as RateLimitStore) : {}
  } catch {
    return {}
  }
}

function saveRateLimitStore(store: RateLimitStore) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return
  }

  window.localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(store))
}

function clearExpiredRateLimitEntries(store: RateLimitStore): RateLimitStore {
  const now = Date.now()
  Object.keys(store).forEach((key) => {
    if (now - store[key].firstSendAt > RATE_LIMIT_WINDOW_MS) {
      delete store[key]
    }
  })
  return store
}

function checkEmailRateLimit(email: string): string {
  const normalizedEmail = normalizeEmail(email)
  const store = clearExpiredRateLimitEntries(getRateLimitStore())
  const record = store[normalizedEmail]

  if (record && record.count >= EMAIL_RATE_LIMIT) {
    throw new Error(
      'Vous avez atteint la limite de 3 emails pour cette adresse sur 24 heures. Réessayez plus tard.'
    )
  }

  return normalizedEmail
}

function incrementEmailRateLimit(normalizedEmail: string) {
  const store = clearExpiredRateLimitEntries(getRateLimitStore())
  const now = Date.now()
  const record = store[normalizedEmail] ?? { count: 0, firstSendAt: now }

  if (now - record.firstSendAt > RATE_LIMIT_WINDOW_MS) {
    record.count = 0
    record.firstSendAt = now
  }

  record.count += 1
  record.firstSendAt = record.firstSendAt || now
  store[normalizedEmail] = record
  saveRateLimitStore(store)
}

async function executeRecaptcha(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!recaptchaSiteKey) {
      reject('reCAPTCHA Site Key non configurée')
      return
    }

    if (!window.grecaptcha) {
      reject('reCAPTCHA non chargé')
      return
    }

    window.grecaptcha.ready(() => {
      window.grecaptcha
        .execute(recaptchaSiteKey, { action: 'submit' })
        .then((token: string) => resolve(token))
        .catch((err: any) => reject(err))
    })
  })
}

export async function sendEmail(params: SendEmailParams): Promise<void> {
  const { template, email, message } = params

  if (!serviceId || !publicKey) {
    throw new Error('Les variables d\'environnement EmailJS ne sont pas configurées')
  }

  if (!template || !email || !message) {
    throw new Error('Tous les champs sont requis.')
  }

  // Validation de l'email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw new Error('Adresse email invalide.')
  }

  const normalizedEmail = checkEmailRateLimit(email)

  // 1️⃣ Obtenir token reCAPTCHA
  const recaptchaToken = await executeRecaptcha()

  // 2️⃣ Envoyer email via EmailJS
  await emailjs.send(
    serviceId,
    template,
    {
      message: message,
      email: email,
      'g-recaptcha-response': recaptchaToken
    },
    publicKey
  )

  incrementEmailRateLimit(normalizedEmail)
}