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
  onPrecioChange?: (precio: string) => void
  onComunidadChange?: (comunidad: string) => void
  onTipoViviendaChange?: (tipoVivienda: string) => void
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
  onPrecioChange,
  onComunidadChange,
  onTipoViviendaChange,
}) => {
  const { t, currentLang } = useTranslations()
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

  // Si cambian los valores iniciales al abrir el modal, actualiza el formulario
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
        numHijos: initialNumHijos !== undefined ? String(initialNumHijos) : "",
        victimaViolencia: initialVictimaViolencia || false,
        victimaTerrorismo: initialVictimaTerrorismo || false,
        zonaDespoblada: initialZonaDespoblada || false,
        vpo: initialVpo || false,
      }))
    }
  }, [
    open,
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
  ])

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

      // Sincronizar cambios con el formulario principal
      if (name === "precio" && onPrecioChange) {
        onPrecioChange(value)
      } else if (name === "comunidad" && onComunidadChange) {
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
      <h2 className='text-xl font-bold text-blue-900 mb-4'>
        {titleText}
      </h2>
      {error && <div className='mb-2 text-red-600 text-sm'>{error}</div>}
      <form
        className='space-y-6'
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmit()
        }}
      >
        <fieldset className='border border-blue-100 rounded-lg p-4'>
          <legend className='font-semibold text-blue-900 mb-2'>
            {t('mortgage.form.itpModal.propertyInformation')}
          </legend>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-blue-900 mb-1'>
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
                className='w-full border border-blue-200 rounded px-3 py-2 h-10 pr-8'
                min={0}
                placeholder={t('mortgage.form.itpModal.examplePrice')}
                style={{
                  WebkitAppearance: "none",
                  MozAppearance: "textfield",
                  appearance: "textfield",
                }}
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-blue-900 mb-1'>
                {t('mortgage.form.itpModal.propertyType')}
              </label>
              <select
                name='tipoVivienda'
                value={form.tipoVivienda}
                onChange={handleInput}
                className='w-full border border-blue-200 rounded px-3 py-2 h-10'
              >
                <option value=''>{t('mortgage.form.itpModal.select')}</option>
                <option value='Obra nueva'>{t('mortgage.form.newConstruction')}</option>
                <option value='Segunda mano'>{t('mortgage.form.secondHand')}</option>
              </select>
            </div>
            {!esObraNueva && (
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-blue-900 mb-1'>
                  {t('mortgage.form.itpModal.autonomousCommunity')}
                </label>
                <select
                  name='comunidad'
                  value={form.comunidad}
                  onChange={handleInput}
                  className='w-full border border-blue-200 rounded px-3 py-2 h-10'
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
            {camposDinamicos.vpo && (
              <div className='md:col-span-2'>
                <label className='flex items-center gap-2'>
                  <input
                    type='checkbox'
                    name='vpo'
                    checked={form.vpo}
                    onChange={handleInput}
                  />
                  {t('mortgage.form.itpModal.vpoQuestion')}
                </label>
                {form.vpo && (
                  <p className='text-sm text-blue-600 mt-1'>
                    {t('mortgage.form.itpModal.vpoInfo')}
                  </p>
                )}
              </div>
            )}
          </div>
        </fieldset>

        {!esObraNueva && (
          <fieldset className='border border-blue-100 rounded-lg p-4'>
            <legend className='font-semibold text-blue-900 mb-2'>
              {t('mortgage.form.itpModal.buyerInformation')}
            </legend>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {camposDinamicos.edad && (
                <div>
                  <label className='block text-sm font-medium text-blue-900 mb-1'>
                    {t('mortgage.form.itpModal.ageLabel')}
                  </label>
                  <input
                    type='number'
                    name='edad'
                    value={form.edad}
                    onChange={handleInput}
                    className='w-full border border-blue-200 rounded px-3 py-2 h-10'
                    min={0}
                    placeholder={t('mortgage.form.itpModal.exampleAge')}
                  />
                </div>
              )}

              {camposDinamicos.ingresos && (
                <div>
                  <label className='block text-sm font-medium text-blue-900 mb-1'>
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
                    className='w-full border border-blue-200 rounded px-3 py-2 h-10 pr-8'
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
                  <label className='block text-sm font-medium text-blue-900 mb-1'>
                    {t('mortgage.form.itpModal.familySituation')}
                  </label>
                  <select
                    name='situacion'
                    value={form.situacion}
                    onChange={handleInput}
                    className='w-full border border-blue-200 rounded px-3 py-2 h-10'
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
                  <label className='block text-sm font-medium text-blue-900 mb-1'>
                    {t('mortgage.form.itpModal.numberOfChildren')}
                  </label>
                  <input
                    type='number'
                    name='numHijos'
                    value={form.numHijos}
                    onChange={handleInput}
                    className='w-full border border-blue-200 rounded px-3 py-2 h-10'
                    min={0}
                    placeholder={t('mortgage.form.itpModal.exampleChildren')}
                  />
                </div>
              )}

              {/* Campos adicionales específicos por comunidad */}
              {camposDinamicos.hipoteca && (
                <div>
                  <label className='block text-sm font-medium text-blue-900 mb-1'>
                    {t('mortgage.form.itpModal.mortgageAmount')}
                  </label>
                  <input
                    type='number'
                    name='hipoteca'
                    value={form.hipoteca}
                    onChange={handleInput}
                    className='w-full border border-blue-200 rounded px-3 py-2 h-10'
                    min={0}
                    placeholder={t('mortgage.form.itpModal.exampleMortgage')}
                  />
                </div>
              )}

              {camposDinamicos.tasacion && (
                <div>
                  <label className='block text-sm font-medium text-blue-900 mb-1'>
                    {t('mortgage.form.itpModal.appraisal')}
                  </label>
                  <input
                    type='number'
                    name='tasacion'
                    value={form.tasacion}
                    onChange={handleInput}
                    className='w-full border border-blue-200 rounded px-3 py-2 h-10'
                    min={0}
                    placeholder={t('mortgage.form.itpModal.exampleAppraisal')}
                  />
                </div>
              )}

              {camposDinamicos.patrimonio && (
                <div>
                  <label className='block text-sm font-medium text-blue-900 mb-1'>
                    {t('mortgage.form.itpModal.patrimony')}
                  </label>
                  <input
                    type='number'
                    name='patrimonio'
                    value={form.patrimonio}
                    onChange={handleInput}
                    className='w-full border border-blue-200 rounded px-3 py-2 h-10'
                    min={0}
                    placeholder={t('mortgage.form.itpModal.examplePatrimony')}
                  />
                </div>
              )}

              {camposDinamicos.residencia && (
                <div>
                  <label className='block text-sm font-medium text-blue-900 mb-1'>
                    {t('mortgage.form.itpModal.residence')}
                  </label>
                  <input
                    type='number'
                    name='residencia'
                    value={form.residencia}
                    onChange={handleInput}
                    className='w-full border border-blue-200 rounded px-3 py-2 h-10'
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
                <div className='md:col-span-2 flex flex-col gap-2 bg-blue-50/60 border border-blue-100 rounded-lg p-4 mt-2'>
                  {camposDinamicos.discapacidad && (
                    <>
                      <label className='flex items-center gap-2'>
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
                          className='w-full border border-blue-200 rounded px-3 py-2 h-10 mt-1'
                          min={0}
                          max={100}
                          placeholder={t('mortgage.form.itpModal.disabilityPercentage')}
                        />
                      )}
                    </>
                  )}

                  {camposDinamicos.victimas && (
                    <>
                      <label className='flex items-center gap-2'>
                        <input
                          type='checkbox'
                          name='victimaViolencia'
                          checked={form.victimaViolencia}
                          onChange={handleInput}
                        />
                        {t('mortgage.form.itpModal.violenceVictim')}
                      </label>
                      <label className='flex items-center gap-2'>
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
                    <label className='flex items-center gap-2'>
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
                    <label className='flex items-center gap-2'>
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
                    <label className='flex items-center gap-2'>
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
            className='bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow'
          >
            {calculateButtonText}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default ITPCalculator
