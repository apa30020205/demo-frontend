import { useState, useRef } from 'react'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import esLocale from '@fullcalendar/core/locales/es'

const navItems = [
  { key: 'transporte', label: 'Cronograma de Transporte' },
  { key: 'reportes', label: 'Reportes' },
  { key: 'configuracion', label: 'Configuración' },
  { key: 'taller', label: 'Taller' },
  { key: 'choferes', label: 'Choferes' }
]

const initialEvents = [
  {
    title: 'Prado 12 - Recursos Humanos',
    start: '2026-03-23T11:30:00',
    end: '2026-03-23T14:30:00',
    status: 'Pendiente',
    vehicle: 'Prado 12'
  },
  {
    title: 'Hilux 8 - Finanzas',
    start: '2026-03-23T09:00:00',
    end: '2026-03-23T11:00:00',
    status: 'Aprobado',
    vehicle: 'Hilux 8'
  },
  {
    title: 'Prado 5 - Compras',
    start: '2026-03-24T08:00:00',
    end: '2026-03-24T10:00:00',
    status: 'Urgente',
    vehicle: 'Prado 5'
  },
  {
    title: 'Fortuner 4 - Operaciones',
    start: '2026-03-25T07:30:00',
    end: '2026-03-25T09:00:00',
    status: 'Aprobado',
    vehicle: 'Fortuner 4'
  },
  {
    title: 'Hilux 3 - Sistemas',
    start: '2026-03-25T13:00:00',
    end: '2026-03-25T15:30:00',
    status: 'Pendiente',
    vehicle: 'Hilux 3'
  },
  {
    title: 'Prado 9 - Logística',
    start: '2026-03-26T10:30:00',
    end: '2026-03-26T12:00:00',
    status: 'Aprobado',
    vehicle: 'Prado 9'
  },
  {
    title: 'Hilux 11 - Gerencia',
    start: '2026-03-27T08:00:00',
    end: '2026-03-27T09:30:00',
    status: 'Urgente',
    vehicle: 'Hilux 11'
  },
  {
    title: 'Fortuner 2 - Mantenimiento',
    start: '2026-03-27T11:00:00',
    end: '2026-03-27T13:00:00',
    status: 'Pendiente',
    vehicle: 'Fortuner 2'
  },
  {
    title: 'Prado 14 - Compras',
    start: '2026-03-27T15:00:00',
    end: '2026-03-27T17:00:00',
    status: 'Aprobado',
    vehicle: 'Prado 14'
  }
]

