import express from 'express'
import cors from 'cors'
import { WebSocketServer } from 'ws'
import { createServer } from 'http'

const app = express()
const server = createServer(app)
const PORT = 3001

// WebSocket 伺服器
const wss = new WebSocketServer({ server })

// 儲存連接的客戶端
const clients = new Map()

app.use(cors())
app.use(express.json())

// 計算兩點間的距離（Haversine 公式）
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // 地球半徑（公里）
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// WebSocket 連接處理
wss.on('connection', (ws) => {
  const clientId = Math.random().toString(36).substring(7)
  clients.set(clientId, { ws, type: null })

  console.log(`📱 新客戶端連接: ${clientId}`)

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message)

      // 客戶端註冊（分為用戶端或廠商端）
      if (data.type === 'register') {
        const client = clients.get(clientId)
        client.type = data.role // 'user' 或 'repair'
        client.repairId = data.repairId
        console.log(`✅ ${data.role === 'user' ? '用戶' : '廠商'} 已連接: ${clientId}`)
        console.log(`   類型: ${data.role}, repairId: ${data.repairId} (${typeof data.repairId})`)
      }

      // 用戶發送救援請求
      if (data.type === 'request_rescue') {
        const request = {
          id: `REQ-${Date.now()}`,
          userId: data.userId,
          repairId: data.repairId,
          lat: data.lat,
          lng: data.lng,
          status: 'pending', // pending -> accepted -> on_way -> arrived
          timestamp: new Date(),
        }

        console.log(`🆘 救援請求: ${request.id} -> 廠商 ${data.repairId}`)
        console.log(`   正在查找廠商...`)
        
        let targetFound = false
        // 通知對應的廠商
        clients.forEach((client, cId) => {
          console.log(`   檢查客戶端 ${cId}: type=${client.type}, repairId=${client.repairId}, readyState=${client.ws.readyState}`)
          if (client.type === 'repair' && String(client.repairId) === String(data.repairId) && client.ws.readyState === 1) {
            console.log(`   ✅ 找到匹配的廠商: ${cId}`)
            targetFound = true
            client.ws.send(JSON.stringify({
              type: 'rescue_request',
              request,
              message: `🚨 新救援請求！用戶位置: ${data.lat.toFixed(4)}, ${data.lng.toFixed(4)}`,
            }))
          }
        })
        
        if (!targetFound) {
          console.log(`   ⚠️ 未找到廠商 ${data.repairId} 的連接`)
        }

        // 回傳確認給用戶
        ws.send(JSON.stringify({
          type: 'request_sent',
          requestId: request.id,
          message: '✅ 救援請求已發送',
        }))
      }

      // 廠商確認接單
      if (data.type === 'accept_rescue') {
        console.log(`✔️ 廠商接單: ${data.requestId}`)

        // 通知對應的用戶
        clients.forEach((client) => {
          if (client.type === 'user' && client.ws.readyState === 1) {
            client.ws.send(JSON.stringify({
              type: 'rescue_accepted',
              requestId: data.requestId,
              repairName: data.repairName,
              eta: '5-10分鐘',
              message: `✅ ${data.repairName} 已接受您的救援請求！`,
            }))
          }
        })
      }

      // 廠商出發
      if (data.type === 'on_way') {
        console.log(`🚗 廠商出發: ${data.repairName}`)

        clients.forEach((client) => {
          if (client.type === 'user' && client.ws.readyState === 1) {
            client.ws.send(JSON.stringify({
              type: 'repair_on_way',
              repairName: data.repairName,
              eta: '3-5分鐘',
              message: `🚗 ${data.repairName} 正在趕往你的位置，預計 3-5 分鐘到達`,
            }))
          }
        })
      }

      // 廠商已到達
      if (data.type === 'arrived') {
        console.log(`✨ 廠商已到達: ${data.repairName}`)

        clients.forEach((client) => {
          if (client.type === 'user' && client.ws.readyState === 1) {
            client.ws.send(JSON.stringify({
              type: 'repair_arrived',
              repairName: data.repairName,
              message: `✨ ${data.repairName} 已到達現場，請確認`,
            }))
          }
        })
      }
    } catch (error) {
      console.error('WebSocket 訊息錯誤:', error)
    }
  })

  ws.on('close', () => {
    clients.delete(clientId)
    console.log(`💔 客戶端斷開連接: ${clientId}`)
  })

  ws.on('error', (error) => {
    console.error('WebSocket 錯誤:', error)
  })
})

// REST API 端點

// 模擬 GPS 定位 API
app.get('/api/location', (req, res) => {
  res.json({
    lat: 25.0330 + Math.random() * 0.01,
    lng: 121.5654 + Math.random() * 0.01,
    accuracy: Math.random() * 10 + 5,
  })
})

// 模擬媒合搜尋 API - 返回距離最近的維修廠
app.get('/api/repairs', (req, res) => {
  const { lat, lng } = req.query
  const userLat = parseFloat(lat) || 25.0330
  const userLng = parseFloat(lng) || 121.5654

  // 在台北市周邊模擬5家維修廠
  const mockRepairs = [
    {
      id: '1',
      name: '24小時快速維修廠',
      lat: 25.0430,
      lng: 121.5654,
      skills: ['爆胎', '接電', '拖吊'],
    },
    {
      id: '2',
      name: '台北陸上救援中心',
      lat: 25.0330,
      lng: 121.5754,
      skills: ['接電', '拖吊', '潤滑油'],
    },
    {
      id: '3',
      name: '天天開24小時廠',
      lat: 25.0230,
      lng: 121.5654,
      skills: ['爆胎', '機械維修'],
    },
    {
      id: '4',
      name: '信義區快修服務',
      lat: 25.0330,
      lng: 121.5554,
      skills: ['電池更換', '雨刷更換'],
    },
    {
      id: '5',
      name: '永康街救援廠',
      lat: 25.0230,
      lng: 121.5554,
      skills: ['拖吊', '機械維修', '電路檢查'],
    },
  ]

  // 計算距離並排序
  const repairsWithDistance = mockRepairs
    .map((repair) => ({
      ...repair,
      distance: getDistance(userLat, userLng, repair.lat, repair.lng),
    }))
    .sort((a, b) => a.distance - b.distance)

  res.json(repairsWithDistance)
})

// 救援請求 API
app.post('/api/request-rescue', (req, res) => {
  const { userId, repairId, lat, lng } = req.body

  res.json({
    success: true,
    requestId: `REQ-${Date.now()}`,
    message: '救援請求已發送',
    estimatedTime: '5-10分鐘',
  })
})

server.listen(PORT, () => {
  console.log(`🚗 救援 API 伺服器運行於 http://localhost:${PORT}`)
  console.log(`🔌 WebSocket 實況推送已就緒`)
  console.log(`📍 GET /api/location - 獲取 GPS 定位`)
  console.log(`🔍 GET /api/repairs?lat=25.03&lng=121.56 - 搜尋附近維修廠`)
  console.log(`📞 ws://localhost:3001 - WebSocket 實況推送救援狀態`)
})
