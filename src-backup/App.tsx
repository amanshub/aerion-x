
import { useState } from 'react'
import {
  Activity, Box, ChartNoAxesColumn, Cpu, FileText, Gauge,
  House, Power, RotateCcw, Settings2, Waves
} from 'lucide-react'
import './App.css'

type ViewMode = 'MODEL' | 'X-RAY' | 'SCHEMATIC'

function App() {
  const [throttle, setThrottle] = useState(45)
  const [target, setTarget] = useState(35)
  const [running, setRunning] = useState(true)
  const [view, setView] = useState<ViewMode>('MODEL')
  const [mode, setMode] = useState<'MANUAL' | 'AUTO'>('MANUAL')

  // Placeholder first-order response estimate; not a physical engine model.
  const actual = running ? target * 0.94 : 0
  const error = target - actual
  const temperature = 350 + throttle * 8

  function reset() {
    setThrottle(45)
    setTarget(35)
    setRunning(true)
    setMode('MANUAL')
    setView('MODEL')
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a href="#overview" className="brand-lockup">
          <div className="brand-emblem">A<span>×</span></div>
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
              <path d="M80 12 L86 57 L95 104 L146 174 L143 183 L88 157 L85 220 L101 239 L80 233 L59 239 L75 220 L72 157 L17 183 L14 174 L65 104 L74 57 Z"/>
              <path d="M80 26 L80 229 M74 81 L86 81 M68 116 L92 116 M72 153 L88 153 M60 177 L100 177"/>
              <ellipse cx="80" cy="65" rx="4" ry="22"/>
              <path d="M72 97 L88 97 L94 126 L66 126 Z M75 157 L85 157 L85 213 L75 213 Z"/>
              <path d="M25 175 L72 145 M135 175 L88 145 M61 203 L38 176 M99 203 L122 176"/>
            </g>
          </svg>
          <span>SINGLE-ENGINE<br />DEMONSTRATOR</span>
          <small>CONCEPT / 001</small>
        </div>

        <div className="sidebar-status">
          <span className={`status-light ${running ? '' : 'paused'}`} />
          <span>{running ? 'SYSTEM ONLINE' : 'SYSTEM PAUSED'}</span>
          <small>SIMULATION MODE · V0.1</small>
        </div>
      </aside>

      <section className="main-area" id="overview">
        <header className="utility-bar">
          <div className="utility-title">
            <span>PROJECT AERION-X</span>
            <i />
            <span>INTERACTIVE EXHAUST SYSTEM DIGITAL TWIN</span>
          </div>
          <div className="utility-controls">
            <span className="simulation-tag"><i /> SIMULATED</span>
            <button className={`mode-tab ${mode === 'MANUAL' ? 'active' : ''}`}
              onClick={() => setMode('MANUAL')}>MANUAL</button>
            <button className={`mode-tab ${mode === 'AUTO' ? 'active' : ''}`}
              onClick={() => setMode('AUTO')}>AUTO</button>
            <span className="build-tag">BUILD 001</span>
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
              <span>DESIGN STUDY</span>
              <strong>AX—001</strong>
            </div>
          </section>

          <section className="hero-grid">
            <article className="engine-panel" id="engine">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">ENGINE ASSEMBLY / A</p>
                  <h2>Exhaust system cutaway</h2>
                </div>
                <span className="small-tag">CONCEPTUAL MODEL</span>
              </div>

              <EngineIllustration
                throttle={throttle}
                target={target}
                running={running}
                view={view}
              />

              <div className="engine-annotations">
                <div><i /> <strong>01</strong><span>Compressor</span></div>
                <div><i /> <strong>02</strong><span>Combustor</span></div>
                <div><i /> <strong>03</strong><span>Turbine</span></div>
                <div><i /> <strong>04</strong><span>Nozzle actuator</span></div>
                <div><i /> <strong>05</strong><span>Variable petals</span></div>
              </div>
              <p className="figure-caption">
                SCHEMATIC CONCEPT · NOT TO SCALE · NO REAL ENGINE DATA
              </p>
            </article>

            <aside className="reference-panel">
              <p className="eyebrow">02 / MECHANISM REFERENCE</p>
              <h2>Nozzle geometry</h2>

              <div className="drawing-section">
                <h3>SIDE VIEW / LINKAGE</h3>
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
              <p className="figure-caption">
                SIMPLIFIED REFERENCE DRAWINGS · NOT MANUFACTURING GEOMETRY
              </p>
            </aside>
          </section>

          <section className="controls-panel" id="controls">
            <div className="section-bar">
              <p className="eyebrow">03 / SYSTEM CONTROLS</p>
              <span className="small-tag">COMMAND INPUTS</span>
            </div>

            <div className="controls-grid">
              <div className="slider-control throttle-control">
                <div className="slider-title">
                  <Gauge />
                  <label htmlFor="throttle">Engine throttle</label>
                  <strong>{throttle}<small>%</small></strong>
                </div>
                <input id="throttle" type="range" min="0" max="100" value={throttle}
                  onChange={e => setThrottle(Number(e.target.value))} />
                <div className="scale"><span>0 / IDLE</span><span>50</span><span>100 / MAX</span></div>
              </div>

              <div className="slider-control nozzle-control">
                <div className="slider-title">
                  <Waves />
                  <label htmlFor="nozzle">Nozzle target position</label>
                  <strong>{target}<small>%</small></strong>
                </div>
                <input id="nozzle" type="range" min="0" max="100" value={target}
                  onChange={e => setTarget(Number(e.target.value))} />
                <div className="scale"><span>0 / CLOSED</span><span>50</span><span>100 / OPEN</span></div>
              </div>

              <div className="system-actions">
                <p className="eyebrow">SYSTEM CONTROL</p>
                <button className={`action-primary ${running ? 'is-running' : ''}`}
                  onClick={() => setRunning(!running)}>
                  <Power size={14} /> {running ? 'PAUSE SYSTEM' : 'START SYSTEM'}
                </button>
                <button className="action-secondary" onClick={reset}>
                  <RotateCcw size={14} /> RESET PARAMETERS
                </button>
              </div>

              <div className="view-actions">
                <p className="eyebrow">VIEW MODE</p>
                <button className={view === 'MODEL' ? 'view-option chosen' : 'view-option'}
                  onClick={() => setView('MODEL')}><Box size={14} /> 3D-STYLE MODEL</button>
                <button className={view === 'X-RAY' ? 'view-option chosen' : 'view-option'}
                  onClick={() => setView('X-RAY')}><Activity size={14} /> X-RAY VIEW</button>
                <button className={view === 'SCHEMATIC' ? 'view-option chosen' : 'view-option'}
                  onClick={() => setView('SCHEMATIC')}><Settings2 size={14} /> SCHEMATIC</button>
              </div>
            </div>
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
                <div><span>Controller mode</span><strong>{mode}</strong></div>
                <div><span>Feedback source</span><strong>SIMULATED</strong></div>
              </div>
              <p className="fine-print">
                Temperature is arbitrary. Position is an illustrative estimate, not measured sensor feedback.
              </p>
            </article>

            <article className="response-panel">
              <p className="eyebrow">05 / POSITION RESPONSE</p>
              <h2>Command tracking</h2>
              <ResponseChart target={target} actual={actual} />
              <div className="chart-legend">
                <span><i className="target-key" /> Target position</span>
                <span><i className="actual-key" /> Simulated actual</span>
              </div>
              <p className="fine-print">Illustrative comparison; not measured test data.</p>
            </article>

            <article className="engine-state-panel">
              <p className="eyebrow">06 / ENGINE STATE</p>
              <div className="state-visual">
                <EngineSilhouette throttle={throttle} target={target} running={running} />
                <div className="state-values">
                  <span>THROTTLE <strong>{throttle}%</strong></span>
                  <span>NOZZLE <strong>{target}%</strong></span>
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
            <div><strong>Hardware integration</strong><span>ESP32 · servo actuator · potentiometer · Wokwi</span></div>
            <span className="hardware-status">NOT CONNECTED</span>
          </section>

          <footer id="documentation">
            <span>AERION-X / ENGINEERING DEMONSTRATOR / BUILD 001</span>
            <span><i /> SOFTWARE SIMULATION · NO HARDWARE CONNECTED</span>
          </footer>
        </div>
      </section>
    </main>
  )
}

