
import { useEffect, useRef, useState } from 'react'
import {
  Activity, Box, ChartNoAxesColumn, Cpu, FileText, Gauge,
  House, Power, RotateCcw, Settings2, Waves, ChevronRight
} from 'lucide-react'
import EngineScene, { type EngineView } from './components/EngineScene'
import TelemetryPanel from './components/TelemetryPanel'
import {
  illustrativeTemperature,
  stepNozzlePosition,
} from './simulation/engineModel'
import './App.css'

type PanelView = 'MODEL' | 'X-RAY' | 'SCHEMATIC'

function App() {
  const [throttle, setThrottle] = useState(45)
  const [target, setTarget] = useState(35)
  const [actual, setActual] = useState(0)
  const [running, setRunning] = useState(true)
  const [mode, setMode] = useState<'MANUAL' | 'AUTO'>('MANUAL')
  const [view, setView] = useState<EngineView>('SIDE')
  const [panelView, setPanelView] = useState<PanelView>('MODEL')
  const [history, setHistory] = useState<number[]>(
    Array.from({ length: 40 }, () => 0),
  )

  // Keep the latest position available to the history sampler.
  const actualRef = useRef(actual)

  useEffect(() => {
    actualRef.current = actual
  }, [actual])

  // Simulate actuator movement at 50 ms intervals.
  useEffect(() => {
    let previousTime = performance.now()

    const timer = window.setInterval(() => {
      const now = performance.now()
      const dtSeconds = Math.min((now - previousTime) / 1000, 0.2)
      previousTime = now

      setActual(value =>
        stepNozzlePosition(value, target, dtSeconds, running),
      )
    }, 50)

    return () => window.clearInterval(timer)
  }, [target, running])

  // Sample the latest actual position for the response graph.
  useEffect(() => {
    const timer = window.setInterval(() => {
      setHistory(values => [
        ...values.slice(-39),
        actualRef.current,
      ])
    }, 250)

    return () => window.clearInterval(timer)
  }, [])

  // AUTO remains a UI placeholder; no automatic controller is implemented.
  const error = target - actual
  const temperature = illustrativeTemperature(throttle, running)
  const rpm = running ? Math.round(1800 + throttle * 74) : 0

  function reset() {
    setThrottle(45)
    setTarget(35)
    setActual(0)
    setRunning(true)
    setMode('MANUAL')
    setView('SIDE')
    setPanelView('MODEL')
    setHistory(Array.from({ length: 40 }, () => 0))
    actualRef.current = 0
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a href="#overview" className="brand-lockup">
          <div className="brand-mark"><span>A</span><i>Ã—</i></div>
          <strong>AERION-X</strong>
          <small>EXHAUST SYSTEM<br />DIGITAL TWIN</small>
        </a>

        <nav className="side-nav" aria-label="Main navigation">
          <a className="nav-link selected" href="#overview"><House />Overview</a>
          <a className="nav-link" href="#engine"><Box />Engine model</a>
          <a className="nav-link" href="#controls"><Activity />Control system</a>
          <a className="nav-link" href="#telemetry"><ChartNoAxesColumn />Telemetry</a>
          <a className="nav-link" href="#hardware"><Cpu />Hardware / Wokwi</a>
          <a className="nav-link" href="#documentation"><FileText />Documentation</a>
        </nav>

        <div className="sidebar-aircraft" aria-label="Aircraft outline decoration">
          <svg viewBox="0 0 160 250" role="img" aria-label="Abstract aircraft engineering outline">
            <g fill="none" stroke="currentColor" strokeWidth=".8">
              <path d="M80 12 L86 57 L95 104 L146 174 L143 183 L88 157 L85 220 L101 239 L80 233 L59 239 L75 220 L72 157 L17 183 L14 174 L65 104 L74 57 Z" />
              <path d="M80 26 L80 229 M74 81 L86 81 M68 116 L92 116 M72 153 L88 153 M60 177 L100 177" />
              <ellipse cx="80" cy="65" rx="4" ry="22" />
              <path d="M72 97 L88 97 L94 126 L66 126 Z M75 157 L85 157 L85 213 L75 213 Z" />
              <path d="M25 175 L72 145 M135 175 L88 145 M61 203 L38 176 M99 203 L122 176" />
            </g>
          </svg>
          <span>SINGLE-ENGINE<br />DEMONSTRATOR</span>
          <small>CONCEPT / 001</small>
        </div>

        <div className="sidebar-status">
          <span className={`status-light ${running ? '' : 'paused'}`} />
          <span>{running ? 'SYSTEM ONLINE' : 'SYSTEM PAUSED'}</span>
          <small>SOFTWARE SIMULATION</small>
        </div>
      </aside>

      <section className="main-area" id="overview">
        <header className="utility-bar">
          <div className="utility-title">
            <span>PROJECT AERION-X</span><i />
            <span>INTERACTIVE EXHAUST SYSTEM DIGITAL TWIN</span>
          </div>
          <div className="utility-controls">
            <span className="simulation-tag"><i /> SIMULATED</span>
            <button
              className={`mode-tab ${mode === 'MANUAL' ? 'active' : ''}`}
              onClick={() => setMode('MANUAL')}
            >
              MANUAL
            </button>
            <button
              className={`mode-tab ${mode === 'AUTO' ? 'active' : ''}`}
              onClick={() => setMode('AUTO')}
            >
              AUTO
            </button>
            <span className="build-tag">BUILD 003</span>
          </div>
        </header>

        <div className="dashboard">
          <section className="intro-row">
            <div>
              <p className="eyebrow">01 / ENGINE EXHAUST SYSTEM</p>
              <h1>SINGLE ENGINE EXHAUST SYSTEM</h1>
              <p className="intro-subtitle">Interactive variable-geometry nozzle demonstrator</p>
            </div>
            <div className="project-stamp">
              <span>DESIGN STUDY</span><strong>AXâ€”003</strong>
            </div>
          </section>

          <section className="hero-grid">
            <article className="engine-panel" id="engine">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">ENGINE ASSEMBLY / A</p>
                  <h2>{view === 'SIDE' ? 'Exhaust system cutaway' : 'Variable nozzle / rear view'}</h2>
                </div>
                <span className="small-tag">PROCEDURAL 3D</span>
              </div>

              <EngineScene
                throttle={throttle}
                target={target}
                actual={actual}
                running={running}
                view={view}
                displayMode={panelView}
              />

              <div className="engine-annotations">
                <div><i /><strong>01</strong><span>Compressor</span></div>
                <div><i /><strong>02</strong><span>Combustor</span></div>
                <div><i /><strong>03</strong><span>Turbine</span></div>
                <div><i /><strong>04</strong><span>Actuator frame</span></div>
                <div><i /><strong>05</strong><span>Variable petals</span></div>
              </div>

              <div className="engine-panel-footer">
                <p className="figure-caption">PROCEDURAL ENGINEERING MODEL Â· NOT TO SCALE</p>
                <div className="camera-switch">
                  <button className={view === 'SIDE' ? 'active' : ''} onClick={() => setView('SIDE')}>SIDE CUTAWAY</button>
                  <button className={view === 'REAR' ? 'active' : ''} onClick={() => setView('REAR')}>REAR NOZZLE</button>
                </div>
              </div>
            </article>

            <aside className="reference-panel">
              <p className="eyebrow">02 / MECHANISM REFERENCE</p>
              <h2>Nozzle geometry</h2>

              <div className="drawing-section">
                <h3>SIDE VIEW / ACTUATOR LINKAGE</h3>
                <svg viewBox="0 0 320 112" role="img" aria-label="Simplified actuator and nozzle linkage">
                  <g fill="none" stroke="currentColor" strokeWidth="1.3">
                    <path d="M12 37 H92 L118 26 L151 36 L290 17" />
                    <path d="M12 70 H92 L118 81 L151 70 L290 89" />
                    <path d="M92 38 V69 M118 26 L135 53 L118 81 M135 53 L151 36 M135 53 L151 70" />
                    <path d="M151 36 L290 17 M151 70 L290 89" strokeWidth="3" />
                    <path d="M12 45 H83 M12 62 H83" strokeDasharray="3 3" />
                    <circle cx="118" cy="26" r="4" fill="currentColor" />
                    <circle cx="118" cy="81" r="4" fill="currentColor" />
                    <circle cx="135" cy="53" r="4" fill="currentColor" />
                  </g>
                </svg>
                <div className="drawing-labels"><span>ACTUATOR</span><span>LINKAGE</span><span>PETAL</span></div>
              </div>

              <div className="drawing-section rear-drawing">
                <h3>REAR VIEW / PETAL ARRANGEMENT</h3>
                <svg viewBox="0 0 320 130" role="img" aria-label="Rear-view nozzle petal arrangement">
                  <g transform="translate(115 65)" fill="none" stroke="currentColor">
                    <circle r="48" strokeWidth="1.3" />
                    <circle r="37" strokeWidth="1" />
                    <circle r="14" strokeWidth="1.6" />
                    {Array.from({ length: 12 }, (_, i) => (
                      <g key={i} transform={`rotate(${i * 30})`}>
                        <path d="M-5 -17 L-10 -40 L0 -45 L10 -40 L5 -17 Z" strokeWidth="1.1" />
                        <path d="M0 -17 L0 -35" strokeWidth=".8" />
                      </g>
                    ))}
                  </g>
                  <g fill="none" stroke="currentColor" strokeDasharray="3 3">
                    <path d="M178 31 Q215 65 178 99" />
                    <path d="M181 31 L194 25 M181 99 L194 105" />
                  </g>
                  <g fill="currentColor" fontSize="9">
                    <text x="208" y="53">OPENING</text>
                    <text x="208" y="66">VARIES WITH</text>
                    <text x="208" y="79">COMMAND</text>
                  </g>
                </svg>
              </div>

              <div className="drawing-section position-drawing">
                <h3>NOZZLE POSITIONS</h3>
                <div className="position-examples">
                  <MiniNozzle label="CLOSED" value={0} />
                  <MiniNozzle label="MID" value={50} />
                  <MiniNozzle label="OPEN" value={100} />
                </div>
              </div>
              <p className="figure-caption">SIMPLIFIED REFERENCE DRAWINGS Â· NOT MANUFACTURING GEOMETRY</p>
            </aside>
          </section>

          <section className="controls-panel" id="controls">
            <div className="section-bar">
              <p className="eyebrow">03 / SYSTEM CONTROLS</p>
              <span className="small-tag">COMMAND INPUTS</span>
            </div>

            <div className="controls-grid">
              <div className="slider-control">
                <div className="slider-title">
                  <Gauge /><label htmlFor="throttle">Engine throttle</label>
                  <strong>{throttle}<small>%</small></strong>
                </div>
                <input id="throttle" type="range" min="0" max="100" value={throttle} onChange={e => setThrottle(Number(e.target.value))} />
                <div className="scale"><span>0 / IDLE</span><span>50</span><span>100 / MAX</span></div>
              </div>

              <div className="slider-control nozzle-control">
                <div className="slider-title">
                  <Waves /><label htmlFor="nozzle">Nozzle target position</label>
                  <strong>{target}<small>%</small></strong>
                </div>
                <input id="nozzle" type="range" min="0" max="100" value={target} onChange={e => setTarget(Number(e.target.value))} />
                <div className="scale"><span>0 / CLOSED</span><span>50</span><span>100 / OPEN</span></div>
              </div>

              <div className="system-actions">
                <p className="eyebrow">SYSTEM CONTROL</p>
                <button className={`action-primary ${running ? 'is-running' : ''}`} onClick={() => setRunning(v => !v)}>
                  <Power size={14} />{running ? 'PAUSE SYSTEM' : 'START SYSTEM'}
                </button>
                <button className="action-secondary" onClick={reset}>
                  <RotateCcw size={14} />RESET PARAMETERS
                </button>
              </div>

              <div className="view-actions">
                <p className="eyebrow">DISPLAY MODE</p>
                <button className={panelView === 'MODEL' ? 'view-option chosen' : 'view-option'} onClick={() => setPanelView('MODEL')}><Box size={14} />3D MODEL</button>
                <button className={panelView === 'X-RAY' ? 'view-option chosen' : 'view-option'} onClick={() => setPanelView('X-RAY')}><Activity size={14} />X-RAY VIEW</button>
                <button className={panelView === 'SCHEMATIC' ? 'view-option chosen' : 'view-option'} onClick={() => setPanelView('SCHEMATIC')}><Settings2 size={14} />SCHEMATIC</button>
              </div>
            </div>

            {panelView !== 'MODEL' && (
              <p className="view-note">
                <ChevronRight size={13} />
                {panelView === 'X-RAY'
                  ? 'X-ray display uses a monochrome contrast treatment of the procedural model.'
                  : 'Schematic display uses a simplified monochrome treatment of the procedural model.'}
              </p>
            )}
          </section>

          <section className="bottom-grid">
            <article className="telemetry-panel" id="telemetry">
              <div className="section-bar">
                <p className="eyebrow">04 / TELEMETRY</p>
                <span className="small-tag">SIMULATED</span>
              </div>
              <div className="readings-grid">
                <Reading label="Throttle command" value={`${throttle}%`} percent={throttle} tone="orange" />
                <Reading label="Nozzle target" value={`${target}%`} percent={target} tone="olive" />
                <Reading label="Actual position" value={`${actual.toFixed(1)}%`} percent={actual} tone="blue" />
                <Reading label="Tracking error" value={`${error.toFixed(1)}%`} percent={Math.min(100, Math.abs(error))} tone="red" />
              </div>
              <div className="detail-readings">
                <div><span>Illustrative temperature</span><strong>{temperature} K</strong></div>
                <div><span>Engine speed estimate</span><strong>{rpm.toLocaleString()} rpm</strong></div>
                <div><span>Controller mode</span><strong>{mode}</strong></div>
              </div>
              <p className="fine-print">Illustrative simulation only. Temperature and RPM are estimates, not engine predictions or hardware readings.</p>
            </article>

            <article className="response-panel">
              <p className="eyebrow">05 / POSITION RESPONSE</p>
              <h2>Command tracking</h2>
              <ResponseChart target={target} history={history} />
              <div className="chart-legend">
                <span><i className="target-key" />Target position</span>
                <span><i className="actual-key" />Simulated actual</span>
              </div>
              <p className="fine-print">Time-stepped first-order actuator approximation; not measured test data.</p>
            </article>

            <article className="engine-state-panel">
              <p className="eyebrow">06 / ENGINE STATE</p>
              <div className="state-visual">
                <MiniEngineState throttle={throttle} target={target} running={running} />
                <div className="state-values">
                  <span>THROTTLE <strong>{throttle}%</strong></span>
                  <span>NOZZLE <strong>{actual.toFixed(1)}%</strong></span>
                </div>
              </div>
              <div className="stage-status">
                {['INTAKE', 'COMPRESSOR', 'COMBUSTION', 'TURBINE', 'NOZZLE'].map((stage, i) => (
                  <div key={stage}>
                    <i className={running ? (i === 4 ? 'stage-active' : '') : 'stage-paused'} />
                    <span>{stage}</span>
                  </div>
                ))}
              </div>
              <p className="fine-print">Conceptual system-state visualization.</p>
            </article>
          </section>

          <section className="hardware-strip" id="hardware">
            <Cpu />
            <div>
              <strong>Hardware integration</strong>
              <span>ESP32 Â· servo actuator Â· potentiometer Â· Wokwi</span>
            </div>
            <span className="hardware-status">NOT CONNECTED</span>
          </section>

          <footer id="documentation">
            <span>AERION-X / ENGINEERING DEMONSTRATOR / BUILD 003</span>
            <span><i />SOFTWARE SIMULATION Â· NO HARDWARE CONNECTED</span>
          </footer>

          <TelemetryPanel />
        </div>
      </section>
    </main>
  )
}

