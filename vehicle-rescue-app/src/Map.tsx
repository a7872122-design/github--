import { useState, useCallback } from 'react'
import { GoogleMap, LoadScript, MarkerF, CircleF } from '@react-google-maps/api'
import { useLanguage } from './LanguageContext'

interface MapProps {
  userLocation: { lat: number; lng: number } | null
  repairs: Array<{
    id: string
    name: string
    lat: number
    lng: number
    distance: number
  }>
  onRepairClick?: (repairId: string) => void
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '12px',
}

const defaultCenter = {
  lat: 25.0330,
  lng: 121.5654,
}

export default function Map({ userLocation, repairs, onRepairClick }: MapProps) {
  const { t } = useLanguage()
  const [map, setMap] = useState<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  const onLoad = useCallback((map: any) => {
    setMap(map)
    setIsLoaded(true)
    console.log(`✅ ${t('map.mapLoaded')}`)
  }, [t])

  const onUnmount = useCallback(() => {
    setMap(null)
    setIsLoaded(false)
  }, [])

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        <p>{t('map.apiKeyMissing')}</p>
      </div>
    )
  }

  // 創建用戶位置 icon
  const userIcon = isLoaded
    ? {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#667eea',
        fillOpacity: 1,
        strokeColor: '#fff',
        strokeWeight: 2,
      }
    : undefined

  // 創建廠商位置 icon
  const repairIcon = isLoaded
    ? {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#ef4444',
        fillOpacity: 0.8,
        strokeColor: '#fff',
        strokeWeight: 2,
      }
    : undefined

  return (
    <LoadScript googleMapsApiKey={apiKey} libraries={['places']}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={userLocation || defaultCenter}
        zoom={14}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
        }}
      >
        {userLocation && (
          <>
            <MarkerF
              position={userLocation}
              title={t('map.yourLocation')}
              icon={userIcon}
            />
            <CircleF
              center={userLocation}
              radius={5000}
              options={{
                fillColor: '#667eea',
                fillOpacity: 0.1,
                strokeColor: '#667eea',
                strokeOpacity: 0.3,
                strokeWeight: 1,
              }}
            />
          </>
        )}

        {repairs.map((repair) => (
          <MarkerF
            key={repair.id}
            position={{ lat: repair.lat, lng: repair.lng }}
            title={repair.name}
            onClick={() => onRepairClick?.(repair.id)}
            icon={repairIcon}
          />
        ))}
      </GoogleMap>
    </LoadScript>
  )
}
