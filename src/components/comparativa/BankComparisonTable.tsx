import React, { useMemo, useState } from "react"
import {
  OFERTAS_HIPOTECAS,
  ENTIDADES_SIN_OFERTA,
  type OfertaHipoteca,
} from "../../constants/hipotecas-bancos"
import { referalLink } from "../../constants/referal"
import { useGoogleAnalytics } from "../../hooks/useGoogleAnalytics"

const TIPOS = ["Todas", "Fija", "Variable", "Mixta"] as const
const CATEGORIAS = [
  "Todas",
  "Grande",
  "Online",
  "Mediano",
  "Cooperativa",
  "Banca ética",
  "Especialista",
  "Otro",
  "Extranjero",
] as const

const tipoBadgeClass: Record<OfertaHipoteca["tipo"], string> = {
  Fija: "bg-ink text-paper",
  Variable: "bg-brand-blue/10 text-brand-blue",
  Mixta: "bg-lime/60 text-ink",
  "Fija/Variable": "bg-paper-2 text-ink",
  "Fija/Variable/Mixta": "bg-paper-2 text-ink",
  "Variable/Mixta": "bg-paper-2 text-ink",
}

// Primer porcentaje numérico de una cadena de tipos ("2,96% / 3,96%" -> 2.96;
// "Eur+0,84% / ..." -> 0.84, el diferencial). Sirve para detectar la dirección
// del cambio entre actualizaciones de datos.
// Versión corta para la fila principal: lo que va entre paréntesis se muestra
// completo en el panel desplegable
function corto(valor: string): string {
  return valor.split(" (")[0].trim()
}

function primerPorcentaje(valor: string | undefined): number | null {
  if (!valor) return null
  const m = valor.match(/(\d+(?:[.,]\d+)?)\s*%/)
  return m ? parseFloat(m[1].replace(",", ".")) : null
}

// Flecha de evolución del tipo respecto a la actualización anterior:
// roja hacia arriba si ha subido, verde hacia abajo si ha bajado.
const RateTrend: React.FC<{ actual: string; anterior?: string; antesLabel: string }> = ({
  actual,
  anterior,
  antesLabel,
}) => {
  const nuevo = primerPorcentaje(actual)
  const viejo = primerPorcentaje(anterior)
  if (nuevo === null || viejo === null || nuevo === viejo) return null

  const subida = nuevo > viejo
  return (
    <span
      className="ml-1 font-data text-[13px] align-middle cursor-help"
      style={{ color: subida ? "var(--color-negative)" : "var(--color-positive)" }}
      title={`${antesLabel}: ${anterior}`}
      aria-label={`${antesLabel}: ${anterior}`}
    >
      {subida ? "▲" : "▼"}
    </span>
  )
}

// Etiquetas de la interfaz. Los datos de las ofertas (vinculaciones,
// comisiones, notas) proceden de las FIPRE en español y no se traducen.
const LABELS = {
  es: {
    buscar: 'Buscar banco o producto',
    placeholder: 'Ej: Santander, mixta, NARANJA…',
    tipoHipoteca: 'Tipo de hipoteca',
    tipoEntidad: 'Tipo de entidad',
    oferta: 'oferta',
    ofertas: 'ofertas',
    banco: 'Banco', producto: 'Producto', tipo: 'Tipo',
    tin: 'TIN (bonif. / sin)', tae: 'TAE (bonif. / sin)',
    plazo: 'Plazo máx.', financiacion: 'Financiación',
    diferencial: 'Diferencial / tramo fijo',
    vinculaciones: 'Vinculaciones / bonificaciones',
    comisiones: 'Comisiones',
    requisitos: 'Requisitos / notas',
    sinResultados: 'Ninguna oferta coincide con los filtros seleccionados.',
    antes: 'antes',
    sinOferta: 'Entidades consultadas que no comercializan hipotecas',
    tipoValor: (v: string) => v,
    categoriaValor: (v: string) => v,
    promoTag: 'Nuestro servicio',
    promoTitulo: 'Mejora la hipoteca con nosotros',
    promoBadge: 'Fija · Variable · Mixta',
    promoTexto: 'Nuestro bróker compara tu caso con todo el mercado y negocia por ti. Estudio gratuito y sin compromiso.',
    promoCta: 'Quiero mejorar mi hipoteca',
  },
  en: {
    buscar: 'Search bank or product',
    placeholder: 'E.g.: Santander, mixed, NARANJA…',
    tipoHipoteca: 'Mortgage type',
    tipoEntidad: 'Institution type',
    oferta: 'offer',
    ofertas: 'offers',
    banco: 'Bank', producto: 'Product', tipo: 'Type',
    tin: 'TIN (bonus / without)', tae: 'APR (bonus / without)',
    plazo: 'Max. term', financiacion: 'Financing',
    diferencial: 'Spread / fixed period',
    vinculaciones: 'Bundled products / discounts',
    comisiones: 'Fees',
    requisitos: 'Requirements / notes',
    sinResultados: 'No offers match the selected filters.',
    antes: 'previously',
    sinOferta: 'Institutions surveyed that do not sell mortgages',
    tipoValor: (v: string) => ({ Todas: 'All', Fija: 'Fixed', Variable: 'Variable', Mixta: 'Mixed', 'Fija/Variable': 'Fixed/Variable', 'Fija/Variable/Mixta': 'Fixed/Variable/Mixed', 'Variable/Mixta': 'Variable/Mixed' }[v] ?? v),
    categoriaValor: (v: string) => ({ Todas: 'All', Grande: 'Large', Online: 'Online', Mediano: 'Mid-size', Cooperativa: 'Cooperative', 'Banca ética': 'Ethical bank', Especialista: 'Specialist', Otro: 'Other', Extranjero: 'Foreign' }[v] ?? v),
    promoTag: 'Our service',
    promoTitulo: 'Improve your mortgage with us',
    promoBadge: 'Fixed · Variable · Mixed',
    promoTexto: 'Our broker benchmarks your case against the whole market and negotiates for you. Free, no-obligation review.',
    promoCta: 'Improve my mortgage',
  },
}