export default function App() {
  const calendarRef = useRef(null)

  const [events] = useState(initialEvents)
  const [currentRangeLabel, setCurrentRangeLabel] = useState('')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [activeNav, setActiveNav] = useState('transporte')
  const [hoveredNav, setHoveredNav] = useState(null)
  const vehicles = Array.from(new Set(initialEvents.map((e) => e.vehicle))).sort()
  const [workshopVehicle, setWorkshopVehicle] = useState(vehicles[0] ?? '')
  const drivers = driverData
  const [selectedDriverId, setSelectedDriverId] = useState(drivers[0]?.id ?? '')
  const [reportSearch, setReportSearch] = useState('')
  const [reportAuto, setReportAuto] = useState('Todos')
  const [reportChofer, setReportChofer] = useState('Todos')
  const [reportDept, setReportDept] = useState('Todos')

  const activeIndex = Math.max(
    0,
    navItems.findIndex((i) => i.key === activeNav)
  )
  const hoveredIndex = hoveredNav
    ? Math.max(0, navItems.findIndex((i) => i.key === hoveredNav))
    : null
  const indicatorIndex = hoveredIndex ?? activeIndex

  const getColor = (status) => {
    if (status === 'Aprobado') return '#16a34a'
    if (status === 'Pendiente') return '#f59e0b'
    if (status === 'Urgente') return '#dc2626'
  }

  const workshopInfo = workshopData[workshopVehicle] ?? workshopDataFallback
  const selectedDriver =
    drivers.find((d) => d.id === selectedDriverId) ?? drivers[0]
  const reportAutos = ['Todos', ...new Set(reportRows.map((r) => r.auto))]
  const reportChoferes = ['Todos', ...new Set(reportRows.map((r) => r.chofer))]
  const reportDepts = ['Todos', ...new Set(reportRows.map((r) => r.departamento))]
  const filteredReports = reportRows.filter((r) => {
    const query = reportSearch.trim().toLowerCase()
    const matchesSearch =
      !query ||
      `${r.departamento} ${r.auto} ${r.chofer} ${r.solicitudes} ${r.taller} ${r.kilometraje}`
        .toLowerCase()
        .includes(query)
    const matchesAuto = reportAuto === 'Todos' || r.auto === reportAuto
    const matchesChofer = reportChofer === 'Todos' || r.chofer === reportChofer
    const matchesDept = reportDept === 'Todos' || r.departamento === reportDept

    return matchesSearch && matchesAuto && matchesChofer && matchesDept
  })

  return (
    <div style={layout}>

      {/* SIDEBAR */}
      <div style={sidebar}>
        <div style={brand}>
          <div style={brandMark}>MIVIOT</div>
          <div>
            <div style={brandSub}>Control & Operaciones</div>
          </div>
        </div>

        <nav style={nav}>
          <div
            className="nav-indicator"
            style={{
              ...navIndicator,
              transform: `translateY(${indicatorIndex * (NAV_ITEM_H + NAV_GAP)}px)`
            }}
          />
          {navItems.map((item) => {
            const isActive = item.key === activeNav
            return (
              <div
                key={item.key}
                className={`nav-item${isActive ? ' is-active' : ''}`}
                style={isActive ? navItemActive : navItem}
                onMouseEnter={() => setHoveredNav(item.key)}
                onMouseLeave={() => setHoveredNav(null)}
                onClick={() => setActiveNav(item.key)}
              >
                {item.label}
              </div>
            )
          })}
        </nav>
      </div>

      {/* MAIN */}
      <div style={main}>
        {activeNav === 'reportes' ? (
          <>
            <header style={headerBlock}>
              <h1 style={title}>Reportes</h1>
              <p style={subtitle}>
                Panel demo para revisar y solicitar reportes operativos
              </p>
            </header>

            <div style={reportPanel}>
              <div style={reportToolbar}>
                <div style={reportFilterBlock}>
                  <label style={workshopLabel} htmlFor="report-auto">Auto</label>
                  <select
                    id="report-auto"
                    value={reportAuto}
                    onChange={(e) => setReportAuto(e.target.value)}
                    style={reportSelect}
                  >
                    {reportAutos.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>

                <div style={reportFilterBlock}>
                  <label style={workshopLabel} htmlFor="report-chofer">Chofer</label>
                  <select
                    id="report-chofer"
                    value={reportChofer}
                    onChange={(e) => setReportChofer(e.target.value)}
                    style={reportSelect}
                  >
                    {reportChoferes.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>

                <div style={reportFilterBlock}>
                  <label style={workshopLabel} htmlFor="report-dep">Departamento</label>
                  <select
                    id="report-dep"
                    value={reportDept}
                    onChange={(e) => setReportDept(e.target.value)}
                    style={reportSelect}
                  >
                    {reportDepts.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>

                <div style={reportSearchBlock}>
                  <label style={workshopLabel} htmlFor="report-search">Búsqueda</label>
                  <input
                    id="report-search"
                    type="text"
                    value={reportSearch}
                    onChange={(e) => setReportSearch(e.target.value)}
                    placeholder="Buscar por auto, chofer, taller, departamento..."
                    style={reportSearchInput}
                  />
                </div>
              </div>

              <div style={reportActions}>
                <button style={reportBtnPrimary}>Solicitar reporte</button>
                <button style={reportBtnGhost}>Modificar selección</button>
                <span style={reportCount}>{filteredReports.length} resultados</span>
              </div>

              <div style={reportTableWrap}>
                <table style={reportTable}>
                  <thead>
                    <tr>
                      <th style={reportTh}>Departamento</th>
                      <th style={reportTh}>Auto</th>
                      <th style={reportTh}>Chofer</th>
                      <th style={reportTh}>Solicitudes</th>
                      <th style={reportTh}>Taller</th>
                      <th style={reportTh}>Kilometraje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.map((row) => (
                      <tr key={row.id}>
                        <td style={reportTd}>{row.departamento}</td>
                        <td style={reportTd}>{row.auto}</td>
                        <td style={reportTd}>{row.chofer}</td>
                        <td style={reportTd}>{row.solicitudes}</td>
                        <td style={reportTd}>{row.taller}</td>
                        <td style={reportTd}>{row.kilometraje}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : activeNav === 'taller' ? (
          <>
            <header style={headerBlock}>
              <h1 style={title}>Taller</h1>
              <p style={subtitle}>
                Historial de mantenimiento y reparaciones por vehículo
              </p>
            </header>

            <div style={workshopPanel}>
              <div style={workshopRow}>
                <label style={workshopLabel} htmlFor="vehicle">
                  Vehículo
                </label>
                <select
                  id="vehicle"
                  value={workshopVehicle}
                  onChange={(e) => setWorkshopVehicle(e.target.value)}
                  style={workshopSelect}
                >
                  {vehicles.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div style={workshopGrid}>
                <div style={workshopCard}>
                  <div style={workshopCardLabel}>Kilómetros</div>
                  <div style={workshopCardValue}>{workshopInfo.km}</div>
                </div>
                <div style={workshopCard}>
                  <div style={workshopCardLabel}>Último mantenimiento</div>
                  <div style={workshopCardValue}>{workshopInfo.lastMaintenance}</div>
                </div>
                <div style={workshopCardWide}>
                  <div style={workshopCardLabel}>Última reparación hecha</div>
                  <div style={workshopCardText}>{workshopInfo.lastRepair}</div>
                </div>
              </div>
            </div>
          </>
        ) : activeNav === 'choferes' ? (
          <>
            <header style={headerBlock}>
              <h1 style={title}>Choferes</h1>
              <p style={subtitle}>
                Calificación y reporte de calidad (1–5) estilo Uber
              </p>
            </header>

            <div style={driverPanel}>
              <div style={driverHeader}>
                <div>
                  <div style={driverTitle}>Perfil</div>
                  <div style={driverSubtitle}>
                    Historial de calidad y experiencia de usuarios
                  </div>
                </div>
                <div style={driverPicker}>
                  <label style={workshopLabel} htmlFor="driver">
                    Chofer
                  </label>
                  <select
                    id="driver"
                    value={selectedDriverId}
                    onChange={(e) => setSelectedDriverId(e.target.value)}
                    style={workshopSelect}
                  >
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={driverGrid}>
                <div style={workshopCard}>
                  <div style={workshopCardLabel}>Nombre</div>
                  <div style={workshopCardValueSm}>{selectedDriver.name}</div>
                </div>
                <div style={workshopCard}>
                  <div style={workshopCardLabel}>Cédula</div>
                  <div style={workshopCardValueSm}>{selectedDriver.cedula}</div>
                </div>
                <div style={workshopCard}>
                  <div style={workshopCardLabel}>Calificación</div>
                  <div style={ratingRow}>
                    <div style={ratingValue}>{selectedDriver.rating.toFixed(1)}</div>
                    <div
                      style={starsRow}
                      aria-label={`Calificación ${selectedDriver.rating} de 5`}
                    >
                      {renderStars(selectedDriver.rating)}
                    </div>
                  </div>
                  <div style={ratingBarBg}>
                    <div
                      style={{
                        ...ratingBarFill,
                        width: `${Math.max(
                          0,
                          Math.min(100, (selectedDriver.rating / 5) * 100)
                        )}%`
                      }}
                    />
                  </div>
                  <div style={ratingMeta}>
                    {selectedDriver.totalReviews} calificaciones · {selectedDriver.lastTrip}
                  </div>
                </div>
                <div style={workshopCardWide}>
                  <div style={workshopCardLabel}>Último reporte:</div>
                  <div style={workshopCardText}>{selectedDriver.report}</div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <header style={headerBlock}>
              <h1 style={title}>Centro de Control de Transporte</h1>
              <p style={subtitle}>Gestión operativa en tiempo real</p>
            </header>

            {/* KPIs */}
            <div style={cards}>
              <Card title="Vehículos disponibles" value="5" />
              <Card title="En servicio" value="3" />
              <Card title="Servicios hoy" value="8" />
              <Card title="Choferes activos" value="6" />
            </div>

            {/* CONTROLES */}
            <div style={controls}>
              <h3 style={dateTitle}>{currentRangeLabel}</h3>
            </div>

            {/* CALENDARIO */}
            <div style={calendarBox}>
              <FullCalendar
                ref={calendarRef}
                plugins={[timeGridPlugin, interactionPlugin]}
                locale={esLocale}
                firstDay={1}
                initialView="timeGridWeek"
                editable
                selectable
                nowIndicator
                events={events.map((e) => ({
                  ...e,
                  backgroundColor: getColor(e.status),
                  borderColor: getColor(e.status)
                }))}
                datesSet={(arg) =>
                  setCurrentRangeLabel(formatWeekRange(arg.start, arg.end))
                }
                eventClick={(info) => setSelectedEvent(info.event)}
              />
            </div>
          </>
        )}

        {/* MODAL */}
        {selectedEvent && (
          <div style={overlay} onClick={() => setSelectedEvent(null)}>
            <div style={modal} onClick={(e) => e.stopPropagation()}>
              <h2>{selectedEvent.title}</h2>
              <p>Inicio: {selectedEvent.start.toLocaleString()}</p>
              <p>Fin: {selectedEvent.end.toLocaleString()}</p>
              <button style={btnPrimary} onClick={() => setSelectedEvent(null)}>
                Cerrar
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ESTILO GLOBAL FULLCALENDAR + KPI */}
      <style>{`
        .kpi-card {
          transition: transform 0.22s ease, box-shadow 0.22s ease;
        }
        .kpi-card:hover {
          transform: translateY(-4px);
          box-shadow:
            0 4px 6px -1px rgba(15, 23, 42, 0.06),
            0 24px 48px -16px rgba(15, 23, 42, 0.18) !important;
        }
        .fc-day-today {
          background-color: #e0f2fe !important;
        }

        .fc-day {
          transition: background 0.2s;
        }

        .fc-day:hover {
          background-color: #f1f5f9;
        }

        .nav-item {
          user-select: none;
        }
        .nav-item:hover {
          filter: brightness(1.02);
          transform: translateY(-1px);
        }
        .nav-item {
          cursor: pointer;
        }
        .nav-indicator {
          will-change: transform;
        }
      `}</style>

    </div>
  )
}

/* COMPONENTE KPI */
function Card({ title, value }) {
  return (
    <div className="kpi-card" style={card}>
      <p style={cardNumber}>{value}</p>
      <p style={cardText}>{title}</p>
    </div>
  )
}

function renderStars(rating) {
  const full = Math.floor(rating)
  const half = rating - full >= 0.5
  const total = 5
  const stars = []

  for (let i = 0; i < total; i++) {
    const isFull = i < full
    const isHalf = i === full && half
    stars.push(
      <span
        key={i}
        style={{
          ...star,
          color: isFull || isHalf ? '#16a34a' : 'rgba(15, 23, 42, 0.18)'
        }}
      >
        {isHalf ? '★' : '★'}
      </span>
    )
  }

  return stars
}

/* ESTILOS */

const font =
  '"Plus Jakarta Sans", "Segoe UI", system-ui, -apple-system, sans-serif'

const layout = {
  display: 'flex',
  fontFamily: font,
  textAlign: 'left'
}

const sidebar = {
  width: 248,
  fontFamily: font,
  color: 'rgba(255,255,255,0.92)',
  padding: 22,
  height: '100vh',
  boxSizing: 'border-box',
  background: 'linear-gradient(180deg, #0b1220 0%, #0f1a2b 100%)',
  borderRight: '1px solid rgba(255,255,255,0.08)'
}

const brand = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  marginBottom: 18
}

const brandMark = {
  padding: '9px 12px',
  borderRadius: 12,
  background: 'rgba(22, 163, 74, 0.18)',
  border: '1px solid rgba(22, 163, 74, 0.38)',
  display: 'inline-flex',
  alignItems: 'center',
  fontWeight: 900,
  letterSpacing: '0.14em',
  fontSize: 12,
  color: 'rgba(255,255,255,0.96)',
  lineHeight: 1
}

const brandSub = {
  marginTop: 4,
  fontSize: 12,
  opacity: 0.72,
  letterSpacing: '0.02em'
}

const NAV_ITEM_H = 40
const NAV_GAP = 10

const nav = {
  marginTop: 10,
  display: 'flex',
  flexDirection: 'column',
  gap: NAV_GAP,
  position: 'relative'
}

const navItem = {
  height: NAV_ITEM_H,
  display: 'flex',
  alignItems: 'center',
  padding: '0 12px',
  borderRadius: 12,
  cursor: 'default',
  fontWeight: 600,
  fontSize: 13,
  letterSpacing: '0.02em',
  opacity: 0.78,
  transition: 'transform 0.2s ease, filter 0.2s ease'
}

const navItemActive = {
  ...navItem,
  opacity: 1,
  color: 'rgba(255,255,255,0.98)',
  background: 'rgba(22, 163, 74, 0.18)',
  border: '1px solid rgba(22, 163, 74, 0.35)',
  boxShadow: '0 10px 28px -18px rgba(22, 163, 74, 0.6)'
}

const navIndicator = {
  position: 'absolute',
  left: 0,
  right: 0,
  height: NAV_ITEM_H,
  borderRadius: 12,
  background: 'rgba(22, 163, 74, 0.12)',
  border: '1px solid rgba(22, 163, 74, 0.22)',
  boxShadow: '0 10px 28px -18px rgba(22, 163, 74, 0.45)',
  transition: 'transform 0.22s ease',
  pointerEvents: 'none'
}
const main = {
  flex: 1,
  padding: '36px 32px',
  background:
    'linear-gradient(165deg, #eef2f7 0%, #e8edf4 45%, #f1f5f9 100%)',
  minWidth: 0
}

const headerBlock = {
  margin: '0 auto 28px',
  textAlign: 'center',
  maxWidth: 720
}

const title = {
  fontSize: 'clamp(1.65rem, 2.5vw, 2.125rem)',
  fontWeight: 700,
  lineHeight: 1.2,
  letterSpacing: '-0.035em',
  margin: 0,
  marginBottom: 10,
  color: '#0f172a'
}

const subtitle = {
  margin: 0,
  marginBottom: 0,
  fontSize: 15,
  fontWeight: 500,
  letterSpacing: '0.01em',
  color: '#64748b',
  lineHeight: 1.5
}

const cards = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: 20,
  marginBottom: 32
}

const card = {
  background: 'rgba(255, 255, 255, 0.92)',
  padding: '26px 24px',
  borderRadius: 16,
  border: '1px solid rgba(148, 163, 184, 0.22)',
  boxShadow:
    '0 4px 6px -1px rgba(15, 23, 42, 0.06), 0 16px 36px -12px rgba(15, 23, 42, 0.14)',
  minWidth: 0,
  textAlign: 'center',
  backdropFilter: 'blur(8px)'
}

const cardNumber = {
  fontSize: 34,
  fontWeight: 700,
  letterSpacing: '-0.03em',
  margin: 0,
  marginBottom: 8,
  color: '#0f172a',
  lineHeight: 1
}

const cardText = {
  margin: 0,
  fontSize: 13,
  fontWeight: 600,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: '#475569',
  lineHeight: 1.35
}

const controls = {
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  marginBottom: 15
}

const dateTitle = {
  fontWeight: 600,
  fontSize: 15,
  letterSpacing: '0.02em',
  color: '#334155'
}

const workshopPanel = {
  background: 'rgba(255, 255, 255, 0.95)',
  borderRadius: 16,
  border: '1px solid rgba(148, 163, 184, 0.2)',
  boxShadow:
    '0 4px 6px -1px rgba(15, 23, 42, 0.05), 0 20px 40px -14px rgba(15, 23, 42, 0.12)',
  padding: 24
}

const workshopRow = {
  display: 'grid',
  gridTemplateColumns: '140px 1fr',
  alignItems: 'center',
  gap: 12,
  marginBottom: 18
}

const workshopLabel = {
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: '0.03em',
  textTransform: 'uppercase',
  color: '#475569'
}

const workshopSelect = {
  width: '100%',
  height: 44,
  borderRadius: 12,
  padding: '0 12px',
  border: '1px solid rgba(15, 23, 42, 0.12)',
  background: 'white',
  color: '#0f172a',
  fontSize: 14,
  fontWeight: 600,
  outline: 'none'
}

const workshopGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 16
}

const workshopCard = {
  background: 'rgba(255, 255, 255, 0.9)',
  border: '1px solid rgba(15, 23, 42, 0.08)',
  borderRadius: 14,
  padding: 16,
  boxShadow: '0 2px 10px rgba(15, 23, 42, 0.06)'
}

const workshopCardWide = {
  ...workshopCard,
  gridColumn: '1 / -1'
}

const workshopCardLabel = {
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: '#64748b',
  marginBottom: 10
}

const workshopCardValue = {
  fontSize: 20,
  fontWeight: 800,
  letterSpacing: '-0.02em',
  color: '#0f172a'
}

const workshopCardValueSm = {
  fontSize: 16,
  fontWeight: 800,
  letterSpacing: '-0.01em',
  color: '#0f172a'
}

const workshopCardText = {
  fontSize: 14,
  fontWeight: 600,
  lineHeight: 1.5,
  color: '#0f172a'
}

const driverPanel = {
  ...workshopPanel,
  marginTop: 18
}

const driverHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  gap: 16,
  marginBottom: 18
}

const driverTitle = {
  fontSize: 16,
  fontWeight: 900,
  letterSpacing: '-0.02em',
  color: '#0f172a'
}

const driverSubtitle = {
  marginTop: 6,
  fontSize: 13,
  fontWeight: 600,
  color: '#64748b'
}

const driverPicker = {
  display: 'grid',
  gridTemplateColumns: '84px 260px',
  alignItems: 'center',
  gap: 12
}

const driverGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: 16
}

const ratingRow = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  marginBottom: 10
}

const ratingValue = {
  fontSize: 20,
  fontWeight: 900,
  letterSpacing: '-0.02em',
  color: '#0f172a'
}

const starsRow = {
  display: 'flex',
  gap: 2,
  lineHeight: 1
}

const star = {
  fontSize: 16
}

const ratingBarBg = {
  height: 8,
  borderRadius: 999,
  background: 'rgba(15, 23, 42, 0.08)',
  overflow: 'hidden'
}

const ratingBarFill = {
  height: '100%',
  borderRadius: 999,
  background: 'linear-gradient(90deg, #16a34a, #22c55e)'
}

const ratingMeta = {
  marginTop: 10,
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.02em',
  color: '#64748b'
}

const reportPanel = {
  background: 'rgba(255, 255, 255, 0.95)',
  borderRadius: 16,
  border: '1px solid rgba(148, 163, 184, 0.2)',
  boxShadow:
    '0 4px 6px -1px rgba(15, 23, 42, 0.05), 0 20px 40px -14px rgba(15, 23, 42, 0.12)',
  padding: 24
}

const reportToolbar = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(160px, 1fr)) minmax(280px, 1.3fr)',
  gap: 12,
  marginBottom: 14
}

