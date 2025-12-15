import { headers, cookies } from 'next/headers'
import { Locale, getTranslation } from '@/i18n/i18n-provider'

// Server-side locale detection function that can safely use next/headers
export async function detectLocaleFromHeaders(): Promise<Locale> {
  try {
    // 优先从cookie获取语言偏好
    const cookieStore = await cookies()
    const cookieLocale = cookieStore.get('locale')?.value as Locale
    if (cookieLocale && ['zh', 'en', 'ru'].includes(cookieLocale)) {
      return cookieLocale
    }

    // 从Accept-Language头获取语言偏好
    const headersList = await headers()
    const acceptLanguage = headersList.get('accept-language') || ''

    // 解析Accept-Language头
    const languages = acceptLanguage
      .split(',')
      .map((lang: string) => {
        const [code, q = '1'] = lang.trim().split(';q=')
        return { code: code.toLowerCase(), quality: parseFloat(q) }
      })
      .sort((a, b) => b.quality - a.quality)

    let detectedLocale: Locale | undefined
    // 查找支持的语言
    for (const { code } of languages) {
      if (code.startsWith('zh')) {
        detectedLocale = 'zh'
        break
      }
      if (code.startsWith('en')) {
        detectedLocale = 'en'
        break
      }
      if (code.startsWith('ru')) {
        detectedLocale = 'ru'
        break
      }
    }

    // 注意：在Server Component中不能设置cookie，只能读取
    // cookie的设置需要在客户端或Server Action中进行
    return detectedLocale || 'en' // 默认语言
  } catch (error) {
    // 在非服务端环境或出错时返回默认语言
    console.warn('Failed to detect locale from headers:', error)
  }

  return 'en' // 默认语言
}

// Server Action for setting locale cookie
export async function setLocaleCookie(locale: Locale) {
  'use server'

  const cookieStore = await cookies()
  cookieStore.set('locale', locale, {
    path: '/',
    maxAge: 31536000 // 1年
  })
}

// Server-side translation function with auto locale detection
export async function getServerTranslations(locale?: Locale) {
  // 如果没有传入locale，自动检测
  const detectedLocale = locale || (await detectLocaleFromHeaders())

  return {
    t: getTranslation(detectedLocale),
    locale: detectedLocale
  }
}
