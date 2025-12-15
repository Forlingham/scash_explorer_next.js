import { getTranslation, Locale } from '@/i18n/i18n-provider'

function detectLocaleFromLocalStorage() {
  if (typeof window !== 'undefined') {
    const localStorageLocale = document.cookie
      .split('; ')
      .find((row) => row.startsWith('locale='))
      ?.split('=')[1] as Locale | null
    if (localStorageLocale && ['zh', 'en', 'ru'].includes(localStorageLocale)) {
      return localStorageLocale
    }
  }
  return 'en'
}

export function getClientTranslations(locale?: Locale) {
  // 如果没有传入locale，自动检测
  const detectedLocale = locale || detectLocaleFromLocalStorage()

  return {
    t: getTranslation(detectedLocale),
    locale: detectedLocale
  }
}
