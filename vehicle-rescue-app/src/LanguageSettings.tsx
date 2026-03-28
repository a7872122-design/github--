import { useState } from 'react'
import { Settings } from 'lucide-react'
import { useLanguage } from './LanguageContext'
import './LanguageSettings.css'

export default function LanguageSettings() {
  const { language, setLanguage, t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const toggleSettings = () => {
    setIsOpen(!isOpen)
  }

  const handleLanguageChange = (lang: 'zh' | 'en') => {
    setLanguage(lang)
    setIsOpen(false)
  }

  return (
    <div className="language-settings">
      <button className="settings-btn" onClick={toggleSettings} title={t('settings.settings')}>
        <Settings size={20} />
      </button>

      {isOpen && (
        <div className="settings-panel">
          <div className="settings-header">
            <h3>{t('settings.language')}</h3>
          </div>

          <div className="language-options">
            <button
              className={`language-option ${language === 'zh' ? 'active' : ''}`}
              onClick={() => handleLanguageChange('zh')}
            >
              <span className="lang-flag">🇹🇼</span>
              <span className="lang-name">{t('settings.chinese')}</span>
              {language === 'zh' && <span className="checkmark">✓</span>}
            </button>

            <button
              className={`language-option ${language === 'en' ? 'active' : ''}`}
              onClick={() => handleLanguageChange('en')}
            >
              <span className="lang-flag">🇺🇸</span>
              <span className="lang-name">{t('settings.english')}</span>
              {language === 'en' && <span className="checkmark">✓</span>}
            </button>
          </div>

          <div className="settings-footer">
            <small>Language: {language === 'zh' ? '繁體中文' : 'English'}</small>
          </div>
        </div>
      )}

      {isOpen && <div className="settings-overlay" onClick={() => setIsOpen(false)}></div>}
    </div>
  )
}
