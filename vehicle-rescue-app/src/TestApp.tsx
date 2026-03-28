import React from 'react'

export default function TestApp() {
  const [status, setStatus] = React.useState<string>('加載中...')
  const [repairs, setRepairs] = React.useState<any[]>([])

  React.useEffect(() => {
    // 測試後端連接
    fetch('/api/location')
      .then(r => r.json())
      .then(d => {
        console.log('位置:', d)
        setStatus('✅ 後端正常')
        return fetch(`/api/repairs?lat=${d.lat}&lng=${d.lng}`)
      })
      .then(r => r.json())
      .then(d => {
        console.log('廠商:', d)
        setRepairs(d)
        setStatus('✅ 應用正常')
      })
      .catch(e => {
        console.error('錯誤:', e)
        setStatus('❌ ' + e.message)
      })
  }, [])

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>🚗 測試應用</h1>
      <p>狀態: <strong>{status}</strong></p>
      <h2>附近維修廠 ({repairs.length})</h2>
      <ul>
        {repairs.slice(0, 3).map((r, i) => (
          <li key={i}>{r.name} - {r.distance.toFixed(1)}km</li>
        ))}
      </ul>
    </div>
  )
}
