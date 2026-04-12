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

async function executeRecaptcha(): Promise<string> {
  return new Promise((resolve, reject) => {
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

  if (!template || !email || !message) {
    throw new Error('Tous les champs sont requis.')
  }

  // Validation de l'email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw new Error('Adresse email invalide.')
  }

  // 1️⃣ Obtenir token reCAPTCHA
  const recaptchaToken = await executeRecaptcha()

  // 2️⃣ Envoyer email via EmailJS
  await emailjs.send(
    serviceId,
    template,
    {
      message: message,
      email: email
      //'g-recaptcha-response': recaptchaToken
    },
    publicKey
  )
}