interface BankComparisonTableProps {
  lang?: 'es' | 'en'
}

const BankComparisonTable: React.FC<BankComparisonTableProps> = ({ lang = 'es' }) => {
  const t = LABELS[lang]
  const { trackContactAttempt } = useGoogleAnalytics()
  const [tipo, setTipo] = useState<(typeof TIPOS)[number]>("Todas")
  const [categoria, setCategoria] = useState<(typeof CATEGORIAS)[number]>("Todas")
  const [busqueda, setBusqueda] = useState("")
  const [expandida, setExpandida] = useState<number | null>(null)

  const ofertas = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return OFERTAS_HIPOTECAS.filter((o) => {
      if (tipo !== "Todas" && !o.tipo.split("/").includes(tipo)) return false
      if (categoria !== "Todas" && o.categoria !== categoria) return false
      if (q && !`${o.banco} ${o.producto}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [tipo, categoria, busqueda])

  return (
    <div className="w-full">
      {/* Filtros */}
      <div className="pl-card p-4 md:p-5 mb-6 flex flex-col md:flex-row gap-4 md:items-end">
        <div className="flex-1">
          <label htmlFor="busqueda-banco" className="label-pl">
            {t.buscar}
          </label>
          <input
            id="busqueda-banco"
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder={t.placeholder}
            className="input-pl"
          />
        </div>
        <div>
          <label htmlFor="filtro-tipo" className="label-pl">
            {t.tipoHipoteca}
          </label>
          <select
            id="filtro-tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as (typeof TIPOS)[number])}
            className="input-pl"
          >
            {TIPOS.map((v) => (
              <option key={v} value={v}>
                {t.tipoValor(v)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="filtro-categoria" className="label-pl">
            {t.tipoEntidad}
          </label>
          <select
            id="filtro-categoria"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value as (typeof CATEGORIAS)[number])}
            className="input-pl"
          >
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {t.categoriaValor(c)}
              </option>
            ))}
          </select>
        </div>
        <div className="font-data text-xs text-ink-soft whitespace-nowrap pb-2">
          {ofertas.length} {ofertas.length === 1 ? t.oferta : t.ofertas}
        </div>
      </div>

      {/* Tabla */}
      <div className="pl-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-fixed min-w-[760px] lg:min-w-0">
            <thead>
              <tr className="border-b border-line bg-paper-2/60 font-data text-[11px] uppercase tracking-wider text-ink-soft">
                <th className="text-left py-3 px-3 w-[15%]">{t.banco}</th>
                <th className="text-left py-3 px-2 w-[19%]">{t.producto}</th>
                <th className="text-left py-3 px-2 w-[9%]">{t.tipo}</th>
                <th className="text-left py-3 px-2 w-[16%]">{t.tin}</th>
                <th className="text-left py-3 px-2 w-[14%]">{t.tae}</th>
                <th className="text-left py-3 px-2 w-[11%]">{t.plazo}</th>
                <th className="text-left py-3 px-2 w-[12%]">{t.financiacion}</th>
                <th className="text-left py-3 px-2 w-[4%]" aria-label="Detalle"></th>
              </tr>
            </thead>
            <tbody>
              {/* Fila destacada: servicio de mejora de hipoteca. Siempre visible,
                  por encima de todas las ofertas e independiente de los filtros. */}
              <tr className="border-b-2 border-lime bg-lime/15">
                <td className="py-4 px-3 font-semibold text-ink">
                  Hipotecalc
                  <div className="font-data text-[10px] uppercase tracking-wide text-ink-soft font-normal">
                    {t.promoTag}
                  </div>
                </td>
                <td colSpan={2} className="py-4 px-2">
                  <span className="font-semibold text-ink">{t.promoTitulo}</span>
                  <div className="mt-1">
                    <span className="inline-block rounded-full px-2.5 py-0.5 font-data text-[11px] bg-ink text-paper whitespace-nowrap">
                      {t.promoBadge}
                    </span>
                  </div>
                </td>
                <td colSpan={5} className="py-4 px-2">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-2.5 lg:gap-4">
                    <span className="text-ink-soft text-[13px] leading-snug">{t.promoTexto}</span>
                    <a
                      href={referalLink}
                      target="_blank"
                      rel="sponsored noopener noreferrer"
                      className="cta-broker px-4 py-2 text-xs whitespace-nowrap self-start lg:self-auto shrink-0"
                      onClick={() => trackContactAttempt("comparativa_mejora_hipoteca")}
                    >
                      <span className="cta-dot"></span>
                      {t.promoCta}
                    </a>
                  </div>
                </td>
              </tr>
              {ofertas.map((o, i) => (
                <React.Fragment key={`${o.banco}-${o.producto}-${i}`}>
                  <tr
                    className="border-b border-line/60 hover:bg-paper-2/40 cursor-pointer transition-colors"
                    onClick={() => setExpandida(expandida === i ? null : i)}
                  >
                    <td className="py-3 px-3 font-semibold text-ink">
                      {o.banco}
                      <div className="font-data text-[10px] uppercase tracking-wide text-ink-soft font-normal">
                        {lang === "en" ? t.categoriaValor(o.categoria) : o.categoria}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-ink-soft">{o.producto}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 font-data text-[11px] ${tipoBadgeClass[o.tipo]}`}
                      >
                        {lang === "en" ? t.tipoValor(o.tipo) : o.tipo}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-ink">{o.tin || "N/D"}<RateTrend actual={o.tin} anterior={o.tinAnterior} antesLabel={t.antes} /></td>
                    <td className="py-3 px-2 text-ink">{o.tae || "N/D"}<RateTrend actual={o.tae} anterior={o.taeAnterior} antesLabel={t.antes} /></td>
                    <td className="py-3 px-2 text-ink-soft">{corto(o.plazoMax) || "N/D"}</td>
                    <td className="py-3 px-2 text-ink-soft">{corto(o.financiacionMax) || "N/D"}</td>
                    <td className="py-3 px-3 text-ink-soft" aria-hidden="true">
                      <span
                        className={`inline-block transition-transform ${expandida === i ? "rotate-180" : ""}`}
                      >
                        ▾
                      </span>
                    </td>
                  </tr>
                  {expandida === i && (
                    <tr className="border-b border-line/60 bg-paper-2/30">
                      <td colSpan={8} className="py-4 px-4">
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                          {corto(o.plazoMax) !== o.plazoMax && (
                            <div>
                              <dt className="font-data text-[10.5px] uppercase tracking-wide text-ink-soft">{t.plazo}</dt>
                              <dd className="text-ink">{o.plazoMax}</dd>
                            </div>
                          )}
                          {corto(o.financiacionMax) !== o.financiacionMax && (
                            <div>
                              <dt className="font-data text-[10.5px] uppercase tracking-wide text-ink-soft">{t.financiacion}</dt>
                              <dd className="text-ink">{o.financiacionMax}</dd>
                            </div>
                          )}
                          {o.diferencial && (
                            <div>
                              <dt className="font-data text-[10.5px] uppercase tracking-wide text-ink-soft">{t.diferencial}</dt>
                              <dd className="text-ink">{o.diferencial}</dd>
                            </div>
                          )}
                          {o.vinculaciones && (
                            <div>
                              <dt className="font-data text-[10.5px] uppercase tracking-wide text-ink-soft">{t.vinculaciones}</dt>
                              <dd className="text-ink">{o.vinculaciones}</dd>
                            </div>
                          )}
                          {o.comisiones && (
                            <div>
                              <dt className="font-data text-[10.5px] uppercase tracking-wide text-ink-soft">{t.comisiones}</dt>
                              <dd className="text-ink">{o.comisiones}</dd>
                            </div>
                          )}
                          {o.requisitos && (
                            <div>
                              <dt className="font-data text-[10.5px] uppercase tracking-wide text-ink-soft">{t.requisitos}</dt>
                              <dd className="text-ink">{o.requisitos}</dd>
                            </div>
                          )}
                        </dl>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {ofertas.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 px-4 text-center text-ink-soft">
                    {t.sinResultados}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Entidades sin oferta */}
      <details className="mt-8 pl-card p-5">
        <summary className="cursor-pointer font-heading font-semibold text-ink">
          {t.sinOferta} ({ENTIDADES_SIN_OFERTA.length})
        </summary>
        <ul className="mt-4 space-y-2 text-sm text-ink-soft list-disc pl-6">
          {ENTIDADES_SIN_OFERTA.map((e) => (
            <li key={e.banco}>
              <strong className="text-ink">{e.banco}:</strong> {e.nota}
            </li>
          ))}
        </ul>
      </details>
    </div>
  )
}

export default BankComparisonTable