const reportFilterBlock = {
  display: 'grid',
  gap: 6
}

const reportSearchBlock = {
  display: 'grid',
  gap: 6
}

const reportSelect = {
  ...workshopSelect,
  height: 42
}

const reportSearchInput = {
  height: 42,
  borderRadius: 12,
  padding: '0 12px',
  border: '1px solid rgba(15, 23, 42, 0.12)',
  background: 'white',
  color: '#0f172a',
  fontSize: 14,
  fontWeight: 600,
  outline: 'none'
}

const reportActions = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  marginBottom: 14
}

const reportBtnPrimary = {
  height: 38,
  padding: '0 14px',
  borderRadius: 10,
  border: 'none',
  background: '#16a34a',
  color: 'white',
  fontWeight: 700,
  cursor: 'pointer'
}

const reportBtnGhost = {
  height: 38,
  padding: '0 14px',
  borderRadius: 10,
  border: '1px solid rgba(15, 23, 42, 0.16)',
  background: 'white',
  color: '#0f172a',
  fontWeight: 700,
  cursor: 'pointer'
}

const reportCount = {
  marginLeft: 'auto',
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.03em',
  textTransform: 'uppercase',
  color: '#64748b'
}

const reportTableWrap = {
  overflowX: 'auto',
  borderRadius: 12,
  border: '1px solid rgba(15, 23, 42, 0.09)'
}

