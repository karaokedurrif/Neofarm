'use client'
import { useState } from 'react'
import PageShell from '@/components/shared/PageShell'
import {
  FlaskConical, Brain, TrendingUp, Grape, Thermometer, Droplets,
  Wind, Sun, Satellite, BarChart3, AlertTriangle, ChevronRight,
  Sparkles, Calendar, MapPin, CloudRain, ArrowUpRight, ArrowDownRight
} from 'lucide-react'

/* ════════════════════════════════════════════════════════
   DATOS: Repositorio histórico de añadas
   ════════════════════════════════════════════════════════ */

type Vintage = {
  year: number
  parcela: string
  variedad: string
  baume: number
  ph: number
  at: number         // acidez total g/L
  ipp: number       // IPT índice polifenoles totales
  anthocyanins: number
  color: number
  alcohol: number
  score: number      // puntuación bodega 0-100
  harvestDate: string
  yield_kg: number
  notes: string
  weather: { tempMedia: number; lluvia_mm: number; hdd: number /* Heat Degree Days */ }
}

const vintages: Vintage[] = [
  { year: 2025, parcela: 'Piloto-1', variedad: 'Tempranillo', baume: 13.8, ph: 3.52, at: 5.6, ipp: 72, anthocyanins: 340, color: 92, alcohol: 14.2, score: 91, harvestDate: '28/09/2025', yield_kg: 4800, notes: 'Año excepcional. Verano seco, maduración lenta.', weather: { tempMedia: 17.8, lluvia_mm: 310, hdd: 1850 } },
  { year: 2024, parcela: 'Piloto-1', variedad: 'Tempranillo', baume: 13.2, ph: 3.48, at: 5.9, ipp: 68, anthocyanins: 315, color: 88, alcohol: 13.8, score: 87, harvestDate: '02/10/2024', yield_kg: 5200, notes: 'Buen año con lluvias tardías en sept.', weather: { tempMedia: 17.2, lluvia_mm: 380, hdd: 1780 } },
  { year: 2023, parcela: 'Piloto-1', variedad: 'Tempranillo', baume: 12.5, ph: 3.55, at: 5.3, ipp: 60, anthocyanins: 280, color: 80, alcohol: 13.2, score: 78, harvestDate: '25/09/2023', yield_kg: 5600, notes: 'Ola de calor agosto. Estrés hídrico.', weather: { tempMedia: 18.5, lluvia_mm: 240, hdd: 1920 } },
  { year: 2022, parcela: 'Piloto-1', variedad: 'Tempranillo', baume: 13.5, ph: 3.50, at: 5.7, ipp: 70, anthocyanins: 330, color: 90, alcohol: 14.0, score: 89, harvestDate: '30/09/2022', yield_kg: 4900, notes: 'Equilibrio ideal acidez-azúcar. Gran añada.', weather: { tempMedia: 17.5, lluvia_mm: 350, hdd: 1820 } },
  { year: 2021, parcela: 'Piloto-1', variedad: 'Tempranillo', baume: 12.8, ph: 3.42, at: 6.1, ipp: 64, anthocyanins: 295, color: 84, alcohol: 13.5, score: 83, harvestDate: '05/10/2021', yield_kg: 5400, notes: 'Primavera fría retrasó ciclo 10 días.', weather: { tempMedia: 16.8, lluvia_mm: 420, hdd: 1690 } },
  { year: 2025, parcela: 'Ladera-2', variedad: 'Tempranillo', baume: 14.0, ph: 3.48, at: 5.8, ipp: 75, anthocyanins: 360, color: 94, alcohol: 14.5, score: 93, harvestDate: '25/09/2025', yield_kg: 3800, notes: 'Parcela en ladera, menor rendimiento, mayor concentración.', weather: { tempMedia: 17.8, lluvia_mm: 310, hdd: 1850 } },
  { year: 2024, parcela: 'Ladera-2', variedad: 'Tempranillo', baume: 13.5, ph: 3.45, at: 6.0, ipp: 71, anthocyanins: 335, color: 90, alcohol: 14.0, score: 90, harvestDate: '28/09/2024', yield_kg: 4100, notes: 'Excelente concentración polifenólica.', weather: { tempMedia: 17.2, lluvia_mm: 380, hdd: 1780 } },
  { year: 2025, parcela: 'Ribera-3', variedad: 'Garnacha', baume: 13.0, ph: 3.60, at: 5.2, ipp: 55, anthocyanins: 220, color: 75, alcohol: 13.5, score: 82, harvestDate: '15/10/2025', yield_kg: 5800, notes: 'Garnacha en terraza aluvial, fresco y frutal.', weather: { tempMedia: 17.8, lluvia_mm: 310, hdd: 1850 } },
]

