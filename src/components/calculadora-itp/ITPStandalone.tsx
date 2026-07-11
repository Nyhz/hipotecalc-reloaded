import React, { useRef, useState } from "react"
import ITPCalculator from "../calculadora-hipotecaria/ITPCalculator"
import { formatNumberByLang } from "../../utils/number-format"

// Landing /calculadora-itp: reutiliza el flujo completo del modal de ITP
// (modo inline) y muestra el resultado bajo el formulario.
interface Resultado {
  itp: number
  tipoAplicado?: number
  descripcion?: string
}

const ITPStandalone: React.FC = () => {
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const resultadoRef = useRef<HTMLDivElement>(null)

  const handleResult = (itp: number, tipoAplicado?: number, descripcion?: string) => {
    setResultado({ itp, tipoAplicado, descripcion })
    // El formulario es largo: llevar el resultado a la vista
    requestAnimationFrame(() => {
      resultadoRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
    })
  }

  return (
    <div className='flex flex-col gap-6'>
      <ITPCalculator
        inline
        open={true}
        onClose={() => {}}
        onResult={handleResult}
      />

      {resultado && (
        <div ref={resultadoRef} className='pl-card p-6 border-l-4 border-lime'>
          <span className='font-data text-[11px] uppercase tracking-widest text-ink-soft'>
            Impuesto estimado
          </span>
          <div className='font-heading text-4xl font-bold text-brand-blue my-2'>
            {formatNumberByLang(resultado.itp, "es")} €
          </div>
          {resultado.descripcion && (
            <p className='text-sm text-ink-soft mb-4'>{resultado.descripcion}</p>
          )}
          <div className='flex flex-wrap gap-3 mt-2'>
            <a href='/calculadora-hipotecaria' className='btn-ink px-5 py-2.5 text-sm'>
              Calcular la hipoteca completa →
            </a>
            <a href='/itp' className='btn-outline px-5 py-2.5 text-sm'>
              Ver la guía de tu comunidad
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

export default ITPStandalone