const reportTable = {
  width: '100%',
  borderCollapse: 'collapse',
  minWidth: 760
}

const reportTh = {
  textAlign: 'left',
  padding: '11px 12px',
  background: 'rgba(22, 163, 74, 0.1)',
  color: '#14532d',
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  borderBottom: '1px solid rgba(15, 23, 42, 0.09)'
}

const reportTd = {
  padding: '11px 12px',
  fontSize: 14,
  fontWeight: 600,
  color: '#0f172a',
  borderBottom: '1px solid rgba(15, 23, 42, 0.07)'
}

function formatWeekRange(startDate, endDateExclusive) {
  const endDate = new Date(endDateExclusive)
  endDate.setDate(endDate.getDate() - 1)

  const sameMonth = startDate.getMonth() === endDate.getMonth()
  const sameYear = startDate.getFullYear() === endDate.getFullYear()

  if (sameMonth && sameYear) {
    const monthYear = startDate.toLocaleDateString('es-ES', {
      month: 'long',
      year: 'numeric'
    })
    return `${startDate.getDate()}-${endDate.getDate()} de ${monthYear}`
  }

  return `${startDate.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })} - ${endDate.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })}`
}

const workshopDataFallback = {
  km: '—',
  lastMaintenance: '—',
  lastRepair:
    'Sin registros disponibles. Programa una inspección general para completar historial.'
}