/* ════════════════════════════════════════════════════════
   DATOS: Analíticas recientes (last 30 days)
   ════════════════════════════════════════════════════════ */

const recentAnalyses = [
  { id: 'LAB-2026-047', date: '28/03/2026', sample: 'Depósito D03 (Crianza)', type: 'Completo', ph: 3.54, at: 5.2, va: 0.32, so2l: 28, so2t: 85, turbidez: 1.2, color: '#8B1A1A', status: 'OK' },
  { id: 'LAB-2026-046', date: '27/03/2026', sample: 'Barrica A5 (Tempranillo 2025)', type: 'Rutina', ph: 3.58, at: 5.0, va: 0.38, so2l: 22, so2t: 72, turbidez: 2.1, color: '#6B0F0F', status: 'Revisar VA' },
  { id: 'LAB-2026-045', date: '25/03/2026', sample: 'Depósito D01 (Joven)', type: 'Completo', ph: 3.48, at: 5.5, va: 0.28, so2l: 32, so2t: 95, turbidez: 0.8, color: '#A02020', status: 'OK' },
  { id: 'LAB-2026-044', date: '24/03/2026', sample: 'Coupage ensayo CF-12', type: 'Especial', ph: 3.52, at: 5.3, va: 0.30, so2l: 30, so2t: 88, turbidez: 1.5, color: '#7D1515', status: 'OK' },
  { id: 'LAB-2026-043', date: '22/03/2026', sample: 'Barrica B2 (Garnacha 2025)', type: 'Rutina', ph: 3.62, at: 4.8, va: 0.42, so2l: 18, so2t: 65, turbidez: 2.8, color: '#9A2828', status: '⚠ VA alta' },
  { id: 'LAB-2026-042', date: '20/03/2026', sample: 'Depósito D05 (Reserva)', type: 'Completo', ph: 3.55, at: 5.1, va: 0.35, so2l: 25, so2t: 78, turbidez: 1.8, color: '#5C0A0A', status: 'OK' },
]

/* ════════════════════════════════════════════════════════
   DATOS: Predicciones IA
   ════════════════════════════════════════════════════════ */

const aiPredictions = {
  harvestForecast: {
    parcela: 'Piloto-1',
    estimatedDate: '25-30 Sept 2026',
    confidence: 87,
    estimatedBaume: 13.6,
    estimatedYield: 4950,
    riskFactors: [
      { factor: 'Estrés hídrico julio', probability: 35, impact: 'Medio' },
      { factor: 'Helada tardía abril', probability: 12, impact: 'Alto' },
      { factor: 'Mildiu septiembre', probability: 22, impact: 'Medio' },
    ],
  },
  qualityIndex: 88,
  vintageComparison: 'Similar a 2022 (score 89). Modelo detecta patrón HDD + lluvia acumulada comparable.',
  recommendations: [
    { action: 'Reducir riego parcela Piloto-1 desde 15/jul', reason: 'HDD acumulado alto → estrés controlado mejora concentración', priority: 'Alta' },
    { action: 'Aumentar muestreo semanal desde envero', reason: 'Correlación 0.92 entre frecuencia muestreo y timing óptimo vendimia', priority: 'Media' },
    { action: 'Monitorizar SO₂ libre en Barrica A5 y B2', reason: 'VA trending up — modelo predice riesgo acescencia si SO₂l < 20 mg/L', priority: 'Alta' },
    { action: 'Preparar tratamiento preventivo mildiu', reason: 'Modelo meteorológico prevé humedad >80% + T>18°C en sept', priority: 'Media' },
  ],
}

/* ════════════════════════════════════════════════════════
   DATOS: Correlaciones IoT en tiempo real
   ════════════════════════════════════════════════════════ */

