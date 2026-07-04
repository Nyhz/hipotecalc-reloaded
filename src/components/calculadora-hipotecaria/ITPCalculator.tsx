import React, { useState } from "react"
import Modal from "./Modal"
import { COMUNIDADES } from "../../constants/comunidades"
import {
  calcularITPAvanzado,
  calcularIVA,
} from "../../utils/calculadora-hipotecaria"
import { useTranslations } from "../../hooks/useTranslations"

interface ITPCalculatorProps {
  open: boolean
  onClose: () => void
  onResult: (itp: number, tipoAplicado?: number, descripcion?: string) => void
  comunidadSeleccionada?: string
  initialPrecio?: string | number
  initialTipoVivienda?: string
  initialEdad?: string | number
  initialSituacion?: string
  initialDiscapacidad?: boolean
  initialPorcentajeDiscapacidad?: string | number
  initialPrimeraVivienda?: boolean
  initialNumHijos?: string | number
  initialVictimaViolencia?: boolean
  initialVictimaTerrorismo?: boolean
  initialZonaDespoblada?: boolean
  initialVpo?: boolean
  onComunidadChange?: (comunidad: string) => void
  onTipoViviendaChange?: (tipoVivienda: string) => void
  lang?: 'es' | 'en'
}

const initialForm = {
  precio: "",
  tipoVivienda: "",
  comunidad: "",
  edad: "",
  baseIrpf: "",
  situacion: "",
  discapacidad: false,
  porcentajeDiscapacidad: "",
  primeraVivienda: false,
  tipoReducido: false,
  numHijos: "",
  victimaViolencia: false,
  victimaTerrorismo: false,
  zonaDespoblada: false,
  vpo: false,
  ingresos: "",
  hipoteca: "",
  tasacion: "",
  patrimonio: "",
  residencia: "",
  ventaAnterior: false,
}

