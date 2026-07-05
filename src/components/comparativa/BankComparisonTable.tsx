import React, { useMemo, useState } from "react"
import {
  OFERTAS_HIPOTECAS,
  ENTIDADES_SIN_OFERTA,
  type OfertaHipoteca,
} from "../../constants/hipotecas-bancos"

const TIPOS = ["Todas", "Fija", "Variable", "Mixta"] as const
const CATEGORIAS = [
  "Todas",
  "Grande",
  "Online",
  "Mediano",
  "Cooperativa",
  "Banca ética",
  "Especialista",
] as const

const tipoBadgeClass: Record<OfertaHipoteca["tipo"], string> = {
  Fija: "bg-ink text-paper",
  Variable: "bg-brand-blue/10 text-brand-blue",
  Mixta: "bg-lime/60 text-ink",
}

const BankComparisonTable: React.FC = () => {
  const [tipo, setTipo] = useState<(typeof TIPOS)[number]>("Todas")
  const [categoria, setCategoria] = useState<(typeof CATEGORIAS)[number]>("Todas")
  const [busqueda, setBusqueda] = useState("")
  const [expandida, setExpandida] = useState<number | null>(null)

  const ofertas = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return OFERTAS_HIPOTECAS.filter((o) => {
      if (tipo !== "Todas" && o.tipo !== tipo) return false
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
            Buscar banco o producto
          </label>
          <input
            id="busqueda-banco"
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Ej: Santander, mixta, NARANJA…"
            className="input-pl"
          />
        </div>
        <div>
          <label htmlFor="filtro-tipo" className="label-pl">
            Tipo de hipoteca
          </label>
          <select
            id="filtro-tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as (typeof TIPOS)[number])}
            className="input-pl"
          >
            {TIPOS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="filtro-categoria" className="label-pl">
            Tipo de entidad
          </label>
          <select
            id="filtro-categoria"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value as (typeof CATEGORIAS)[number])}
            className="input-pl"
          >
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="font-data text-xs text-ink-soft whitespace-nowrap pb-2">
          {ofertas.length} oferta{ofertas.length === 1 ? "" : "s"}
        </div>
      </div>

      {/* Tabla */}
      <div className="pl-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="border-b border-line bg-paper-2/60 font-data text-[11px] uppercase tracking-wider text-ink-soft">
                <th className="text-left py-3 px-4">Banco</th>
                <th className="text-left py-3 px-3">Producto</th>
                <th className="text-left py-3 px-3">Tipo</th>
                <th className="text-left py-3 px-3">TIN (bonif. / sin)</th>
                <th className="text-left py-3 px-3">TAE (bonif. / sin)</th>
                <th className="text-left py-3 px-3">Plazo máx.</th>
                <th className="text-left py-3 px-3">Financiación</th>
                <th className="text-left py-3 px-3" aria-label="Detalle"></th>
              </tr>
            </thead>
            <tbody>
              {ofertas.map((o, i) => (
                <React.Fragment key={`${o.banco}-${o.producto}-${i}`}>
                  <tr
                    className="border-b border-line/60 hover:bg-paper-2/40 cursor-pointer transition-colors"
                    onClick={() => setExpandida(expandida === i ? null : i)}
                  >
                    <td className="py-3 px-4 font-semibold text-ink whitespace-nowrap">
                      {o.banco}
                      <div className="font-data text-[10px] uppercase tracking-wide text-ink-soft font-normal">
                        {o.categoria}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-ink-soft">{o.producto}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 font-data text-[11px] ${tipoBadgeClass[o.tipo]}`}
                      >
                        {o.tipo}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-ink">{o.tin || "N/D"}</td>
                    <td className="py-3 px-3 text-ink">{o.tae || "N/D"}</td>
                    <td className="py-3 px-3 text-ink-soft whitespace-nowrap">{o.plazoMax || "N/D"}</td>
                    <td className="py-3 px-3 text-ink-soft">{o.financiacionMax || "N/D"}</td>
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
                          {o.diferencial && (
                            <div>
                              <dt className="font-data text-[10.5px] uppercase tracking-wide text-ink-soft">Diferencial / tramo fijo</dt>
                              <dd className="text-ink">{o.diferencial}</dd>
                            </div>
                          )}
                          {o.vinculaciones && (
                            <div>
                              <dt className="font-data text-[10.5px] uppercase tracking-wide text-ink-soft">Vinculaciones / bonificaciones</dt>
                              <dd className="text-ink">{o.vinculaciones}</dd>
                            </div>
                          )}
                          {o.comisiones && (
                            <div>
                              <dt className="font-data text-[10.5px] uppercase tracking-wide text-ink-soft">Comisiones</dt>
                              <dd className="text-ink">{o.comisiones}</dd>
                            </div>
                          )}
                          {o.requisitos && (
                            <div>
                              <dt className="font-data text-[10.5px] uppercase tracking-wide text-ink-soft">Requisitos / notas</dt>
                              <dd className="text-ink">{o.requisitos}</dd>
                            </div>
                          )}
                          <div>
                            <dt className="font-data text-[10.5px] uppercase tracking-wide text-ink-soft">Fuente / fiabilidad</dt>
                            <dd className="text-ink">{o.fuente || "N/D"}</dd>
                          </div>
                        </dl>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {ofertas.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 px-4 text-center text-ink-soft">
                    Ninguna oferta coincide con los filtros seleccionados.
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
          Entidades consultadas que no comercializan hipotecas ({ENTIDADES_SIN_OFERTA.length})
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
