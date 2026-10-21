
import { useEffect, useState } from 'react'
import type { MqttClient } from 'mqtt'
import {
  connectTelemetry,
  type AerionTelemetry,
} from '../telemetry/mqttTelemetry'

export default function TelemetryPanel() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('DISCONNECTED')
  const [telemetry, setTelemetry] = useState<AerionTelemetry | null>(null)
  const [client, setClient] = useState<MqttClient | null>(null)

  useEffect(() => {
    return () => {
      client?.end(true)
    }
  }, [client])

  function connect() {
    if (!username.trim() || !password) {
      setStatus('ENTER_CREDENTIALS')
      return
    }

    client?.end(true)
    setTelemetry(null)

    const mqttClient = connectTelemetry(
      username.trim(),
      password,
      setTelemetry,
      setStatus,
    )

    setClient(mqttClient)
  }

  function disconnect() {
    client?.end(true)
    setClient(null)
    setTelemetry(null)
    setStatus('DISCONNECTED')
  }

  return (
    <section
      style={{
        margin: '24px 0',
        padding: 20,
        border: '1px solid #343a46',
        borderRadius: 12,
        background: '#11151d',
        color: '#e8edf5',
        fontFamily: 'inherit',
      }}
    >
      <h2 style={{ marginTop: 0 }}>Live Hardware Telemetry</h2>
      <p style={{ color: '#9ba7b8', fontSize: 13 }}>
        AERION-X2 · Secure MQTT over WebSockets
      </p>

      <form
        onSubmit={(event) => {
          event.preventDefault()
          connect()
        }}
        style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          marginBottom: 16,
        }}
      >
        <input
          aria-label="Dashboard MQTT username"
          placeholder="Read-only MQTT username"
          autoComplete="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          style={{ padding: 10, minWidth: 180, flex: 1 }}
        />

        <input
          aria-label="Dashboard MQTT password"
          placeholder="MQTT password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          style={{ padding: 10, minWidth: 180, flex: 1 }}
        />

        <button type="submit" disabled={status === 'CONNECTED' || status === 'SUBSCRIBED'}>
          Connect
        </button>

        <button type="button" onClick={disconnect}>
          Disconnect
        </button>
      </form>

      <p>
        Connection status: <strong>{status}</strong>
      </p>

      {telemetry ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 12,
          }}
        >
          <Metric label="Command" value={`${telemetry.command_percent}%`} />
          <Metric label="Target angle" value={`${telemetry.target_deg.toFixed(1)}°`} />
          <Metric label="Model position" value={`${telemetry.model_position_deg.toFixed(1)}°`} />
          <Metric label="Virtual sensor" value={`${telemetry.sensor_deg.toFixed(1)}°`} />
          <Metric label="Position error" value={`${telemetry.error_deg.toFixed(1)}°`} />
          <Metric label="Sensor disagreement" value={`${telemetry.sensor_disagreement_deg.toFixed(1)}°`} />
          <Metric label="Sequence" value={String(telemetry.sequence)} />
          <Metric label="Fault status" value={telemetry.fault} />
        </div>
      ) : (
        <p style={{ color: '#9ba7b8' }}>
          Waiting for telemetry. Start the ESP32 Wokwi simulation and connect.
        </p>
      )}

      {telemetry && (
        <p style={{ color: '#9ba7b8', fontSize: 12 }}>
          Sensor mode: {telemetry.sensor_mode} · Uptime: {telemetry.uptime_ms} ms
        </p>
      )}
    </section>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: 12,
        border: '1px solid #343a46',
        borderRadius: 8,
        background: '#171d27',
      }}
    >
      <div style={{ color: '#9ba7b8', fontSize: 12, marginBottom: 8 }}>
        {label}
      </div>
      <strong style={{ fontSize: 18, overflowWrap: 'anywhere' }}>
        {value}
      </strong>
    </div>
  )
}
