
import mqtt, { type MqttClient } from 'mqtt'

export interface AerionTelemetry {
  device: string
  sequence: number
  uptime_ms: number
  command_percent: number
  target_deg: number
  model_position_deg: number
  sensor_deg: number
  error_deg: number
  sensor_disagreement_deg: number
  fault: string
  sensor_mode: string
}

const BROKER_URL =
  'wss://bc5287ad.ala.asia-southeast1.emqxsl.com:8084/mqtt'

const TELEMETRY_TOPIC = 'aerion-x/test/telemetry'

export function connectTelemetry(
  username: string,
  password: string,
  onTelemetry: (data: AerionTelemetry) => void,
  onStatus: (status: string) => void,
): MqttClient {
  const client = mqtt.connect(BROKER_URL, {
    username,
    password,
    clientId: `aerion_dashboard_${Math.random().toString(16).slice(2, 10)}`,
    protocolVersion: 4,
    clean: true,
    connectTimeout: 10000,
    reconnectPeriod: 3000,
  })

  client.on('connect', () => {
    onStatus('CONNECTED')

    client.subscribe(TELEMETRY_TOPIC, { qos: 0 }, (error) => {
      if (error) {
        onStatus('SUBSCRIBE_FAILED')
      } else {
        onStatus('SUBSCRIBED')
      }
    })
  })

  client.on('message', (topic, payload) => {
    if (topic !== TELEMETRY_TOPIC) return

    try {
      const data = JSON.parse(
        payload.toString(),
      ) as AerionTelemetry

      if (
        data.device !== 'AERION-X2' ||
        typeof data.sequence !== 'number' ||
        typeof data.command_percent !== 'number' ||
        typeof data.target_deg !== 'number' ||
        typeof data.model_position_deg !== 'number' ||
        typeof data.sensor_deg !== 'number'
      ) {
        onStatus('INVALID_TELEMETRY')
        return
      }

      onTelemetry(data)
    } catch {
      onStatus('INVALID_JSON')
    }
  })

  client.on('reconnect', () => onStatus('RECONNECTING'))
  client.on('offline', () => onStatus('OFFLINE'))
  client.on('error', () => onStatus('CONNECTION_ERROR'))

  return client
}
