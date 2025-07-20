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
  const [form, setForm] = useState(initialState)

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
    const comunidadSeleccionada = COMUNIDADES.find(c => c.nombre === form.comunidad)
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
    if (["precio", "tasacion", "otrosCostes", "ahorro", "tae", "plazo"].includes(name)) {
      const numValue = Number(value)
      if (numValue < 0) {
        return // No actualizar si el valor es negativo
      }
    }
    
    setForm(prev => ({ ...prev, [name]: value }))
  }

  // Función para formatear el label del impuesto según el tipo de vivienda
  const getImpuestoLabel = () => {
    if (calculations.esObraNueva) {
      return "IVA (10%)"
    }
    return form.comunidad 
      ? `ITP (${calculations.porcentajeITP}%)`
      : "ITP (6%)"
  }

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
                options={COMUNIDADES.map((c) => ({ value: c.nombre, label: c.nombre }))}
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
              <Input
                label={getImpuestoLabel()}
                name='impuesto'
                value={calculations.impuesto}
                onChange={() => {}}
                type='number'
                readOnly
                className={inputReadOnlyClass}
              />
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
            <span className='text-lg font-bold text-blue-900'>{calculations.interes} €</span>
          </div>
          <div className='flex flex-col bg-blue-100/60 rounded-lg p-4'>
            <span className='text-xs text-blue-700 font-semibold uppercase tracking-wide mb-1'>
              Importe total
            </span>
            <span className='text-lg font-bold text-blue-900'>{calculations.importe} €</span>
          </div>
        </div>
      </aside>
    </div>
  )
}

export default MortgageCalculator