function MiniNozzle({ label, value }: { label: string; value: number }) {
  const half = 5 + value * 0.09
  return (
    <div className="mini-nozzle-wrap">
      <svg viewBox="0 0 90 44" role="img" aria-label={`${label} nozzle position`}>
        <g fill="none" stroke="currentColor" strokeWidth="1.3">
          <path d={`M4 15 H31 L80 ${22 - half}`} />
          <path d={`M4 29 H31 L80 ${22 + half}`} />
          <path d={`M31 15 L31 ${29 - half * .4} M31 29 L31 ${15 + half * .4}`} />
          <path d="M5 18 H27 M5 26 H27" strokeDasharray="2 2" />
        </g>
      </svg>
      <span>{label}</span>
      <small>{value}%</small>
    </div>
  )
}

function Reading({ label, value, percent, tone }: { label: string; value: string; percent: number; tone: string }) {
  return (
    <div className="reading">
      <span>{label}</span>
      <strong>{value}</strong>
      <div className={`reading-track ${tone}`}>
        <i style={{ width: `${Math.max(0, Math.min(100, percent))}%` }} />
      </div>
    </div>
  )
}

function ResponseChart({ target, history }: { target: number; history: number[] }) {
  const targetY = 120 - target * 1.1
  const points = history
    .map((value, index) => `${(index / Math.max(1, history.length - 1)) * 300},${120 - value * 1.1}`)
    .join(' ')

  return (
    <div className="chart-wrap">
      <div className="chart-y-labels"><span>100</span><span>50</span><span>0</span></div>
      <svg viewBox="0 0 300 130" preserveAspectRatio="none" role="img" aria-label="Nozzle target and simulated actual position over time">
        <g className="chart-grid">
          <path d="M0 10 H300 M0 65 H300 M0 120 H300" />
        </g>
        <path d={`M0 ${targetY} H300`} className="target-line" />
        <polyline points={points} className="actual-line" />
      </svg>
      <div className="chart-x-labels"><span>âˆ’10 s</span><span>âˆ’5 s</span><span>Now</span></div>
    </div>
  )
}

function MiniEngineState({ throttle, target, running }: { throttle: number; target: number; running: boolean }) {
  return (
    <svg viewBox="0 0 420 110" role="img" aria-label="Simplified engine state illustration">
      <g fill="none" stroke="#bcb7a8" strokeWidth="1.3">
        <path d="M18 25 L70 20 L110 27 L180 29 L230 24 L290 27 L340 18 L390 32 L405 48 L390 63 L340 78 L290 69 L230 73 L180 68 L110 70 L70 78 L18 73 Z" />
        {[30, 39, 47, 56, 64, 95, 105, 115, 165, 175, 185, 195, 222, 232, 242].map(x => <path key={x} d={`M${x} 25 V73`} />)}
        <path d={`M340 25 L350 ${40 - target * .12} L390 ${40 - target * .12} M340 73 L350 ${70 + target * .12} L390 ${70 + target * .12}`} />
      </g>
      <path d="M390 43 L419 49 L390 55 Z" fill="#e8a16d" opacity={running ? .25 + throttle / 130 : 0} />
      <path d="M395 47 L420 49 L395 51 Z" fill="#fff1d7" opacity={running ? throttle / 100 : 0} />
    </svg>
  )
}

export default App
