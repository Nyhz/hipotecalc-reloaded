import React, { useState, useMemo } from "react"
import {
  cuotaMensual,
  porcentajeFinanciado,
  interesTotal,
  importeTotal,
  calcularITP,
  calcularIVA,
  calcularTIN,
} from "../../utils/calculadora-hipotecaria"
import { COMUNIDADES } from "../../constants/comunidades"
import Input from "./Input"
import Select from "./Select"
import { Icon } from "@iconify/react"
import ITPCalculator from "./ITPCalculator"

const tiposVivienda = ["Obra nueva", "Segunda mano"]
const tiposHipoteca = ["Fija", "Variable", "Mixta"]

const inputClass =
  "border border-blue-200 bg-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
const inputReadOnlyClass = inputClass + " bg-gray-100"

const initialState = {
  precio: "",
  tasacion: "",
  comunidad: "",
  tipoVivienda: "",
  otrosCostes: "",
  ahorro: "",
  tipoHipoteca: "",
  tae: "",
  plazo: "",
}

const MortgageCalculator: React.FC = () => {
  const [showItpModal, setShowItpModal] = useState(false)
  const [form, setForm] = useState(initialState)

  // Estado para el formulario ITP
  const [itpForm, setItpForm] = useState({
    precio: "",
    tipoVivienda: "",
    comunidad: "",
    edad: "",
    baseIrpf: "",
    situacion: "",
    discapacidad: false,
    primeraVivienda: false,
    numHijos: "",
    porcentajeDiscapacidad: "",
    victimaViolencia: false,
    victimaTerrorismo: false,
    zonaDespoblada: false,
  })

  const [itpCalculado, setItpCalculado] = useState(false)
  const [itpTipoAplicado, setItpTipoAplicado] = useState<number | null>(null)
  const [itpDescripcion, setItpDescripcion] = useState<string>("")

  // Handler para recibir el resultado del nuevo ITPCalculator
  const handleItpResult = (
    valor: number,
    tipoAplicado?: number,
    descripcion?: string
  ) => {
    setForm((prev) => ({ ...prev, impuesto: valor }))
    setItpTipoAplicado(tipoAplicado ?? null)
    setItpDescripcion(descripcion || "")
    setItpCalculado(true)
  }

  // Handler genérico para inputs
  const handleItpInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    if (type === "checkbox" && e.target instanceof HTMLInputElement) {
      const checked = (e.target as HTMLInputElement).checked
      setItpForm((prev) => ({
        ...prev,
        [name]: checked,
      }))
    } else {
      setItpForm((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
    if (
      name === "discapacidad" &&
      type === "checkbox" &&
      !(e.target as HTMLInputElement).checked
    ) {
      // Si se desmarca discapacidad, limpiar el porcentaje
      setItpForm((prev) => ({
        ...prev,
        discapacidad: false,
        porcentajeDiscapacidad: "",
      }))
      return
    }
  }

  // Cálculos memoizados que se recalculan automáticamente cuando cambian los inputs
  const calculations = useMemo(() => {
    const precioNum = Number(form.precio) || 0
    const otrosCostesNum = Number(form.otrosCostes) || 0
    const ahorroNum = Number(form.ahorro) || 0
    const taeNum = Number(form.tae) || 0
    const plazoNum = Number(form.plazo) || 0

    // Determinar si es obra nueva o segunda mano
    const esObraNueva = form.tipoVivienda === "Obra nueva"

    // Obtener el porcentaje de ITP de la comunidad seleccionada
    const comunidadSeleccionada = COMUNIDADES.find(
      (c) => c.nombre === form.comunidad
    )
    const porcentajeITP = comunidadSeleccionada?.ITP || 6 // Porcentaje por defecto si no hay comunidad seleccionada

    // Cálculos básicos
    const impuesto = esObraNueva
      ? calcularIVA(precioNum)
      : calcularITP(precioNum, porcentajeITP)

    const precioFinal = precioNum + otrosCostesNum + impuesto
    const cantidadHipoteca = Math.max(0, precioFinal - ahorroNum)
    const tin = calcularTIN(taeNum)

    // Parámetros para las funciones de cálculo
    const params = {
      ...form,
      cantidadHipoteca,
      tin,
    }

    // Resultados de los cálculos
    const cuota = cuotaMensual(params)
    const porcentaje = porcentajeFinanciado(params)
    const interes = interesTotal(params)
    const importe = importeTotal(params)

    return {
      impuesto,
      esObraNueva,
      porcentajeITP,
      precioFinal,
      cantidadHipoteca,
      tin,
      cuota,
      porcentaje,
      interes,
      importe,
    }
  }, [form]) // Se recalcula cuando cambia cualquier valor del formulario

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target

    // Validación para prevenir valores negativos en campos numéricos
    if (
      ["precio", "tasacion", "otrosCostes", "ahorro", "tae", "plazo"].includes(
        name
      )
    ) {
      const numValue = Number(value)
      if (numValue < 0) {
        return // No actualizar si el valor es negativo
      }
    }

    setForm((prev) => ({ ...prev, [name]: value }))
  }

  // Función para formatear el label del impuesto según el tipo de vivienda
  const getImpuestoLabel = () => {
    if (calculations.esObraNueva) {
      return "IVA (10%)"
    }
    return form.comunidad ? `ITP (${calculations.porcentajeITP}%)` : "ITP (6%)"
  }

  // Si el usuario edita el campo ITP manualmente, ocultar el aviso
  const handleImpuestoManual = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, impuesto: e.target.value }))
    setItpCalculado(false)
  }

  // Determinar si la comunidad seleccionada requiere campos especiales
  const comunidadSeleccionada = COMUNIDADES.find(
    (c) => c.nombre === itpForm.comunidad
  )
  const camposDinamicos = {
    ingresos: comunidadSeleccionada?.camposDinamicos?.ingresos ?? false,
    situacionFamiliar:
      comunidadSeleccionada?.camposDinamicos?.situacionFamiliar ?? false,
    discapacidad: comunidadSeleccionada?.camposDinamicos?.discapacidad ?? false,
    victimas: comunidadSeleccionada?.camposDinamicos?.victimas ?? false,
    zonaDespoblada:
      comunidadSeleccionada?.camposDinamicos?.zonaDespoblada ?? false,
  }
  const requiereViolencia = camposDinamicos.victimas
  const requiereTerrorismo = camposDinamicos.victimas
  const requiereDespoblada = camposDinamicos.zonaDespoblada

  return (
    <div className='w-full max-w-7xl flex flex-col md:flex-row gap-8 pt-10'>
      <form
        className='flex-1 bg-white rounded-xl shadow p-6'
        autoComplete='off'
      >
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <fieldset>
            <legend className='font-bold mb-2 text-blue-900'>
              Información de la vivienda
            </legend>
            <div className='grid gap-4'>
              <Input
                label='Precio de la vivienda (€)'
                name='precio'
                value={form.precio}
                onChange={handleChange}
                type='number'
                min={0}
                placeholder='Ej: 250000'
                className={inputClass}
              />
              <Input
                label='Tasación de la vivienda (€)'
                name='tasacion'
                value={form.tasacion}
                onChange={handleChange}
                type='number'
                min={0}
                placeholder='Ej: 240000'
                className={inputClass}
              />
              <Select
                label='Comunidad autónoma'
                name='comunidad'
                value={form.comunidad}
                onChange={handleChange}
                options={COMUNIDADES.map((c) => ({
                  value: c.nombre,
                  label: c.nombre,
                }))}
                className={inputClass}
              />
              <Select
                label='Tipo de vivienda'
                name='tipoVivienda'
                value={form.tipoVivienda}
                onChange={handleChange}
                options={tiposVivienda.map((t) => ({ value: t, label: t }))}
                className={inputClass}
              />
            </div>
          </fieldset>
          <fieldset>
            <legend className='font-bold mb-2 text-blue-900'>
              Impuestos y costes
            </legend>
            <div className='grid gap-4'>
              <div className='relative'>
                <Input
                  label={
                    <span className='flex items-center gap-2'>
                      {itpTipoAplicado
                        ? `ITP (${itpTipoAplicado}%)`
                        : getImpuestoLabel()}
                      {!calculations.esObraNueva && (
                        <button
                          type='button'
                          aria-label='Abrir calculadora ITP'
                          className='ml-2 text-blue-600 hover:underline hover:text-blue-800 focus:outline-none bg-transparent border-0 p-0 h-auto text-sm font-normal'
                          style={{ lineHeight: "1", height: "1.5em" }}
                          onClick={() => setShowItpModal(true)}
                        >
                          Calcula tu ITP
                        </button>
                      )}
                    </span>
                  }
                  name='impuesto'
                  value={calculations.impuesto}
                  onChange={(e) => {
                    handleImpuestoManual(e)
                    setItpTipoAplicado(null)
                    setItpDescripcion("")
                  }}
                  type='number'
                  readOnly
                  className={inputReadOnlyClass}
                  labelIcon={null}
                />
                {itpDescripcion && itpCalculado && (
                  <div className='text-green-800 bg-green-50 border border-green-200 rounded px-3 py-2 mt-2 text-sm text-center'>
                    <span className='font-semibold'>
                      Bonificación aplicada:
                    </span>{" "}
                    {itpDescripcion}
                  </div>
                )}
                {itpCalculado && (
                  <div className='absolute right-0 top-0 mt-1 mr-2 text-xs text-green-700 bg-green-100 rounded px-2 py-1 shadow'>
                    ITP Calculado
                  </div>
                )}
              </div>
              <Input
                label='Otros costes (€)'
                name='otrosCostes'
                value={form.otrosCostes}
                onChange={handleChange}
                type='number'
                min={0}
                placeholder='Ej: 5000'
                className={inputClass}
              />
              <Input
                label='Precio final (€)'
                name='precioFinal'
                value={calculations.precioFinal}
                onChange={() => {}}
                type='number'
                readOnly
                className={inputReadOnlyClass}
              />
            </div>
          </fieldset>
          <fieldset>
            <legend className='font-bold mb-2 text-blue-900'>
              Financiación y condiciones
            </legend>
            <div className='grid gap-4'>
              <Input
                label='Ahorro aportado (€)'
                name='ahorro'
                value={form.ahorro}
                onChange={handleChange}
                type='number'
                min={0}
                placeholder='Ej: 40000'
                className={inputClass}
              />
              <Input
                label='Cantidad hipoteca (€)'
                name='cantidadHipoteca'
                value={calculations.cantidadHipoteca}
                onChange={() => {}}
                type='number'
                readOnly
                className={inputReadOnlyClass}
              />
              <Select
                label='Tipo de hipoteca'
                name='tipoHipoteca'
                value={form.tipoHipoteca}
                onChange={handleChange}
                options={tiposHipoteca.map((t) => ({ value: t, label: t }))}
                className={inputClass}
              />
              <Input
                label='TAE (%)'
                name='tae'
                value={form.tae}
                onChange={handleChange}
                type='number'
                min={0}
                step={0.01}
                placeholder='Ej: 3.25'
                className={inputClass}
              />
              <Input
                label='TIN (%)'
                name='tin'
                value={calculations.tin}
                onChange={() => {}}
                type='number'
                readOnly
                className={inputReadOnlyClass}
              />
              <Input
                label='Plazo (años)'
                name='plazo'
                value={form.plazo}
                onChange={handleChange}
                type='number'
                min={1}
                placeholder='Ej: 30'
                className={inputClass}
              />
            </div>
          </fieldset>
        </div>
      </form>
      <aside className='w-full md:w-96 bg-white rounded-xl shadow-lg p-6 flex flex-col gap-6 border border-blue-100'>
        <h2 className='text-xl font-bold text-blue-900 mb-2'>
          Resumen de tu hipoteca
        </h2>
        <div className='flex flex-col items-center justify-center bg-blue-50 rounded-xl p-6 mb-4 shadow-inner'>
          <span className='text-3xl font-extrabold text-blue-800 mb-2'>
            {calculations.cuota} €
          </span>
          <div className='text-blue-900 font-semibold text-lg'>
            Cuota mensual estimada
          </div>
        </div>
        <div className='grid grid-cols-1 gap-3'>
          <div className='flex flex-col bg-blue-100/60 rounded-lg p-4'>
            <span className='text-xs text-blue-700 font-semibold uppercase tracking-wide mb-1'>
              Principal total
            </span>
            <span className='text-lg font-bold text-blue-900'>
              {calculations.cantidadHipoteca} €
            </span>
          </div>
          <div className='flex flex-col bg-blue-100/60 rounded-lg p-4'>
            <span className='text-xs text-blue-700 font-semibold uppercase tracking-wide mb-1'>
              % Financiado
            </span>
            <span className='text-lg font-bold text-blue-900'>
              {calculations.porcentaje} %
            </span>
          </div>
          <div className='flex flex-col bg-blue-100/60 rounded-lg p-4'>
            <span className='text-xs text-blue-700 font-semibold uppercase tracking-wide mb-1'>
              Interés total
            </span>
            <span className='text-lg font-bold text-blue-900'>
              {calculations.interes} €
            </span>
          </div>
          <div className='flex flex-col bg-blue-100/60 rounded-lg p-4'>
            <span className='text-xs text-blue-700 font-semibold uppercase tracking-wide mb-1'>
              Importe total
            </span>
            <span className='text-lg font-bold text-blue-900'>
              {calculations.importe} €
            </span>
          </div>
        </div>
      </aside>
      {/* Modal Calculadora ITP (nuevo componente) */}
      <ITPCalculator
        open={showItpModal}
        onClose={() => setShowItpModal(false)}
        onResult={handleItpResult}
        comunidadSeleccionada={form.comunidad}
        initialPrecio={form.precio}
        initialTipoVivienda={form.tipoVivienda}
      />
    </div>
  )
}

export default MortgageCalculator