function EngineIllustration({ throttle, target, running, view }: {
  throttle: number
  target: number
  running: boolean
  view: ViewMode
}) {
  return (
    <div className={`engine-canvas ${view.toLowerCase().replace('-', '')}`}>
      <div className="canvas-grid" />
      <div className="engine-art">
        <div className="engine-shell">
          <div className="intake-lip">
            <div className="fan-face">
              {Array.from({ length: 14 }, (_, i) => (
                <i key={i} style={{ transform: `rotate(${i * 25.714}deg)` }} />
              ))}
              <b />
            </div>
          </div>
          <div className="compressor-stack">
            {Array.from({ length: 5 }, (_, i) => <i key={i} />)}
          </div>
          <div className="combustor-shell">
            <div className="flame-core" style={{ opacity: running ? .25 + throttle / 130 : .03 }} />
            <div className="combustor-rings"><i /><i /><i /></div>
          </div>
          <div className="turbine-stack">
            {Array.from({ length: 4 }, (_, i) => <i key={i} />)}
          </div>
          <div className="engine-pipe pipe-top" />
          <div className="engine-pipe pipe-bottom" />
          <div className="actuator-unit"><i /><b /></div>
          <div className="nozzle-assembly">
            <div className="nozzle-mouth">
              <div className="petal-ring" style={{ transform: `scale(${.65 + target / 290})` }}>
                {Array.from({ length: 10 }, (_, i) => (
                  <i key={i} style={{ transform: `rotate(${i * 36}deg) translateY(-29px)` }} />
                ))}
                <b />
              </div>
            </div>
            <div className="exhaust-plume" style={{
              opacity: running ? .15 + throttle / 115 : 0,
              transform: `scaleX(${.45 + throttle / 75})`
            }} />
          </div>
        </div>
      </div>
      <div className="flow-arrows"><span>→</span><span>→</span><span>→</span></div>
      <span className="canvas-label label-compressor">COMPRESSOR</span>
      <span className="canvas-label label-combustor">COMBUSTION</span>
      <span className="canvas-label label-turbine">TURBINE</span>
      <span className="canvas-label label-nozzle">VARIABLE NOZZLE</span>
      <span className="canvas-axis">CONCEPTUAL CUTAWAY / NOT TO SCALE</span>
    </div>
  )
}

