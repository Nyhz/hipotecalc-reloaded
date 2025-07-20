import React, { useState } from "react"
import {
  cuotaMensual,
  porcentajeFinanciado,
  interesTotal,
  importeTotal,
  calcularITP,
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

  // Cálculos
  const itp = calcularITP(Number(form.precio))
  const precioFinal = Number(form.precio) + Number(form.otrosCostes || 0) + itp
  const cantidadHipoteca = precioFinal - Number(form.ahorro || 0)
  const tin = calcularTIN(Number(form.tae))

  // Resultados
  const cuota = cuotaMensual({ ...form, cantidadHipoteca, tin })
  const porcentaje = porcentajeFinanciado({ ...form, cantidadHipoteca })
  const interes = interesTotal({ ...form, cantidadHipoteca, tin })
  const importe = importeTotal({ ...form, cantidadHipoteca, tin })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
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
                max={4}
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
                options={COMUNIDADES.map((c) => ({ value: c, label: c }))}
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
                label='ITP (6%)'
                name='itp'
                value={itp}
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
                value={precioFinal}
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
                value={cantidadHipoteca}
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
                value={tin}
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
            {cuota} €
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
              {cantidadHipoteca} €
            </span>
          </div>
          <div className='flex flex-col bg-blue-100/60 rounded-lg p-4'>
            <span className='text-xs text-blue-700 font-semibold uppercase tracking-wide mb-1'>
              % Financiado
            </span>
            <span className='text-lg font-bold text-blue-900'>
              {porcentaje} %
            </span>
          </div>
          <div className='flex flex-col bg-blue-100/60 rounded-lg p-4'>
            <span className='text-xs text-blue-700 font-semibold uppercase tracking-wide mb-1'>
              Interés total
            </span>
            <span className='text-lg font-bold text-blue-900'>{interes} €</span>
          </div>
          <div className='flex flex-col bg-blue-100/60 rounded-lg p-4'>
            <span className='text-xs text-blue-700 font-semibold uppercase tracking-wide mb-1'>
              Importe total
            </span>
            <span className='text-lg font-bold text-blue-900'>{importe} €</span>
          </div>
        </div>
      </aside>
    </div>
  )
}

export default MortgageCalculator
