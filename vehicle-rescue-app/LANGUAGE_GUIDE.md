# 🌐 多語言功能使用指南

## 介紹

應用現已支持**中文 (繁體)** 和 **英文** 兩種語言。用戶可以通過頂部導航欄中的**齒輪圖標⚙️**輕鬆切換語言。

## 使用方法

### 1. 切換語言

**在用戶應用 (車輛救援頁面)**
- 點擊頂部右側的 **齒輪圖標 ⚙️**
- 選擇您想要的語言: **中文** 或 **English**
- 語言設定會自動保存，下次訪問應用時會保持該語言設定

**在廠商應用 (管理系統頁面)**
- 登入廠商系統後
- 點擊頂部右側的 **齒輪圖標 ⚙️**
- 選擇您想要的語言

### 2. 支持的語言

| 語言 | 代碼 | 上次使用 |
|------|------|---------|
| 繁體中文 | `zh` | ✅ 默認 |
| 英文 | `en` | ✅ 可選 |

### 3. 翻譯覆蓋範圍

✅ **已翻譯的部分**:
- 應用標題和標題
- 按鈕文本
- 表單標籤和佔位符
- 通知和消息
- 狀態標籤
- 菜單項

❌ **暫未翻譯**:
- 廠商名稱 (用戶輸入的數據)
- 技能標籤 (來自服務器的數據)

## 實現技術

### 文件結構

```
src/
├── i18n.ts                    # 翻譯定義和語言設定
├── LanguageContext.tsx        # React Context for 語言管理
├── LanguageSettings.tsx       # 語言切換UI組件
├── LanguageSettings.css       # 設定面板的樣式
├── App.tsx                    # 用戶應用 (更新以使用多語言)
├── RepairAdmin.tsx           # 廠商應用 (更新以使用多語言)
└── main.tsx                  # 應用入口 (包裹LanguageProvider)
```

### 核心概念

1. **翻譯文件** (`i18n.ts`)
   ```typescript
   export const translations = {
     zh: { /* 中文翻譯 */ },
     en: { /* 英文翻譯 */ }
   }
   ```

2. **語言上下文** (`LanguageContext.tsx`)
   - 使用 React Context 管理全局語言狀態
   - 與 localStorage 同步以持久化用戶選擇
   - 提供 `useLanguage()` hook

3. **UI 組件** (`LanguageSettings.tsx`)
   - 齒輪圖標按鈕
   - 語言選項面板
   - 自動關閉功能

### 使用 Hook

在任何組件中使用多語言翻譯：

```typescript
import { useLanguage } from './LanguageContext'

export default function MyComponent() {
  const { language, setLanguage, t } = useLanguage()
  
  // t() function 用於翻譯
  return <h1>{t('app.title')}</h1>
}
```

## 添加新的翻譯

1. 編輯 `src/i18n.ts`
2. 在相應的語言對象中添加新鍵值對

例如:
```typescript
export const translations = {
  zh: {
    myFeature: {
      button: '點擊我',
      title: '我的功能'
    }
  },
  en: {
    myFeature: {
      button: 'Click Me',
      title: 'My Feature'
    }
  }
}
```

3. 在組件中使用:
```typescript
<button>{t('myFeature.button')}</button>
```

## 瀏覽器兼容性

✅ 所有現代瀏覽器都支持:
- Chrome/Edge (推薦)
- Firefox
- Safari
- 移動瀏覽器

## 故障排除

### 問題: 語言不切換
**解決方案**: 
- 清除瀏覽器 localStorage (F12 → Application → Local Storage)
- 刷新頁面

### 問題: 某些文本未翻譯
**原因**: 這些文本可能來自服務器或外部 API
**解決方案**: 檢查 `i18n.ts` 以查看該文本是否已翻譯

## 性能影響

✅ **最小化**:
- 所有翻譯在應用加載時加載一次
- 語言切換不需要額外的 API 調用
- localStorage 用於本地持久化

## 未來改進

🔄 計劃中的功能:
- [ ] 添加更多語言 (日語、韓語等)
- [ ] RTL 語言支持 (阿拉伯語、希伯來語)
- [ ] 自動語言檢測 (基於瀏覽器設定)
- [ ] 離線翻譯支持

---

**更新日期**: 2026年3月25日
**版本**: 1.0.0
