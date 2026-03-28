import { useState, useEffect, useRef } from 'react'
import { MapPin, AlertCircle, Phone, Clock, Star, Loader } from 'lucide-react'
import Map from './Map'
import Notifications from './Notifications'
import LanguageSettings from './LanguageSettings'
import { useLanguage } from './LanguageContext'
import './App.css'

interface GPS {
  lat: number
  lng: number
}

interface Notification {
  id: string
  type: 'request_sent' | 'rescue_accepted' | 'repair_on_way' | 'repair_arrived'
  message: string
  timestamp: number
}

interface Repair {
  id: string
  name: string
  lat: number
  lng: number
  distance: number
  rating: number
  phone: string
  availableTime: string
  skills: string[]
}

export default function App() {
  const { t } = useLanguage()
  const [gps, setGps] = useState<GPS | null>(null)
  const [loading, setLoading] = useState(true)
  const [repairs, setRepairs] = useState<Repair[]>([])
  const [selectedRepair, setSelectedRepair] = useState<Repair | null>(null)
  const [emergencyActive, setEmergencyActive] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const wsRef = useRef<WebSocket | null>(null)

  console.log('📱 App 已初始化')

  // 使用瀏覽器 Geolocation API 獲取真實 GPS
  useEffect(() => {
    console.log('🌍 開始獲取位置...')
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          const newGPS = { lat: latitude, lng: longitude }
          console.log('✅ 位置已獲取:', newGPS)
          setGps(newGPS)
          fetchRepairs(newGPS)
          setLoading(false)
        },
        (error) => {
          console.warn('⚠️ 無法獲取位置:', error.message)
          // 降級：使用模擬座標
          const mockGPS = { lat: 25.0330, lng: 121.5654 }
          setGps(mockGPS)
          fetchRepairs(mockGPS)
          setLoading(false)
        }
      )
    } else {
      // 不支援 Geolocation
      const mockGPS = { lat: 25.0330, lng: 121.5654 }
      setGps(mockGPS)
      fetchRepairs(mockGPS)
      setLoading(false)
    }
  }, [])

  // WebSocket 連接
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3001')

    ws.onopen = () => {
      console.log('✅ WebSocket 已連接')
      // 註冊為用戶端
      ws.send(JSON.stringify({
        type: 'register',
        role: 'user',
        userId: 'user_' + Math.random().toString(36).substring(7),
      }))
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        // 新增通知
        const notif: Notification = {
          id: Math.random().toString(36).substring(7),
          type: data.type,
          message: data.message,
          timestamp: Date.now(),
        }
        
        setNotifications((prev) => [...prev, notif])
        
        // 3 秒後自動移除通知
        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n.id !== notif.id))
        }, 3000)
      } catch (error) {
        console.error('WebSocket 訊息解析錯誤:', error)
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket 連接錯誤:', error)
    }

    ws.onclose = () => {
      console.log('💔 WebSocket 連接已關閉')
    }

    wsRef.current = ws

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close()
      }
    }
  }, [])

  // 從後端 API 獲取維修廠
  const fetchRepairs = async (location: GPS) => {
    try {
      const response = await fetch(
        `/api/repairs?lat=${location.lat}&lng=${location.lng}`
      )
      const data = await response.json()
      
      // 計算距離並補充額外消息
      const enhancedRepairs: Repair[] = data.map((repair: any, index: number) => ({
        ...repair,
        rating: 4.6 + Math.random() * 0.4,
        phone: ['0912-345-678', '0933-456-789', '0955-678-901'][index] || '0980-123-456',
        availableTime: ['立即可到', '5分鐘', '8分鐘'][index] || '10分鐘',
        skills: [
          ['爆胎', '接電', '拖吊'],
          ['接電', '拖吊', '潤滑油'],
          ['爆胎', '機械維修'],
        ][index] || ['其他'],
      }))
      
      setRepairs(enhancedRepairs)
    } catch (error) {
      console.error('獲取維修廠失敗:', error)
    }
  }

  const handleEmergencyRequest = (repair: Repair) => {
    setEmergencyActive(true)
    setSelectedRepair(repair)

    // 透過 WebSocket 發送救援請求
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log(`🚀 發送救援請求 - repairId: ${repair.id}, 位置: ${gps?.lat || 25.0330}, ${gps?.lng || 121.5654}`)
      wsRef.current.send(JSON.stringify({
        type: 'request_rescue',
        userId: 'user_' + Math.random().toString(36).substring(7),
        repairId: repair.id,
        lat: gps?.lat || 25.0330,
        lng: gps?.lng || 121.5654,
      }))
      console.log(`✅ 救援請求已發送`)
    } else {
      console.error(`❌ WebSocket 未準備好: readyState=${wsRef.current?.readyState}`)
    }

    setTimeout(() => setEmergencyActive(false), 3000)
  }

  return (
    <div className="app">
      {/* 頂部狀態欄 */}
      <header className="header">
        <h1>{t('app.title')}</h1>
        <div className="status">
          {loading ? (
            <span className="loading-text">
              <Loader size={16} className="spin" /> {t('app.locating')}
            </span>
          ) : (
            <span className="online-badge">● {t('admin.online')}</span>
          )}
          <LanguageSettings />
          <a href="/?admin=true" className="admin-link" title="進入廠商管理系統">
            🔧 廠商入口
          </a>
        </div>
      </header>

      {/* 主內容區域 */}
      <div style={{ display: 'flex', flex: 1, gap: '12px', padding: '0 12px 12px', minHeight: 0 }}>
        {/* 地圖區域 */}
        <div className="map-container">
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>精準定位中...</p>
            </div>
          ) : (
            <>
              {gps && (
                <Map
                  userLocation={gps}
                  repairs={repairs}
                  onRepairClick={(repairId) => {
                    const repair = repairs.find((r) => r.id === repairId)
                    if (repair) setSelectedRepair(repair)
                  }}
                />
              )}
              {!gps && <p style={{ padding: '20px' }}>{t('app.gpsError')}</p>}
            </>
          )}
        </div>

        {/* 維修廠列表 */}
        <div className="repairs-container" style={{ flex: '0 0 35%', minWidth: '200px' }}>
          <h2>
            <AlertCircle size={20} /> {t('app.selectRepair')}
          </h2>

          {!loading && (
            <div className="repairs-list">
              {repairs.slice(0, 3).map((repair) => (
                <div
                  key={repair.id}
                  className={`repair-card ${
                    selectedRepair?.id === repair.id ? 'selected' : ''
                  }`}
                  onClick={() => setSelectedRepair(repair)}
                >
                  <div className="repair-header">
                    <h3>{repair.name}</h3>
                    <div className="rating">
                      <Star size={16} fill="#fbbf24" color="#fbbf24" />
                      {repair.rating.toFixed(1)}
                    </div>
                  </div>

                  <div className="repair-info">
                    <div className="info-row">
                      <MapPin size={16} />
                      <span>{t('app.distance')}: {repair.distance.toFixed(1)} km</span>
                    </div>
                    <div className="info-row">
                      <Clock size={16} />
                      <span>{t('app.availableTime')}: {repair.availableTime}</span>
                    </div>
                    <div className="info-row">
                      <Phone size={16} />
                      <span>{t('app.phone')}: {repair.phone}</span>
                    </div>
                  </div>

                  <div className="skills-tags">
                    {repair.skills.map((skill) => (
                      <span key={skill} className="skill-tag">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <button
                    className={`emergency-btn ${
                      selectedRepair?.id === repair.id ? 'active' : ''
                    }`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEmergencyRequest(repair)
                    }}
                    disabled={emergencyActive && selectedRepair?.id !== repair.id}
                  >
                    {emergencyActive && selectedRepair?.id === repair.id
                      ? '請求中...'
                      : '◀滑動請求救援▶'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 底部提示 */}
      <footer className="footer">
        <small>緊急狀況？觸發滑動動作即可發送救援請求</small>
      </footer>

      {/* 實況推送通知 */}
      <Notifications
        notifications={notifications}
        onDismiss={(id) => setNotifications((prev) => prev.filter((n) => n.id !== id))}
      />
    </div>
  )
}