function MiniNozzle({ label, value }: { label: string; value: number }) {
  return (
    <div className="mini-nozzle-wrap">
      <svg viewBox="0 0 90 44" role="img" aria-label={`${label} nozzle position`}>
        <g fill="none" stroke="currentColor" strokeWidth="1.3">
          <path d={`M4 12 H31 L80 ${22 - value * .08}`} />
          <path d={`M4 32 H31 L80 ${22 + value * .08}`} />
          <path d={`M31 12 L31 ${32 - value * .06} M31 32 L31 ${12 + value * .06}`} />
          <path d="M5 17 H27 M5 27 H27" strokeDasharray="2 2" />
        </g>
      </svg>
      <span>{label}</span>
      <small>{value}%</small>
    </div>
  )
}

function Reading({ label, value, percent, tone }: {
  label: string
  value: string
  percent: number
  tone: string
}) {
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

function ResponseChart({ target, actual }: { target: number; actual: number }) {
  const yTarget = 120 - target * 1.1
  const yActual = 120 - actual * 1.1

  return (
    <div className="chart-wrap">
      <div className="chart-y-labels"><span>100</span><span>50</span><span>0</span></div>
      <svg viewBox="0 0 300 130" preserveAspectRatio="none" role="img" aria-label="Illustrative nozzle position comparison">
        <g className="chart-grid">
          <path d="M0 10 H300 M0 65 H300 M0 120 H300" />
        </g>
        <polyline points={`0,120 30,120 30,${yTarget} 125,${yTarget} 125,${yTarget} 145,${yTarget} 145,${yTarget} 300,${yTarget}`}
          className="target-line" />
        <polyline points={`0,120 15,${yActual + 16} 38,${yActual + 5} 65,${yActual} 100,${yActual} 140,${yActual} 190,${yActual} 240,${yActual} 300,${yActual}`}
          className="actual-line" />
      </svg>
      <div className="chart-x-labels"><span>0 s</span><span>10 s</span><span>20 s</span></div>
    </div>
  )
}

function EngineSilhouette({ throttle, target, running }: {
  throttle: number
  target: number
  running: boolean
}) {
  return (
    <svg viewBox="0 0 420 110" role="img" aria-label="Simplified engine outline with exhaust">
      <g fill="none" stroke="#bcb7a8" strokeWidth="1.3">
        <path d="M18 25 L70 20 L110 27 L180 29 L230 24 L290 27 L340 18 L390 32 L405 48 L390 63 L340 78 L290 69 L230 73 L180 68 L110 70 L70 78 L18 73 Z" />
        <path d="M30 29 V69 M39 26 V72 M47 25 V73 M56 23 V75 M64 22 V76" />
        <path d="M95 28 L95 68 M105 27 L105 69 M115 28 L115 68" />
        <path d="M165 29 V68 M175 29 V68 M185 29 V68 M195 29 V68" />
        <path d="M222 25 V72 M232 26 V71 M242 26 V70" />
        <path d="M280 28 L290 40 L290 58 L280 69 M300 27 L310 40 L310 58 L300 70" />
        <path d="M320 27 L347 40 L347 57 L320 70" />
        {Array.from({ length: 7 }, (_, i) => (
          <path key={i} d="M348 29 L380 42 L380 56 L348 69" transform={`translate(0 ${i * .01})`} />
        ))}
      </g>
      <path d="M390 43 L419 49 L390 55 Z" fill="#e8a16d"
        opacity={running ? .25 + throttle / 130 : 0} />
      <path d={`M395 47 L420 49 L395 51 Z`} fill="#fff1d7"
        opacity={running ? throttle / 100 : 0} />
      <g stroke="#d6d0c1" strokeWidth="1">
        <path d={`M365 18 L365 ${7 + target * .04}`} />
      </g>
    </svg>
  )
}

export default App