const workshopData = {
  'Hilux 8': {
    km: '48,230 km',
    lastMaintenance: '12 mar 2026 · 45,900 km',
    lastRepair:
      'Cambio de pastillas de freno delanteras, rectificación ligera de discos y ajuste del sensor ABS. Prueba de ruta sin vibraciones.'
  },
  'Hilux 3': {
    km: '31,740 km',
    lastMaintenance: '05 mar 2026 · 30,500 km',
    lastRepair:
      'Reemplazo de batería y revisión de alternador (carga estable). Limpieza de bornes y recalibración de sistema eléctrico.'
  },
  'Hilux 11': {
    km: '62,105 km',
    lastMaintenance: '18 feb 2026 · 60,000 km',
    lastRepair:
      'Reparación de fuga menor en manguera de refrigerante, reemplazo de abrazaderas y purgado del sistema. Temperatura estable en prueba.'
  },
  'Prado 12': {
    km: '54,880 km',
    lastMaintenance: '20 mar 2026 · 54,200 km',
    lastRepair:
      'Alineación y balanceo, ajuste de presión TPMS y reemplazo de buje estabilizador delantero. Dirección más firme y sin ruido.'
  },
  'Prado 5': {
    km: '40,912 km',
    lastMaintenance: '01 mar 2026 · 39,800 km',
    lastRepair:
      'Cambio de amortiguador trasero derecho, revisión de soportes y prueba de suspensión. Se eliminó rebote en carretera.'
  },
  'Prado 9': {
    km: '27,450 km',
    lastMaintenance: '10 feb 2026 · 26,000 km',
    lastRepair:
      'Reemplazo de lámparas LED de faros y ajuste de altura. Revisión de cableado; sin falsos contactos.'
  },
  'Prado 14': {
    km: '19,360 km',
    lastMaintenance: '15 mar 2026 · 18,900 km',
    lastRepair:
      'Sustitución de filtro de combustible y limpieza de inyectores (servicio preventivo). Motor más estable al ralentí.'
  },
  'Fortuner 4': {
    km: '33,520 km',
    lastMaintenance: '22 mar 2026 · 33,000 km',
    lastRepair:
      'Revisión de sistema de frenos y cambio de líquido DOT4. Calibración de freno de mano y prueba de frenado OK.'
  },
  'Fortuner 2': {
    km: '29,905 km',
    lastMaintenance: '28 feb 2026 · 28,700 km',
    lastRepair:
      'Reemplazo de escobillas y motor de limpiaparabrisas (fallo intermitente). Verificación de fusibles y funcionamiento normal.'
  }
}