const iotCorrelations = [
  { sensor: 'Temp suelo 20cm', value: '14.2°C', trend: 'up', correlation: 'Cada +1°C acelera envero 2.3 días (R²=0.89)', icon: Thermometer },
  { sensor: 'HR ambiente', value: '68%', trend: 'stable', correlation: 'HR >75% durante envero → -8% antocianos (5 añadas)', icon: Droplets },
  { sensor: 'Radiación PAR', value: '1850 µmol', trend: 'up', correlation: 'PAR acumulada correlaciona 0.94 con Baumé final', icon: Sun },
  { sensor: 'Viento medio', value: '8.2 km/h', trend: 'down', correlation: 'Viento >15 km/h en floración → -12% cuajado (2021, 2023)', icon: Wind },
  { sensor: 'Precip. acum.', value: '285 mm', trend: 'stable', correlation: 'Lluvia acum. 250-350mm = rango óptimo últimas 5 añadas', icon: CloudRain },
  { sensor: 'NDVI dron', value: '0.72', trend: 'up', correlation: 'NDVI >0.70 en envero predice score >85 (precisión 91%)', icon: Satellite },
]

/* ════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
   ════════════════════════════════════════════════════════ */

export default function LabPage() {
  const [selectedParcela, setSelectedParcela] = useState('all')
  const parcelas = ['all'].concat(Array.from(new Set(vintages.map(v => v.parcela))))

  const filteredVintages = selectedParcela === 'all'
    ? vintages
    : vintages.filter(v => v.parcela === selectedParcela)

  const avgScore = Math.round(filteredVintages.reduce((s, v) => s + v.score, 0) / filteredVintages.length)
  const bestVintage = [...filteredVintages].sort((a, b) => b.score - a.score)[0]

  return (
    <PageShell title="Laboratorio" subtitle="Analíticas · Repositorio de añadas · IA predictiva · Correlaciones IoT">

      {/* ── KPIs rápidos ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { icon: FlaskConical, label: 'Análisis este mes', value: `${recentAnalyses.length}`, color: 'var(--accent)' },
          { icon: Grape, label: 'Añadas registradas', value: `${vintages.length}`, color: 'var(--info)' },
          { icon: Brain, label: 'Score IA cosecha 2026', value: `${aiPredictions.qualityIndex}/100`, color: 'var(--success)' },
          { icon: TrendingUp, label: 'Media histórica score', value: `${avgScore}`, color: 'var(--accent)' },
          { icon: AlertTriangle, label: 'Alertas analíticas', value: recentAnalyses.filter(a => a.status !== 'OK').length.toString(), color: 'var(--warning)' },
        ].map((kpi, i) => {
          const I = kpi.icon
          return (
            <div key={kpi.label} className="card p-4 animate-in" style={{ animationDelay: `${i * 60}ms` }}>
              <I className="w-5 h-5 mb-2" style={{ color: kpi.color }} />
              <p className="text-xl font-bold">{kpi.value}</p>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{kpi.label}</p>
            </div>
          )
        })}
      </div>

      {/* ══════════════════════════════════════════════════
         SECCIÓN 1 — Predicción IA cosecha 2026
         ══════════════════════════════════════════════════ */}
      <div className="card-flat overflow-hidden">
        <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border)' }}>
          <Brain className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          <h3 className="font-medium">🤖 Predicción IA — Cosecha 2026</h3>
          <span className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ background: 'var(--success-muted)', color: 'var(--success)' }}>
            Confianza {aiPredictions.harvestForecast.confidence}%
          </span>
        </div>

        <div className="p-4 space-y-4">
          {/* Forecast cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-lg p-3" style={{ background: 'var(--surface)' }}>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Fecha vendimia est.</p>
              <p className="text-sm font-bold mt-1">{aiPredictions.harvestForecast.estimatedDate}</p>
            </div>
            <div className="rounded-lg p-3" style={{ background: 'var(--surface)' }}>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Baumé previsto</p>
              <p className="text-sm font-bold mt-1" style={{ color: 'var(--accent)' }}>{aiPredictions.harvestForecast.estimatedBaume}°</p>
            </div>
            <div className="rounded-lg p-3" style={{ background: 'var(--surface)' }}>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Rendimiento est.</p>
              <p className="text-sm font-bold mt-1">{aiPredictions.harvestForecast.estimatedYield.toLocaleString()} kg</p>
            </div>
            <div className="rounded-lg p-3" style={{ background: 'var(--surface)' }}>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Índice calidad</p>
              <p className="text-sm font-bold mt-1" style={{ color: 'var(--success)' }}>{aiPredictions.qualityIndex}/100</p>
            </div>
          </div>

          {/* Vintage comparison insight */}
          <div className="flex items-start gap-2 px-3 py-2 rounded-lg text-xs" style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)' }}>
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              <strong>Insight IA:</strong> {aiPredictions.vintageComparison}
            </p>
          </div>

          {/* Risk factors */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Factores de riesgo detectados</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {aiPredictions.harvestForecast.riskFactors.map((r, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0" style={{
                    background: r.probability > 30 ? 'var(--warning-muted)' : 'var(--surface-hover)',
                    color: r.probability > 30 ? 'var(--warning)' : 'var(--text-muted)',
                  }}>
                    {r.probability}%
                  </div>
                  <div>
                    <p className="font-medium">{r.factor}</p>
                    <p style={{ color: 'var(--text-muted)' }}>Impacto: {r.impact}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Recommendations */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Recomendaciones IA</p>
            <div className="space-y-2">
              {aiPredictions.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-3 px-3 py-2.5 rounded-lg text-xs" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold" style={{
                    background: rec.priority === 'Alta' ? 'var(--danger-muted)' : 'var(--warning-muted)',
                    color: rec.priority === 'Alta' ? 'var(--danger)' : 'var(--warning)',
                  }}>
                    {rec.priority}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">{rec.action}</p>
                    <p className="mt-0.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{rec.reason}</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: 'var(--text-muted)' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
         SECCIÓN 2 — Correlaciones IoT en tiempo real
         ══════════════════════════════════════════════════ */}
      <div className="card-flat overflow-hidden">
        <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border)' }}>
          <Satellite className="w-4 h-4" style={{ color: 'var(--info)' }} />
          <h3 className="font-medium">📡 Correlaciones IoT × Analíticas en tiempo real</h3>
          <span className="ml-auto text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
            Actualizado hace 5 min
          </span>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {iotCorrelations.map((c, i) => {
              const I = c.icon
              const trendIcon = c.trend === 'up' ? ArrowUpRight : c.trend === 'down' ? ArrowDownRight : null
              const trendColor = c.trend === 'up' ? 'var(--success)' : c.trend === 'down' ? 'var(--danger)' : 'var(--text-muted)'
              return (
                <div key={i} className="flex items-start gap-3 px-3 py-3 rounded-lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(59,130,246,0.1)' }}>
                    <I className="w-4 h-4" style={{ color: 'var(--info)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">{c.sensor}</span>
                      <span className="font-mono text-xs font-bold">{c.value}</span>
                      {trendIcon && (() => { const T = trendIcon; return <T className="w-3 h-3" style={{ color: trendColor }} /> })()}
                    </div>
                    <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                      {c.correlation}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Live decision panel */}
          <div className="mt-4 p-3 rounded-lg" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4" style={{ color: 'var(--success)' }} />
              <span className="text-xs font-semibold" style={{ color: 'var(--success)' }}>Motor de decisión en tiempo real</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: 'var(--success)' }} />
                <span>HDD actual 1.120 → Modelo estima envero entre <strong>28 jul – 5 ago</strong> (±3 días vs media 5 añadas)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: 'var(--warning)' }} />
                <span>Si precipitación supera 400mm antes de vendimia → reducir score estimado a <strong>82-84</strong></span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: 'var(--info)' }} />
                <span>NDVI × temperatura suelo sugiere <strong>estrés hídrico moderado óptimo</strong> (similar a 2022/2025)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: 'var(--accent)' }} />
                <span>Correlación cruzada Baumé × PAR acumulada → ventana vendimia óptima estimada <strong>24 sept ± 4 días</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
         SECCIÓN 3 — Últimas analíticas
         ══════════════════════════════════════════════════ */}
      <div className="card-flat overflow-hidden">
        <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border)' }}>
          <FlaskConical className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          <h3 className="font-medium">Últimas analíticas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs font-medium" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
                <th className="px-4 py-2.5 text-left">ID</th>
                <th className="px-4 py-2.5 text-left">Fecha</th>
                <th className="px-4 py-2.5 text-left">Muestra</th>
                <th className="px-4 py-2.5 text-left">Tipo</th>
                <th className="px-4 py-2.5 text-left">pH</th>
                <th className="px-4 py-2.5 text-left">AT</th>
                <th className="px-4 py-2.5 text-left">VA</th>
                <th className="px-4 py-2.5 text-left">SO₂ L/T</th>
                <th className="px-4 py-2.5 text-left">Turb.</th>
                <th className="px-4 py-2.5 text-left">Estado</th>
              </tr>
            </thead>
            <tbody>
              {recentAnalyses.map(a => (
                <tr key={a.id} className="table-row" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td className="px-4 py-2.5 font-mono text-[11px]">{a.id}</td>
                  <td className="px-4 py-2.5 font-mono text-xs">{a.date}</td>
                  <td className="px-4 py-2.5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ background: a.color }} />
                      {a.sample}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-xs">{a.type}</td>
                  <td className="px-4 py-2.5 font-mono">{a.ph}</td>
                  <td className="px-4 py-2.5 font-mono">{a.at}</td>
                  <td className="px-4 py-2.5 font-mono" style={{ color: a.va > 0.40 ? 'var(--danger)' : a.va > 0.35 ? 'var(--warning)' : undefined }}>
                    {a.va}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs">{a.so2l}/{a.so2t}</td>
                  <td className="px-4 py-2.5 font-mono">{a.turbidez}</td>
                  <td className="px-4 py-2.5">
                    <span className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{
                      background: a.status === 'OK' ? 'var(--success-muted)' : 'var(--warning-muted)',
                      color: a.status === 'OK' ? 'var(--success)' : 'var(--warning)',
                    }}>
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
         SECCIÓN 4 — Repositorio histórico de añadas
         ══════════════════════════════════════════════════ */}
      <div className="card-flat overflow-hidden">
        <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" style={{ color: 'var(--info)' }} />
            <h3 className="font-medium">Repositorio de añadas</h3>
          </div>
          <div className="flex items-center gap-1">
            {parcelas.map(p => (
              <button
                key={p}
                onClick={() => setSelectedParcela(p)}
                className="px-2.5 py-1 rounded text-[11px] font-medium transition-all"
                style={{
                  background: selectedParcela === p ? 'var(--sidebar-active)' : 'transparent',
                  color: selectedParcela === p ? '#fff' : 'var(--text-muted)',
                }}
              >
                {p === 'all' ? 'Todas' : p}
              </button>
            ))}
          </div>
        </div>

        {/* Score timeline visual */}
        <div className="px-4 pt-4 pb-2">
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
            Evolución score por añada
          </p>
          <div className="flex items-end gap-2 h-28">
            {filteredVintages
              .sort((a, b) => a.year - b.year || a.parcela.localeCompare(b.parcela))
              .map((v, i) => {
                const h = ((v.score - 60) / 40) * 112
                const color = v.score >= 90 ? 'var(--success)' : v.score >= 85 ? 'var(--accent)' : v.score >= 80 ? 'var(--info)' : 'var(--warning)'
                return (
                  <div key={`${v.year}-${v.parcela}`} className="flex-1 flex flex-col items-center gap-0.5 group relative">
                    <div className="w-full rounded-t transition-all" style={{ height: Math.max(8, h), background: color, opacity: 0.7 }} />
                    <span className="text-[8px] font-mono text-[var(--text-muted)]">{v.year}</span>
                    <span className="text-[7px] text-[var(--text-muted)]">{v.parcela.split('-')[0]}</span>
                    <div className="absolute -top-8 hidden group-hover:block text-[9px] font-mono px-2 py-1 rounded z-10 whitespace-nowrap" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color }}>
                      {v.score}/100 · {v.parcela}
                    </div>
                  </div>
                )
              })}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs font-medium" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
                <th className="px-4 py-2.5 text-left">Año</th>
                <th className="px-4 py-2.5 text-left">Parcela</th>
                <th className="px-4 py-2.5 text-left">Variedad</th>
                <th className="px-4 py-2.5 text-left">Baumé</th>
                <th className="px-4 py-2.5 text-left">pH</th>
                <th className="px-4 py-2.5 text-left">IPT</th>
                <th className="px-4 py-2.5 text-left">Antoc.</th>
                <th className="px-4 py-2.5 text-left">Rto (kg)</th>
                <th className="px-4 py-2.5 text-left">Score</th>
                <th className="px-4 py-2.5 text-left">Meteo</th>
                <th className="px-4 py-2.5 text-left">Notas</th>
              </tr>
            </thead>
            <tbody>
              {filteredVintages
                .sort((a, b) => b.year - a.year || a.parcela.localeCompare(b.parcela))
                .map(v => {
                  const scoreColor = v.score >= 90 ? 'var(--success)' : v.score >= 85 ? 'var(--accent)' : v.score >= 80 ? 'var(--info)' : 'var(--warning)'
                  return (
                    <tr key={`${v.year}-${v.parcela}`} className="table-row" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td className="px-4 py-2.5 font-mono font-bold">{v.year}</td>
                      <td className="px-4 py-2.5">
                        <span className="flex items-center gap-1 text-xs"><MapPin className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />{v.parcela}</span>
                      </td>
                      <td className="px-4 py-2.5 text-xs">{v.variedad}</td>
                      <td className="px-4 py-2.5 font-mono" style={{ color: 'var(--accent)' }}>{v.baume}°</td>
                      <td className="px-4 py-2.5 font-mono">{v.ph}</td>
                      <td className="px-4 py-2.5 font-mono">{v.ipp}</td>
                      <td className="px-4 py-2.5 font-mono">{v.anthocyanins}</td>
                      <td className="px-4 py-2.5 font-mono">{v.yield_kg.toLocaleString()}</td>
                      <td className="px-4 py-2.5">
                        <span className="font-mono font-bold text-sm" style={{ color: scoreColor }}>{v.score}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="text-[10px] font-mono space-y-0.5" style={{ color: 'var(--text-muted)' }}>
                          <div>{v.weather.tempMedia}°C</div>
                          <div>{v.weather.lluvia_mm}mm</div>
                          <div>HDD {v.weather.hdd}</div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-[11px] max-w-[200px]" style={{ color: 'var(--text-muted)' }}>{v.notes}</td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
         SECCIÓN 5 — Modelo predictivo: cómo funciona
         ══════════════════════════════════════════════════ */}
      <div className="card-flat overflow-hidden">
        <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border)' }}>
          <BarChart3 className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          <h3 className="font-medium">🧬 Modelo predictivo — Cruce de datos</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Input features */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Datos de entrada</p>
              <div className="space-y-1.5">
                {[
                  'Temperatura suelo / aire (IoT)',
                  'Humedad relativa (IoT)',
                  'Radiación PAR acumulada (IoT)',
                  'Precipitación acumulada (meteo)',
                  'HDD — Heat Degree Days (calculado)',
                  'NDVI semanal (dron)',
                  'Analíticas históricas (5+ añadas)',
                  'Fechas fenológicas anteriores',
                  'Rendimiento por parcela/año',
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px]">
                    <span className="w-1 h-1 rounded-full" style={{ background: 'var(--accent)' }} />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Model pipeline */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Pipeline IA</p>
              <div className="space-y-2">
                {[
                  { step: 'Ingesta', desc: 'Datos IoT cada 15 min + meteo horaria + NDVI semanal' },
                  { step: 'Feature eng.', desc: 'HDD, GDD, índices estrés, acumulados rolling 7/14/30d' },
                  { step: 'Modelo', desc: 'Ensemble: XGBoost + LSTM temporal + regresión Bayesiana' },
                  { step: 'Validación', desc: 'Backtesting contra 5 añadas históricas (RMSE<0.3)' },
                  { step: 'Output', desc: 'Score calidad, fecha vendimia, rendimiento, alertas riesgo' },
                ].map((s, i) => (
                  <div key={i} className="flex items-start gap-2 text-[11px]">
                    <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-[9px]" style={{ background: 'var(--sidebar-active)', color: '#fff' }}>
                      {i + 1}
                    </span>
                    <div>
                      <span className="font-medium">{s.step}</span>
                      <span className="ml-1" style={{ color: 'var(--text-muted)' }}>— {s.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Output insights */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Insights generados</p>
              <div className="space-y-1.5">
                {[
                  '📅 Fecha vendimia óptima (±3 días)',
                  '🍇 Score calidad estimado (0-100)',
                  '⚖️ Rendimiento esperado (kg/ha)',
                  '⚠️ Alertas de riesgo fitosanitario',
                  '💧 Recomendación riego adaptativo',
                  '🧪 Predicción parámetros analíticos',
                  '📊 Comparación automática con añadas similares',
                  '🔄 Actualización continua con cada lectura IoT',
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px]">
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

    </PageShell>
  )
}
