import { useState, useEffect, useRef } from 'react'
import { MapPin, Phone, CheckCircle, Truck, MapPin as MapPinIcon, Clock, X } from 'lucide-react'
import Map from './Map'
import LanguageSettings from './LanguageSettings'
import { useLanguage } from './LanguageContext'
import './RepairAdmin.css'

interface RescueRequest {
  id: string
  userId: string
  repairId: string
  lat: number
  lng: number
  status: 'pending' | 'accepted' | 'on_way' | 'arrived'
  timestamp: Date
  userPhone?: string
  vehicleType?: string
}

interface Repair {
  id: string
  name: string
  lat: number
  lng: number
  skills: string[]
}

interface AdminNotification {
  id: string
  type: 'request_received' | 'accepted' | 'rejected'
  message: string
  timestamp: number
}

export default function RepairAdmin() {
  const { t } = useLanguage()
  const [repairId, setRepairId] = useState('')
  const [repairName, setRepairName] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [requests, setRequests] = useState<RescueRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<RescueRequest | null>(null)
  const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>([])
  const wsRef = useRef<WebSocket | null>(null)

  // 廠商登錄
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (repairId && repairName) {
      setIsLoggedIn(true)
      connectWebSocket()
    }
  }

  // 連接 WebSocket
  const connectWebSocket = () => {
    const ws = new WebSocket('ws://localhost:3001')

    ws.onopen = () => {
      console.log('✅ 廠商 WebSocket 已連接')
      console.log(`   即將發送註冊: repairId=${repairId}, repairName=${repairName}`)
      // 廠商註冊
      ws.send(JSON.stringify({
        type: 'register',
        role: 'repair',
        repairId: repairId,
        repairName: repairName,
      }))
      console.log(`   註冊消息已發送`)
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log(`📨 廠商收到消息:`, data)

        // 接收新的救援請求
        if (data.type === 'rescue_request') {
          console.log(`🚨 處理救援請求:`, data.request)
          const newRequest: RescueRequest = {
            id: data.request.id,
            userId: data.request.userId,
            repairId: data.request.repairId,
            lat: data.request.lat,
            lng: data.request.lng,
            status: 'pending',
            timestamp: new Date(data.request.timestamp),
            userPhone: '0912-345-678',
            vehicleType: 'Toyota Corolla',
          }

          setRequests((prev) => [newRequest, ...prev])
          console.log(`✅ 救援請求已添加到列表`)

          // 添加通知
          const notif: AdminNotification = {
            id: Math.random().toString(36).substring(7),
            type: 'request_received',
            message: data.message,
            timestamp: Date.now(),
          }
          setAdminNotifications((prev) => [...prev, notif])

          // 自動移除通知
          setTimeout(() => {
            setAdminNotifications((prev) => prev.filter((n) => n.id !== notif.id))
          }, 5000)
        }
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
  }

  // 接受救援請求
  const handleAcceptRequest = (request: RescueRequest) => {
    setSelectedRequest({ ...request, status: 'accepted' })
    setRequests((prev) =>
      prev.map((r) => (r.id === request.id ? { ...r, status: 'accepted' } : r))
    )

    // 透過 WebSocket 通知用戶
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'accept_rescue',
        requestId: request.id,
        repairName: repairName,
        eta: '5-10分鐘',
      }))
    }

    const notif: AdminNotification = {
      id: Math.random().toString(36).substring(7),
      type: 'accepted',
      message: `✅ 已接受 ${request.id}`,
      timestamp: Date.now(),
    }
    setAdminNotifications((prev) => [...prev, notif])
  }

  // 出發更新
  const handleOnWay = (request: RescueRequest) => {
    setSelectedRequest({ ...request, status: 'on_way' })
    setRequests((prev) =>
      prev.map((r) => (r.id === request.id ? { ...r, status: 'on_way' } : r))
    )

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'on_way',
        repairName: repairName,
        requestId: request.id,
      }))
    }
  }

  // 已到達更新
  const handleArrived = (request: RescueRequest) => {
    setSelectedRequest({ ...request, status: 'arrived' })
    setRequests((prev) =>
      prev.map((r) => (r.id === request.id ? { ...r, status: 'arrived' } : r))
    )

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'arrived',
        repairName: repairName,
        requestId: request.id,
      }))
    }
  }

  // 移除完成的請求
  const handleCompleteRequest = (requestId: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== requestId))
    setSelectedRequest(null)
  }

  if (!isLoggedIn) {
    return (
      <div className="admin-login">
        <div className="login-container">
          <div className="login-header">
            <h1>{t('admin.title')}</h1>
            <p>{t('admin.login')}</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="repairId">{t('admin.repairId')}</label>
              <input
                id="repairId"
                type="text"
                placeholder={t('admin.repairIdPlaceholder')}
                value={repairId}
                onChange={(e) => setRepairId(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="repairName">{t('admin.repairName')}</label>
              <input
                id="repairName"
                type="text"
                placeholder={t('admin.repairNamePlaceholder')}
                value={repairName}
                onChange={(e) => setRepairName(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="login-btn">
              {t('admin.loginBtn')}
            </button>
          </form>

          <div className="demo-tips">
            <h3>{t('admin.demoTips')}</h3>
            <ul>
              <li>ID: 1, 名稱: 24小時快速維修廠</li>
              <li>ID: 2, 名稱: 台北陸上救援中心</li>
              <li>ID: 3, 名稱: 天天開24小時廠</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-app">
      {/* 頭部 */}
      <header className="admin-header">
        <div className="header-left">
          <h1>🔧 {repairName}</h1>
          <span className="online-status">● {t('admin.online')}</span>
        </div>
        <div className="header-right">
          <span className="repair-id">{t('admin.repairId')}: {repairId}</span>
          <LanguageSettings />
          <button
            className="logout-btn"
            onClick={() => {
              setIsLoggedIn(false)
              if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.close()
              }
              setRequests([])
              setSelectedRequest(null)
            }}
          >
            {t('admin.logout')}
          </button>
        </div>
      </header>

      {/* 主內容 */}
      <div className="admin-content">
        {/* 請求列表 */}
        <div className="requests-panel">
          <h2>
            <Clock size={20} /> {t('admin.pendingRequests')} ({requests.length})
          </h2>

          <div className="requests-queue">
            {requests.length === 0 ? (
              <div className="empty-state">
                <p>{t('admin.noRequests')}</p>
                <small>等待用戶發送請求...</small>
              </div>
            ) : (
              requests.map((request) => (
                <div
                  key={request.id}
                  className={`request-item ${
                    selectedRequest?.id === request.id ? 'selected' : ''
                  } ${request.status}`}
                  onClick={() => setSelectedRequest(request)}
                >
                  <div className="request-header">
                    <span className="request-id">{request.id}</span>
                    <span className={`status-badge ${request.status}`}>
                      {request.status === 'pending' && t('admin.pending')}
                      {request.status === 'accepted' && t('admin.accepted')}
                      {request.status === 'on_way' && t('admin.onWayStatus')}
                      {request.status === 'arrived' && t('admin.arrivedStatus')}
                    </span>
                  </div>

                  <div className="request-details">
                    <div className="detail-row">
                      <MapPin size={16} />
                      <span>
                        {request.lat.toFixed(4)}, {request.lng.toFixed(4)}
                      </span>
                    </div>
                    <div className="detail-row">
                      <Phone size={16} />
                      <span>{request.userPhone}</span>
                    </div>
                  </div>

                  {request.status === 'pending' && (
                    <button
                      className="accept-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAcceptRequest(request)
                      }}
                    >
                      ✓ {t('admin.acceptRequest')}
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* 地圖和詳情 */}
        <div className="details-panel">
          {selectedRequest ? (
            <>
              {/* 地圖 */}
              <div className="map-area">
                <Map
                  userLocation={{
                    lat: selectedRequest.lat,
                    lng: selectedRequest.lng,
                  }}
                  repairs={[
                    {
                      id: repairId,
                      name: repairName,
                      lat: 25.0330 + Math.random() * 0.01,
                      lng: 121.5654 + Math.random() * 0.01,
                      distance: 0.5,
                    },
                  ]}
                  onRepairClick={() => {}}
                />
              </div>

              {/* 操作面板 */}
              <div className="action-panel">
                <h3>
                  <MapPinIcon size={18} /> {t('admin.requestDetails')}
                </h3>

                <div className="details-box">
                  <div className="detail-item">
                    <strong>請求編號</strong>
                    <span>{selectedRequest.id}</span>
                  </div>
                  <div className="detail-item">
                    <strong>{t('app.phone')}</strong>
                    <span>{selectedRequest.userPhone}</span>
                  </div>
                  <div className="detail-item">
                    <strong>車型</strong>
                    <span>{selectedRequest.vehicleType}</span>
                  </div>
                  <div className="detail-item">
                    <strong>{t('admin.location')}</strong>
                    <span>
                      {selectedRequest.lat.toFixed(4)}, {selectedRequest.lng.toFixed(4)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <strong>{t('admin.status')}</strong>
                    <span className={`status-badge ${selectedRequest.status}`}>
                      {selectedRequest.status === 'pending' && t('admin.pending')}
                      {selectedRequest.status === 'accepted' && t('admin.accepted')}
                      {selectedRequest.status === 'on_way' && t('admin.onWayStatus')}
                      {selectedRequest.status === 'arrived' && t('admin.arrivedStatus')}
                    </span>
                  </div>
                </div>

                {/* 操作按鈕 */}
                <div className="action-buttons">
                  {selectedRequest.status === 'pending' && (
                    <>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleAcceptRequest(selectedRequest)}
                      >
                        <CheckCircle size={18} /> {t('admin.acceptRequest')}
                      </button>
                    </>
                  )}

                  {selectedRequest.status === 'accepted' && (
                    <button
                      className="btn btn-warning"
                      onClick={() => handleOnWay(selectedRequest)}
                    >
                      <Truck size={18} /> {t('admin.onWay')}
                    </button>
                  )}

                  {selectedRequest.status === 'on_way' && (
                    <button
                      className="btn btn-success"
                      onClick={() => handleArrived(selectedRequest)}
                    >
                      <MapPinIcon size={18} /> {t('admin.arrived')}
                    </button>
                  )}

                  {selectedRequest.status === 'arrived' && (
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleCompleteRequest(selectedRequest.id)}
                    >
                      <CheckCircle size={18} /> {t('admin.completeRequest')}
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="empty-details">
              <p>請選擇一個救援請求查看詳情</p>
            </div>
          )}
        </div>
      </div>

      {/* 通知 */}
      <div className="admin-notifications">
        {adminNotifications.map((notif) => (
          <div key={notif.id} className={`notification ${notif.type}`}>
            <p>{notif.message}</p>
            <button
              onClick={() =>
                setAdminNotifications((prev) =>
                  prev.filter((n) => n.id !== notif.id)
                )
              }
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