const driverData = [
  {
    id: 'drv-001',
    name: 'Carlos Mena',
    cedula: '001-1938475-2',
    rating: 4.9,
    totalReviews: 238,
    lastTrip: 'Último viaje: 23 mar 2026',
    report:
      'Me llevó tarde por no salir a tiempo. Se disculpó y avisó por llamada.'
  },
  {
    id: 'drv-002',
    name: 'María Fernanda Peña',
    cedula: '402-1183920-7',
    rating: 4.6,
    totalReviews: 164,
    lastTrip: 'Último viaje: 24 mar 2026',
    report:
      'No me fue a buscar a tiempo al punto acordado. Tuve que esperar 12 minutos.'
  },
  {
    id: 'drv-003',
    name: 'Juan Alberto Reyes',
    cedula: '225-0093811-4',
    rating: 4.2,
    totalReviews: 97,
    lastTrip: 'Último viaje: 25 mar 2026',
    report:
      'Corría mucho en la autopista. Manejo brusco en frenadas.'
  },
  {
    id: 'drv-004',
    name: 'Rosa Milagros Santana',
    cedula: '003-5748291-9',
    rating: 3.8,
    totalReviews: 54,
    lastTrip: 'Último viaje: 27 mar 2026',
    report:
      'Tenía aliento a alcohol. Solicité cambio de conductor y lo reporté al supervisor.'
  }
]