const ITPCalculator: React.FC<ITPCalculatorProps> = ({
  open,
  onClose,
  onResult,
  comunidadSeleccionada,
  initialPrecio,
  initialTipoVivienda,
  initialEdad,
  initialSituacion,
  initialDiscapacidad,
  initialPorcentajeDiscapacidad,
  initialPrimeraVivienda,
  initialNumHijos,
  initialVictimaViolencia,
  initialVictimaTerrorismo,
  initialZonaDespoblada,
  initialVpo,
  onComunidadChange,
  onTipoViviendaChange,
  lang = 'es',
}) => {
  const { t, currentLang } = useTranslations(lang)
  const [form, setForm] = useState({
    ...initialForm,
    comunidad: comunidadSeleccionada || "",
    precio: initialPrecio !== undefined ? String(initialPrecio) : "",
    tipoVivienda: initialTipoVivienda || "",
    edad: initialEdad !== undefined ? String(initialEdad) : "",
    situacion: initialSituacion || "",
    discapacidad: initialDiscapacidad || false,
    porcentajeDiscapacidad:
      initialPorcentajeDiscapacidad !== undefined
        ? String(initialPorcentajeDiscapacidad)
        : "",
    primeraVivienda: initialPrimeraVivienda || false,
    numHijos: initialNumHijos !== undefined ? String(initialNumHijos) : "",
    victimaViolencia: initialVictimaViolencia || false,
    victimaTerrorismo: initialVictimaTerrorismo || false,
    zonaDespoblada: initialZonaDespoblada || false,
    vpo: initialVpo || false,
  })
  const [error, setError] = useState("")

  // Precargar el formulario con los valores del formulario principal SOLO al
  // abrir el modal. Con más dependencias, cada campo sincronizado hacia el
  // padre (comunidad, tipo de vivienda) rebotaba como prop y reseteaba lo ya
  // escrito en el modal — p. ej. pisaba el VMA con el precio de compraventa.
  React.useEffect(() => {
    if (open) {
      setForm((prev) => ({
        ...prev,
        comunidad: comunidadSeleccionada || "",
        precio: initialPrecio !== undefined ? String(initialPrecio) : "",
        tipoVivienda: initialTipoVivienda || "",
        edad: initialEdad !== undefined ? String(initialEdad) : "",
        situacion: initialSituacion || "",
        discapacidad: initialDiscapacidad || false,
        porcentajeDiscapacidad:
          initialPorcentajeDiscapacidad !== undefined
            ? String(initialPorcentajeDiscapacidad)
            : "",
        primeraVivienda: initialPrimeraVivienda || false,
        tipoReducido: false,
        numHijos: initialNumHijos !== undefined ? String(initialNumHijos) : "",
        victimaViolencia: initialVictimaViolencia || false,
        victimaTerrorismo: initialVictimaTerrorismo || false,
        zonaDespoblada: initialZonaDespoblada || false,
        vpo: initialVpo || false,
      }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const comunidad = COMUNIDADES.find((c) => c.nombre === form.comunidad)
  const esObraNueva = form.tipoVivienda === "Obra nueva"

  // Para obra nueva, mostrar campos específicos de IVA
  const camposDinamicos = esObraNueva
    ? { vpo: true } // Solo mostrar VPO para obra nueva
    : comunidad?.camposDinamicos || {}

  const handleInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    if (type === "checkbox" && e.target instanceof HTMLInputElement) {
      const checked = (e.target as HTMLInputElement).checked
      if (name === "discapacidad" && !checked) {
        setForm((prev) => ({
          ...prev,
          discapacidad: false,
          porcentajeDiscapacidad: "",
        }))
        return
      }
      setForm((prev) => ({ ...prev, [name]: checked }))
    } else {
      setForm((prev) => ({ ...prev, [name]: value }))

      // Sincronizar cambios con el formulario principal (el precio no se
      // sincroniza: puede ser el VMA, independiente del precio de compra)
      if (name === "comunidad" && onComunidadChange) {
        onComunidadChange(value)
      } else if (name === "tipoVivienda" && onTipoViviendaChange) {
        onTipoViviendaChange(value)
      }
    }
  }

  const handleSubmit = () => {
    setError("")
    const precio = Number(form.precio)
    if (!precio || precio <= 0) {
      setError(t('mortgage.form.itpModal.errorInvalidPrice'))
      return
    }

    if (esObraNueva) {
      // Para obra nueva, calcular IVA con posible reducción por VPO
      let tipoIVA = 10
      let descripcion = t('mortgage.form.itpModal.vat10Description')

      if (form.vpo) {
        tipoIVA = 4 // IVA reducido para VPO
        descripcion = t('mortgage.form.itpModal.vat4Description')
      }

      const iva = calcularIVA(precio, tipoIVA)
      onResult(iva, tipoIVA, descripcion)
    } else {
      // Para segunda mano, usar la función avanzada de ITP
      if (!comunidad) {
        setError(t('mortgage.form.itpModal.errorNoCommunity'))
        return
      }

      const { itp, tipoAplicado, descripcion } = calcularITPAvanzado({
        precio,
        tipoVivienda: form.tipoVivienda,
        comunidad: form.comunidad,
        edad: Number(form.edad) || 0,
        discapacidad: form.discapacidad,
        porcentajeDiscapacidad: Number(form.porcentajeDiscapacidad) || 0,
        situacion: form.situacion,
        numHijos: Number(form.numHijos) || 0,
        victimaViolencia: form.victimaViolencia,
        victimaTerrorismo: form.victimaTerrorismo,
        zonaDespoblada: form.zonaDespoblada,
        primeraVivienda: form.primeraVivienda,
        tipoReducido: form.tipoReducido,
        vpo: form.vpo,
        ingresos: Number(form.ingresos) || 0,
        hipoteca: Number(form.hipoteca) || 0,
        tasacion: Number(form.tasacion) || 0,
        patrimonio: Number(form.patrimonio) || 0,
        residencia: Number(form.residencia) || 0,
        ventaAnterior: form.ventaAnterior,
        lang: currentLang,
      })
      onResult(itp, tipoAplicado, descripcion)
    }

    onClose()
  }

  const titleText = esObraNueva ? t('mortgage.form.itpModal.vatTitle') : t('mortgage.form.itpModal.title')
  const calculateButtonText = esObraNueva ? t('mortgage.form.itpModal.calculateVAT') : t('mortgage.form.itpModal.calculateITP')

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className='font-heading font-semibold text-ink text-xl mb-4'>
        {titleText}
      </h2>
      {error && <div className='mb-2 text-negative text-sm'>{error}</div>}
      <form
        className='space-y-6'
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmit()
        }}
      >
        <fieldset className='rounded-xl border border-line bg-paper/50 p-4'>
          <legend className='font-data text-[11px] uppercase tracking-widest text-ink-soft px-1 mb-2'>
            {t('mortgage.form.itpModal.propertyInformation')}
          </legend>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='label-pl'>
                {t('mortgage.form.itpModal.propertyPrice')}
              </label>
              <input
                type='number'
                name='precio'
                value={form.precio}
                onChange={(e) => {
                  // Validar números negativos
                  const inputValue = e.target.value
                  if (inputValue.startsWith("-")) {
                    e.target.value = inputValue.replace("-", "")
                    return
                  }
                  const numValue = Number(inputValue)
                  if (!isNaN(numValue) && numValue < 0) {
                    e.target.value = "0"
                    const correctedEvent = {
                      ...e,
                      target: {
                        ...e.target,
                        value: "0",
                      },
                    }
                    handleInput(
                      correctedEvent as React.ChangeEvent<HTMLInputElement>
                    )
                    return
                  }

                  handleInput(e)
                }}
                onKeyDown={(e) => {
                  if (e.key === "-" || e.key === "Minus") {
                    e.preventDefault()
                  }
                }}
                className='input-pl pr-8'
                min={0}
                placeholder={t('mortgage.form.itpModal.examplePrice')}
                style={{
                  WebkitAppearance: "none",
                  MozAppearance: "textfield",
                  appearance: "textfield",
                }}
              />
              {form.comunidad === "País Vasco" && !esObraNueva && (
                <p className='text-xs text-ink-soft mt-1'>
                  {t('mortgage.form.itpModal.vmaInfo')}
                </p>
              )}
            </div>
            <div>
              <label className='label-pl'>
                {t('mortgage.form.itpModal.propertyType')}
              </label>
              <select
                name='tipoVivienda'
                value={form.tipoVivienda}
                onChange={handleInput}
                className='input-pl'
              >
                <option value=''>{t('mortgage.form.itpModal.select')}</option>
                <option value='Obra nueva'>{t('mortgage.form.newConstruction')}</option>
                <option value='Segunda mano'>{t('mortgage.form.secondHand')}</option>
              </select>
            </div>
            {!esObraNueva && (
              <div className='md:col-span-2'>
                <label className='label-pl'>
                  {t('mortgage.form.itpModal.autonomousCommunity')}
                </label>
                <select
                  name='comunidad'
                  value={form.comunidad}
                  onChange={handleInput}
                  className='input-pl'
                >
                  <option value=''>{t('mortgage.form.itpModal.select')}</option>
                  {COMUNIDADES.map((c) => (
                    <option key={c.nombre} value={c.nombre}>
                      {c.nombre} ({t('mortgage.form.itpModal.itpLabel')}: {c.ITP}%)
                    </option>
                  ))}
                </select>
              </div>
            )}
            {camposDinamicos.tipoReducido && !esObraNueva && (
              <div className='md:col-span-2'>
                <label className='flex items-center gap-2 text-sm text-ink'>
                  <input
                    type='checkbox'
                    name='tipoReducido'
                    checked={form.tipoReducido}
                    onChange={handleInput}
                  />
                  {t('mortgage.form.itpModal.reducedRateQuestion')}
                </label>
                {form.tipoReducido && (
                  <p className='text-xs text-ink-soft mt-1'>
                    {t('mortgage.form.itpModal.reducedRateInfo')}
                  </p>
                )}
              </div>
            )}
            {camposDinamicos.vpo && (
              <div className='md:col-span-2'>
                <label className='flex items-center gap-2 text-sm text-ink'>
                  <input
                    type='checkbox'
                    name='vpo'
                    checked={form.vpo}
                    onChange={handleInput}
                  />
                  {t('mortgage.form.itpModal.vpoQuestion')}
                </label>
                {form.vpo && (
                  <p className='text-xs text-ink-soft mt-1'>
                    {t('mortgage.form.itpModal.vpoInfo')}
                  </p>
                )}
              </div>
            )}
          </div>
        </fieldset>

        {!esObraNueva && (
          <fieldset className='rounded-xl border border-line bg-paper/50 p-4'>
            <legend className='font-data text-[11px] uppercase tracking-widest text-ink-soft px-1 mb-2'>
              {t('mortgage.form.itpModal.buyerInformation')}
            </legend>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {camposDinamicos.edad && (
                <div>
                  <label className='label-pl'>
                    {t('mortgage.form.itpModal.ageLabel')}
                  </label>
                  <input
                    type='number'
                    name='edad'
                    value={form.edad}
                    onChange={handleInput}
                    className='input-pl'
                    min={0}
                    placeholder={t('mortgage.form.itpModal.exampleAge')}
                  />
                </div>
              )}

              {camposDinamicos.ingresos && (
                <div>
                  <label className='label-pl'>
                    {t('mortgage.form.itpModal.incomeLabel')}
                  </label>
                  <input
                    type='number'
                    name='ingresos'
                    value={form.ingresos}
                    onChange={(e) => {
                      // Validar números negativos
                      const inputValue = e.target.value
                      if (inputValue.startsWith("-")) {
                        e.target.value = inputValue.replace("-", "")
                        return
                      }
                      const numValue = Number(inputValue)
                      if (!isNaN(numValue) && numValue < 0) {
                        e.target.value = "0"
                        const correctedEvent = {
                          ...e,
                          target: {
                            ...e.target,
                            value: "0",
                          },
                        }
                        handleInput(
                          correctedEvent as React.ChangeEvent<HTMLInputElement>
                        )
                        return
                      }

                      handleInput(e)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "-" || e.key === "Minus") {
                        e.preventDefault()
                      }
                    }}
                    className='input-pl pr-8'
                    min={0}
                    placeholder={t('mortgage.form.itpModal.exampleIncome')}
                    style={{
                      WebkitAppearance: "none",
                      MozAppearance: "textfield",
                      appearance: "textfield",
                    }}
                  />
                </div>
              )}

              {camposDinamicos.familiaNumerosa && (
                <div className='md:col-span-2'>
                  <label className='label-pl'>
                    {t('mortgage.form.itpModal.familySituation')}
                  </label>
                  <select
                    name='situacion'
                    value={form.situacion}
                    onChange={handleInput}
                    className='input-pl'
                  >
                    <option value=''>{t('mortgage.form.itpModal.select')}</option>
                    <option value='individual'>{t('mortgage.form.itpModal.individual')}</option>
                    <option value='familia-numerosa-general'>
                      {t('mortgage.form.itpModal.largeFamilyGeneral')}
                    </option>
                    <option value='familia-numerosa-especial'>
                      {t('mortgage.form.itpModal.largeFamilySpecial')}
                    </option>
                    <option value='familia-monoparental'>
                      {t('mortgage.form.itpModal.singleParentFamily')}
                    </option>
                  </select>
                </div>
              )}

              {/* Número de hijos solo para familias numerosas o monoparentales */}
              {[
                "familia-numerosa-general",
                "familia-numerosa-especial",
                "familia-monoparental",
              ].includes(form.situacion) && (
                <div className='md:col-span-2'>
                  <label className='label-pl'>
                    {t('mortgage.form.itpModal.numberOfChildren')}
                  </label>
                  <input
                    type='number'
                    name='numHijos'
                    value={form.numHijos}
                    onChange={handleInput}
                    className='input-pl'
                    min={0}
                    placeholder={t('mortgage.form.itpModal.exampleChildren')}
                  />
                </div>
              )}

              {/* Campos adicionales específicos por comunidad */}
              {camposDinamicos.hipoteca && (
                <div>
                  <label className='label-pl'>
                    {t('mortgage.form.itpModal.mortgageAmount')}
                  </label>
                  <input
                    type='number'
                    name='hipoteca'
                    value={form.hipoteca}
                    onChange={handleInput}
                    className='input-pl'
                    min={0}
                    placeholder={t('mortgage.form.itpModal.exampleMortgage')}
                  />
                </div>
              )}

              {camposDinamicos.tasacion && (
                <div>
                  <label className='label-pl'>
                    {t('mortgage.form.itpModal.appraisal')}
                  </label>
                  <input
                    type='number'
                    name='tasacion'
                    value={form.tasacion}
                    onChange={handleInput}
                    className='input-pl'
                    min={0}
                    placeholder={t('mortgage.form.itpModal.exampleAppraisal')}
                  />
                </div>
              )}

              {camposDinamicos.patrimonio && (
                <div>
                  <label className='label-pl'>
                    {t('mortgage.form.itpModal.patrimony')}
                  </label>
                  <input
                    type='number'
                    name='patrimonio'
                    value={form.patrimonio}
                    onChange={handleInput}
                    className='input-pl'
                    min={0}
                    placeholder={t('mortgage.form.itpModal.examplePatrimony')}
                  />
                </div>
              )}

              {camposDinamicos.residencia && (
                <div>
                  <label className='label-pl'>
                    {t('mortgage.form.itpModal.residence')}
                  </label>
                  <input
                    type='number'
                    name='residencia'
                    value={form.residencia}
                    onChange={handleInput}
                    className='input-pl'
                    min={0}
                    placeholder={t('mortgage.form.itpModal.exampleResidence')}
                  />
                </div>
              )}

              {/* Bloque de checkboxes dinámicos */}
              {(camposDinamicos.discapacidad ||
                camposDinamicos.victimas ||
                camposDinamicos.zonaDespoblada ||
                camposDinamicos.primeraVivienda ||
                camposDinamicos.ventaAnterior) && (
                <div className='md:col-span-2 flex flex-col gap-2.5 rounded-lg border border-line bg-paper p-4 mt-2'>
                  {camposDinamicos.discapacidad && (
                    <>
                      <label className='flex items-center gap-2 text-sm text-ink'>
                        <input
                          type='checkbox'
                          name='discapacidad'
                          checked={form.discapacidad}
                          onChange={handleInput}
                        />
                        {t('mortgage.form.itpModal.disabilityQuestion')}
                      </label>
                      {form.discapacidad && (
                        <input
                          type='number'
                          name='porcentajeDiscapacidad'
                          value={form.porcentajeDiscapacidad}
                          onChange={handleInput}
                          className='input-pl mt-1'
                          min={0}
                          max={100}
                          placeholder={t('mortgage.form.itpModal.disabilityPercentage')}
                        />
                      )}
                    </>
                  )}

                  {camposDinamicos.victimas && (
                    <>
                      <label className='flex items-center gap-2 text-sm text-ink'>
                        <input
                          type='checkbox'
                          name='victimaViolencia'
                          checked={form.victimaViolencia}
                          onChange={handleInput}
                        />
                        {t('mortgage.form.itpModal.violenceVictim')}
                      </label>
                      <label className='flex items-center gap-2 text-sm text-ink'>
                        <input
                          type='checkbox'
                          name='victimaTerrorismo'
                          checked={form.victimaTerrorismo}
                          onChange={handleInput}
                        />
                        {t('mortgage.form.itpModal.terrorismVictim')}
                      </label>
                    </>
                  )}

                  {camposDinamicos.zonaDespoblada && (
                    <label className='flex items-center gap-2 text-sm text-ink'>
                      <input
                        type='checkbox'
                        name='zonaDespoblada'
                        checked={form.zonaDespoblada}
                        onChange={handleInput}
                      />
                      {t('mortgage.form.itpModal.depopulatedArea')}
                    </label>
                  )}

                  {camposDinamicos.primeraVivienda && (
                    <label className='flex items-center gap-2 text-sm text-ink'>
                      <input
                        type='checkbox'
                        name='primeraVivienda'
                        checked={form.primeraVivienda}
                        onChange={handleInput}
                      />
                      {t('mortgage.form.itpModal.firstHome')}
                    </label>
                  )}

                  {camposDinamicos.ventaAnterior && (
                    <label className='flex items-center gap-2 text-sm text-ink'>
                      <input
                        type='checkbox'
                        name='ventaAnterior'
                        checked={form.ventaAnterior}
                        onChange={handleInput}
                      />
                      {t('mortgage.form.itpModal.previousSale')}
                    </label>
                  )}
                </div>
              )}
            </div>
          </fieldset>
        )}

        <div className='flex justify-end'>
          <button
            type='submit'
            className='btn-ink px-6 py-2.5 text-sm'
          >
            {calculateButtonText}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default ITPCalculator
