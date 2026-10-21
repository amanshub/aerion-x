# AERION-X — Exhaust System Digital Twin

> Interactive variable-geometry jet engine nozzle demonstrator with live ESP32 hardware telemetry over secure MQTT.

![Build](https://img.shields.io/badge/build-003-orange) ![Status](https://img.shields.io/badge/status-functional%20prototype-green) ![Stack](https://img.shields.io/badge/stack-React%20%7C%20Three.js%20%7C%20ESP32%20%7C%20MQTT-blue)

---

## What is AERION-X?

AERION-X is an engineering demonstrator that simulates a variable-geometry exhaust nozzle system of a single-engine jet, functioning as a digital twin. It connects three layers:

- **Embedded hardware** — ESP32 microcontroller (simulated in Wokwi) reads a potentiometer as the command input, runs an actuator model with simulated sensor noise and fault injection, and publishes structured JSON telemetry over MQTT with TLS.
- **Cloud broker** — EMQX Cloud routes telemetry from the ESP32 to the browser over secure WebSockets.
- **Web dashboard** — A React + Three.js application renders a procedural 3D engine model whose nozzle position is driven in real time by live telemetry data.

When MQTT is connected, the 3D nozzle responds to actual hardware commands — not a local animation.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     AERION-X SYSTEM                         │
│                                                             │
│  ┌──────────────────┐     MQTT/TLS      ┌────────────────┐  │
│  │  ESP32 (Wokwi)   │ ────────────────► │  EMQX Cloud    │  │
│  │                  │                  │  Broker         │  │
│  │  • Potentiometer │  aerion-x/test/  │  (Asia SE1)     │  │
│  │  • Servo model   │  telemetry       └───────┬────────┘  │
│  │  • Sensor noise  │                          │            │
│  │  • Fault inject  │                  WSS:8084│            │
│  └──────────────────┘                          ▼            │
│                                       ┌────────────────┐    │
│                                       │  React Dashboard│    │
│                                       │  + Three.js 3D  │    │
│                                       │  • Live nozzle  │    │
│                                       │  • Telemetry    │    │
│                                       │  • Fault alerts │    │
│                                       └────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## Features

- **Procedural 3D engine model** — Side cutaway and rear nozzle views rendered with React Three Fiber
- **Live MQTT telemetry** — Dashboard subscribes to `aerion-x/test/telemetry` over secure WebSockets (wss://)
- **Real-time nozzle sync** — 3D nozzle position driven directly by `model_position_deg` from ESP32 telemetry
- **Actuator model** — First-order response: `α = 1 − e^(−Δt / τ)` with τ = 0.8s
- **Fault injection** — Sensor stuck at 30° produces `SENSOR_FAULT` with measurable disagreement reported in telemetry
- **Fallback simulation** — When MQTT is disconnected, local actuator model runs in the browser
- **Display modes** — 3D Model, X-Ray, and Schematic views

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript + Vite |
| 3D Rendering | Three.js via React Three Fiber + Drei |
| MQTT Client | mqtt.js v5 (WebSocket transport) |
| Embedded Firmware | C++ / Arduino (ESP32) |
| Hardware Simulation | Wokwi |
| MQTT Broker | EMQX Cloud (TLS, Asia Southeast 1) |
| Icons | Lucide React |

---

## Project Structure

```
aerion-x/
├── src/
│   ├── App.tsx                   # Main dashboard, state management
│   ├── App.css                   # All styles
│   ├── components/
│   │   ├── EngineScene.tsx       # Three.js 3D engine model
│   │   └── TelemetryPanel.tsx    # Live MQTT connection panel
│   ├── simulation/
│   │   └── engineModel.ts        # First-order actuator model
│   └── telemetry/
│       └── mqttTelemetry.ts      # MQTT client, topic subscription, validation
├── firmware/                     # ESP32 firmware (Wokwi project)
│   └── sketch.ino                # Actuator model, sensor sim, MQTT publish
├── public/
│   └── favicon.svg
├── index.html
├── vite.config.ts
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/amanshub/aerion-x.git
cd aerion-x
npm install
```

### Run in development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Production build

```bash
npm run build
npm run preview
```

---

## Hardware Setup (ESP32 / Wokwi)

The embedded layer runs in [Wokwi](https://wokwi.com/projects/478508253547370497) — no physical hardware required to demonstrate.

**Components in simulation:**
- ESP32 DevKit
- Potentiometer (GPIO 34) — nozzle command input
- Servo motor — actuator position feedback
- Status LEDs — fault / normal indicators

**Firmware behavior:**
- Reads potentiometer → maps to nozzle command (0–100%)
- Runs first-order actuator model at ~10 Hz
- Adds configurable sensor noise (`SIMULATED_NOISE` mode)
- Fault injection: `STUCK_AT_30_DEG` mode — sensor freezes, disagreement triggers `SENSOR_FAULT`
- Publishes JSON telemetry over MQTT every ~300ms

**MQTT message schema:**
```json
{
  "device": "AERION-X2",
  "sequence": 287,
  "uptime_ms": 89619,
  "command_percent": 100,
  "target_deg": 180.0,
  "model_position_deg": 180.0,
  "sensor_deg": 179.8,
  "error_deg": 0.2,
  "sensor_disagreement_deg": 0.2,
  "fault": "OK",
  "sensor_mode": "SIMULATED_NOISE"
}
```

---

## MQTT Configuration

| Parameter | Value |
|---|---|
| Broker | EMQX Cloud — Asia Southeast 1 |
| Protocol | MQTT over WSS (port 8084) |
| Topic | `aerion-x/test/telemetry` |
| QoS | 0 |
| Auth | Username / Password |

> ⚠️ The broker is currently in **blacklist mode** (permissive). Switching to whitelist mode is recommended before any public deployment.

To connect the dashboard to live hardware, enter your MQTT credentials in the **Live Hardware Telemetry** panel at the bottom of the dashboard.

---

## Telemetry Fields

| Field | Type | Description |
|---|---|---|
| `device` | string | Device identifier — must be `AERION-X2` |
| `sequence` | number | Monotonically increasing packet counter |
| `uptime_ms` | number | ESP32 uptime in milliseconds |
| `command_percent` | number | Nozzle command input (0–100%) |
| `target_deg` | number | Target nozzle angle in degrees (0–180°) |
| `model_position_deg` | number | Actuator model position — drives 3D nozzle |
| `sensor_deg` | number | Simulated sensor reading (with noise) |
| `error_deg` | number | Tracking error (target − model) |
| `sensor_disagreement_deg` | number | Disagreement between model and sensor |
| `fault` | string | `OK` or `SENSOR_FAULT` |
| `sensor_mode` | string | `SIMULATED_NOISE` or `STUCK_AT_30_DEG` |

---

## Known Limitations

- **Wokwi simulation only** — no physical ESP32 hardware tested
- **AUTO mode** — UI button present, controller not yet implemented
- **Sensor data** — simulated noise/fault only; not from a real sensor
- **Temperature and RPM** — illustrative display values, not thermodynamic predictions
- **EMQX authorization** — currently blacklist mode; whitelist recommended for production

---

## Future Work

- [ ] Implement AUTO mode PID controller
- [ ] Physical hardware build with real servo and potentiometer
- [ ] Switch EMQX to whitelist authorization mode
- [ ] Multi-engine support
- [ ] AI-assisted control (Phase 2 roadmap)
- [ ] Hand-gesture command input

---

## Author

**Aman Singh**  
B.Tech ECE, UCER Prayagraj (AKTU), 2027  
[github.com/amanshub](https://github.com/amanshub)

---

## License

This project is a personal engineering demonstrator and academic project. All rights reserved.
