import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import RepairAdmin from './RepairAdmin.tsx'
import TestApp from './TestApp.tsx'
import { LanguageProvider } from './LanguageContext.tsx'
import './index.css'

// 根據 URL 參數決定顯示哪個應用
const params = new URLSearchParams(window.location.search)
const mode = params.get('mode') || 'user'

let AppComponent: any
if (mode === 'admin') {
  AppComponent = RepairAdmin
} else if (mode === 'test') {
  AppComponent = TestApp
} else {
  AppComponent = App
}

console.log('📱 啟動模式:', mode)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LanguageProvider>
      <AppComponent />
    </LanguageProvider>
  </React.StrictMode>,
)
