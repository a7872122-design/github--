# 車輛救援即時媒合 APP

## 快速開始

### 1️⃣ 配置 Google Maps API

為了使用真實的地圖功能，需要：

1. **獲取 Google Maps API 密鑰**
   - 前往 [Google Cloud Console](https://console.cloud.google.com)
   - 創建新項目或選擇現有項目
   - 啟用 **Maps JavaScript API**
   - 創建 **API 密鑰**（限制為瀏覽器使用）
   - 複製密鑰

2. **配置環境變數**
   - 在項目根目錄創建 `.env.local` 檔案
   - 添加：`VITE_GOOGLE_MAPS_API_KEY=your_api_key_here`
   - 替換 `your_api_key_here` 為你的實際密鑰

### 2️⃣ 安裝依賴
```bash
npm install
```

### 3️⃣ 啟動開發伺服器
```bash
npm run dev
```
開啟 http://localhost:5173

### 4️⃣ 啟動後端 API（另一個終端）
```bash
npm run server
```

## 🎯 核心功能

✅ **即時 GPS 定位** - 使用瀏覽器 Geolocation API 獲取精確位置  
✅ **Google Maps 整合** - 展示用戶和維修廠的實時位置  
✅ **智能媒合** - 基於距離自動篩選最近的 3-5 家維修廠  
✅ **一鍵救援** - 單一動作發送救援請求至廠商  
✅ **實時信息** - 顯示距離、預計到達時間、評分、技能標籤  

## 📦 技術棧

- **前端**: React 18 + TypeScript + Vite
- **地圖**: @react-google-maps/api
- **圖標**: Lucide React
- **後端**: Node.js + Express
- **地理計算**: Haversine 公式（精確距離計算）

## 🗂️ 項目結構

```
vehicle-rescue-app/
├── src/
│   ├── App.tsx          # 主應用組件
│   ├── App.css          # 應用樣式
│   ├── Map.tsx          # Google Maps 組件
│   ├── main.tsx         # React 入口
│   └── index.css        # 全局樣式
├── public/              # 靜態資源
├── server.js            # Express 後端 API
├── .env.local           # 環境配置（需要手動建立）
├── package.json         # 依賴配置
├── vite.config.ts       # Vite 配置
└── index.html           # HTML 模板
```

## 🚀 使用流程

1. 打開 APP，瀏覽器要求定位授權
2. 系統自動獲取 GPS 座標
3. Google Maps 顯示用戶位置（藍點）+ 維修廠位置（紅點）
4. 右側列表展示 3 家最近的維修廠
5. 點擊廠商卡片，地圖會聚焦該廠商
6. 點擊「滑動請求救援」按鈕發送請求
7. 廠商接收到您的實時座標並前往救援

## 🔄 API 端點

### GET /api/location
取得用戶 GPS 座標
```json
{
  "lat": 25.0330,
  "lng": 121.5654,
  "accuracy": 7.5
}
```

### GET /api/repairs?lat=25.03&lng=121.56
搜尋指定座標附近的維修廠（按距離排序）
```json
[
  {
    "id": "1",
    "name": "24小時快速維修廠",
    "lat": 25.0430,
    "lng": 121.5654,
    "distance": 1.1,
    "skills": ["爆胎", "接電", "拖吊"]
  }
]
```

### POST /api/request-rescue
發送救援請求
```json
{
  "userId": "user_123",
  "repairId": "repair_1",
  "lat": 25.0330,
  "lng": 121.5654
}
```

## 🔄 下一步改進

- [ ] 實況推送通知 (WebSocket)
- [ ] 廠商管理後台
- [ ] 支付模塊整合 (Line Pay / Apple Pay)
- [ ] 用戶認證系統 (JWT)
- [ ] 評價與回饋系統
- [ ] 多語言支持
- [ ] 離線地圖快取
