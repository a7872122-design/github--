import { createContext, useState, useContext, ReactNode } from 'react'
import { Language, getTranslation } from './i18n'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (path: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    // 從 localStorage 讀取保存的語言設定，默認為中文
    const saved = localStorage.getItem('language') as Language | null
    return saved || 'zh'
  })

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
    // 更新 HTML lang 屬性
    document.documentElement.lang = lang === 'zh' ? 'zh-TW' : 'en-US'
  }

  const translation = getTranslation(language)

  const t = (path: string): string => {
    const keys = path.split('.')
    let value: any = translation

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key]
      } else {
        return path // 返回路徑如果找不到翻譯
      }
    }

    return typeof value === 'string' ? value : path
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}
