export type Language = 'zh' | 'en'

export const translations = {
  zh: {
    // App 組件
    app: {
      title: '🚗 車輛救援',
      locating: '定位中...',
      gpsError: '無法獲取位置，使用台北預設位置',
      fetchRepairError: '獲取維修廠失敗:',
      selectRepair: '選擇維修廠',
      emergencySent: '✅ 緊急救援請求已發送',
      requestRepair: '請求救援',
      cancel: '取消',
      distance: '距離',
      rating: '評分',
      phone: '電話',
      availableTime: '可用時間',
      skills: '技能',
    },

    // RepairAdmin 組件
    admin: {
      title: '🔧 廠商管理系統',
      login: '救援廠商登錄',
      repairId: '廠商 ID',
      repairIdPlaceholder: '輸入廠商 ID (例: 1, 2, 3...)',
      repairName: '廠商名稱',
      repairNamePlaceholder: '輸入廠商名稱',
      loginBtn: '登入系統',
      demoTips: '📝 測試廠商資料',
      online: '● 在線',
      logout: '登出',
      managementSystem: '廠商管理系統',
      pendingRequests: '待機救援請求',
      acceptRequest: '接受請求',
      onWay: '出發',
      arrived: '已到達',
      completeRequest: '完成請求',
      requestDetails: '救援請求詳情',
      userId: '用戶 ID',
      location: '位置',
      status: '狀態',
      pending: '待機',
      accepted: '已接受',
      onWayStatus: '出發中',
      arrivedStatus: '已到達',
      requestHistory: '請求歷史',
      noRequests: '沒有待機請求',
    },

    // 地圖
    map: {
      yourLocation: '你的位置',
      repairShops: '維修廠',
      mapLoaded: 'Google 地圖已加載',
      apiKeyMissing: '⚠️ Google Maps API 密鑰未設置',
    },

    // 設定
    settings: {
      language: '語言',
      chinese: '中文',
      english: 'English',
      settings: '設定',
    },

    // 通知
    notifications: {
      requestSent: '救援請求已發送',
      rescueAccepted: '救援已接受',
      repairOnWay: '維修店正在趕來',
      repairArrived: '維修店已到達',
      newRequest: '🚨 新救援請求！',
      accepted: '已接受您的救援請求！',
      onWay: '正在趕往你的位置，預計 3-5 分鐘到達',
      arrived: '已到達現場，請確認',
    },
  },

  en: {
    // App 組件
    app: {
      title: '🚗 Vehicle Rescue',
      locating: 'Locating...',
      gpsError: 'Unable to get location, using Taipei default position',
      fetchRepairError: 'Failed to fetch repair shops:',
      selectRepair: 'Select Repair Shop',
      emergencySent: '✅ Emergency rescue request sent',
      requestRepair: 'Request Rescue',
      cancel: 'Cancel',
      distance: 'Distance',
      rating: 'Rating',
      phone: 'Phone',
      availableTime: 'Available Time',
      skills: 'Skills',
    },

    // RepairAdmin 組件
    admin: {
      title: '🔧 Repair Shop Management',
      login: 'Repair Shop Login',
      repairId: 'Shop ID',
      repairIdPlaceholder: 'Enter shop ID (e.g., 1, 2, 3...)',
      repairName: 'Shop Name',
      repairNamePlaceholder: 'Enter shop name',
      loginBtn: 'Login',
      demoTips: '📝 Demo Shop Data',
      online: '● Online',
      logout: 'Logout',
      managementSystem: 'Management System',
      pendingRequests: 'Pending Rescue Requests',
      acceptRequest: 'Accept',
      onWay: 'On the Way',
      arrived: 'Arrived',
      completeRequest: 'Complete',
      requestDetails: 'Request Details',
      userId: 'User ID',
      location: 'Location',
      status: 'Status',
      pending: 'Pending',
      accepted: 'Accepted',
      onWayStatus: 'On the Way',
      arrivedStatus: 'Arrived',
      requestHistory: 'Request History',
      noRequests: 'No pending requests',
    },

    // 地圖
    map: {
      yourLocation: 'Your Location',
      repairShops: 'Repair Shops',
      mapLoaded: 'Google Maps Loaded',
      apiKeyMissing: '⚠️ Google Maps API Key Not Set',
    },

    // 設定
    settings: {
      language: 'Language',
      chinese: '中文',
      english: 'English',
      settings: 'Settings',
    },

    // 通知
    notifications: {
      requestSent: 'Rescue request sent',
      rescueAccepted: 'Rescue accepted',
      repairOnWay: 'Repair shop is on the way',
      repairArrived: 'Repair shop has arrived',
      newRequest: '🚨 New rescue request!',
      accepted: 'has accepted your rescue request!',
      onWay: 'is on the way, ETA 3-5 minutes',
      arrived: 'has arrived at the scene, please confirm',
    },
  },
}

export const getTranslation = (language: Language) => translations[language]