const reportRows = [
  {
    id: 'rep-01',
    departamento: 'Finanzas',
    auto: 'Hilux 8',
    chofer: 'Carlos Mena',
    solicitudes: 12,
    taller: 'Cambio de frenos',
    kilometraje: '48,230 km'
  },
  {
    id: 'rep-02',
    departamento: 'Compras',
    auto: 'Prado 5',
    chofer: 'María Fernanda Peña',
    solicitudes: 8,
    taller: 'Suspensión trasera',
    kilometraje: '40,912 km'
  },
  {
    id: 'rep-03',
    departamento: 'Operaciones',
    auto: 'Fortuner 4',
    chofer: 'Juan Alberto Reyes',
    solicitudes: 16,
    taller: 'Líquido de frenos',
    kilometraje: '33,520 km'
  },
  {
    id: 'rep-04',
    departamento: 'Logística',
    auto: 'Prado 9',
    chofer: 'Rosa Milagros Santana',
    solicitudes: 9,
    taller: 'Luces y cableado',
    kilometraje: '27,450 km'
  },
  {
    id: 'rep-05',
    departamento: 'Recursos Humanos',
    auto: 'Prado 12',
    chofer: 'Carlos Mena',
    solicitudes: 6,
    taller: 'Alineación y balanceo',
    kilometraje: '54,880 km'
  }
]

const calendarBox = {
  background: 'rgba(255, 255, 255, 0.95)',
  padding: 24,
  borderRadius: 16,
  border: '1px solid rgba(148, 163, 184, 0.2)',
  boxShadow:
    '0 4px 6px -1px rgba(15, 23, 42, 0.05), 0 20px 40px -14px rgba(15, 23, 42, 0.12)',
  backdropFilter: 'blur(8px)'
}

const overlay = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(0,0,0,0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999
}

const modal = {
  background: 'white',
  padding: 25,
  borderRadius: 10,
  width: 300,
  textAlign: 'center'
}

const btnPrimary = {
  marginTop: 15,
  padding: 10,
  background: '#2563eb',
  color: 'white',
  border: 'none',
  borderRadius: 6
}