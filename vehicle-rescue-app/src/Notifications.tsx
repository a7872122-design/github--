import { useState, useEffect } from 'react'
import { Bell, X, CheckCircle, Truck, MapPin } from 'lucide-react'
import './Notifications.css'

interface Notification {
  id: string
  type: 'request_sent' | 'rescue_accepted' | 'repair_on_way' | 'repair_arrived'
  message: string
  timestamp: number
}

interface NotificationsProps {
  notifications: Notification[]
  onDismiss?: (id: string) => void
}

export default function Notifications({ notifications, onDismiss }: NotificationsProps) {
  if (notifications.length === 0) return null

  const getIcon = (type: string) => {
    switch (type) {
      case 'rescue_accepted':
        return <CheckCircle className="icon" />
      case 'repair_on_way':
        return <Truck className="icon" />
      case 'repair_arrived':
        return <MapPin className="icon" />
      default:
        return <Bell className="icon" />
    }
  }

  return (
    <div className="notifications-container">
      {notifications.map((notif) => (
        <div key={notif.id} className={`notification notification-${notif.type}`}>
          <div className="notification-content">
            {getIcon(notif.type)}
            <p>{notif.message}</p>
          </div>
          {onDismiss && (
            <button
              className="notification-close"
              onClick={() => onDismiss(notif.id)}
            >
              <X size={16} />
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
