import React, { useState, useMemo } from "react"
import { COMUNIDADES } from "../../constants/comunidades"
import { calcularITP } from "../../utils/calculadora-hipotecaria"
import Input from "./Input"
import Select from "./Select"
import RentalKPIs from "./RentalKPIs"
import RentalCharts from "./RentalCharts"

const inputClass = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
const inputReadOnlyClass = inputClass + " bg-gray-100"

const initialState = {
  // Datos de la propiedad
  precio: "",
  entrada: "",
  interes: "",
  comunidad: "",
  plazo: "30",
  
  // Datos del alquiler
  ocupacion: "100",
  alquilerMensual: "",
  gastosMensuales: "",
}

const RentalCalculator: React.FC = () => {
  const [form, setForm] = useState(initialState)

  // Cálculos memoizados que se recalculan automáticamente cuando cambian los inputs
  const calculations = useMemo(() => {
    const precioNum = Number(form.precio) || 0
    const entradaNum = Number(form.entrada) || 0
    const interesNum = Number(form.interes) || 0
    const plazoNum = Number(form.plazo) || 0
    const ocupacionNum = Number(form.ocupacion) || 0
    const alquilerMensualNum = Number(form.alquilerMensual) || 0
    const gastosMensualesNum = Number(form.gastosMensuales) || 0

    // Cálculo del ITP
    const comunidadSeleccionada = COMUNIDADES.find(c => c.nombre === form.comunidad)
    const porcentajeITP = comunidadSeleccionada?.ITP || 6
    const itp = calcularITP(precioNum, porcentajeITP)

    // Cálculo de la hipoteca
    const cantidadHipoteca = precioNum + itp - entradaNum
    const interesMensual = interesNum / 12 / 100
    const numeroCuotas = plazoNum * 12

    // Cuota mensual de la hipoteca
    const cuotaMensual = cantidadHipoteca > 0 && interesMensual > 0
      ? (cantidadHipoteca * interesMensual * Math.pow(1 + interesMensual, numeroCuotas)) / 
        (Math.pow(1 + interesMensual, numeroCuotas) - 1)
      : 0

    // Ingresos ajustados por ocupación
    const ingresosMensuales = alquilerMensualNum * (ocupacionNum / 100)

    // Cash flow mensual
    const cashFlowMensual = ingresosMensuales - cuotaMensual - gastosMensualesNum

    // ROI Anual (basado en el precio total de la propiedad)
    const roiAnual = precioNum > 0 ? (cashFlowMensual * 12 / precioNum) * 100 : 0

    // Cash on Cash Return (basado en la entrada)
    const cashOnCashReturn = entradaNum > 0 ? (cashFlowMensual * 12 / entradaNum) * 100 : 0

    // Meses para break even (cuando el cash flow acumulado iguala la entrada)
    const mesesBreakEven = cashFlowMensual > 0 ? entradaNum / cashFlowMensual : 0

    // Interés total de la hipoteca
    const interesTotal = (cuotaMensual * numeroCuotas) - cantidadHipoteca

    return {
      itp,
      porcentajeITP,
      cantidadHipoteca,
      cuotaMensual,
      ingresosMensuales,
      gastosMensuales: gastosMensualesNum,
      cashFlowMensual,
      roiAnual,
      cashOnCashReturn,
      mesesBreakEven,
      interesTotal,
      precioTotal: precioNum + itp,
    }
  }, [form])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target

    // Validación para prevenir valores negativos en campos numéricos
    if (
      ["precio", "entrada", "interes", "plazo", "ocupacion", "alquilerMensual", "gastosMensuales"].includes(
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Datos de la Propiedad */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
        <h2 className="text-xl font-bold text-blue-900 mb-6">
          Datos de la Propiedad
        </h2>
        <div className="space-y-4">
          <Input
            label="Precio Total (incl. impuestos) (€)"
            name="precio"
            value={form.precio}
            onChange={handleChange}
            type="number"
            min={0}
            placeholder="Ej: 200000"
            className={inputClass}
            showEuroSymbol={true}
          />
          <Input
            label="Entrada (€)"
            name="entrada"
            value={form.entrada}
            onChange={handleChange}
            type="number"
            min={0}
            placeholder="Ej: 40000"
            className={inputClass}
            showEuroSymbol={true}
          />
          <Input
            label="Interés (%)"
            name="interes"
            value={form.interes}
            onChange={handleChange}
            type="number"
            min={0}
            step={0.01}
            placeholder="Ej: 2.5"
            className={inputClass}
          />
          <Select
            label="Comunidad Autónoma"
            name="comunidad"
            value={form.comunidad}
            onChange={handleChange}
            options={COMUNIDADES.map((c) => ({ value: c.nombre, label: c.nombre }))}
            className={inputClass}
          />
          <Input
            label="Plazo (años)"
            name="plazo"
            value={form.plazo}
            onChange={handleChange}
            type="number"
            min={1}
            max={40}
            placeholder="Ej: 30"
            className={inputClass}
          />
          
          {/* Información calculada */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">ITP ({calculations.porcentajeITP}%):</span>
              <span className="font-semibold text-gray-900">
                {new Intl.NumberFormat("es-ES").format(calculations.itp)} €
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Cantidad hipoteca:</span>
              <span className="font-semibold text-gray-900">
                {new Intl.NumberFormat("es-ES").format(calculations.cantidadHipoteca)} €
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Cuota mensual:</span>
              <span className="font-semibold text-gray-900">
                {new Intl.NumberFormat("es-ES").format(calculations.cuotaMensual)} €
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Detalles del Alquiler */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
        <h2 className="text-xl font-bold text-blue-900 mb-6">
          Detalles del Alquiler
        </h2>
        <div className="space-y-4">
          <Input
            label="Alquiler Mensual (€)"
            name="alquilerMensual"
            value={form.alquilerMensual}
            onChange={handleChange}
            type="number"
            min={0}
            placeholder="Ej: 1000"
            className={inputClass}
            showEuroSymbol={true}
          />
          <Input
            label="Ocupación (%)"
            name="ocupacion"
            value={form.ocupacion}
            onChange={handleChange}
            type="number"
            min={0}
            max={100}
            placeholder="Ej: 100"
            className={inputClass}
          />
          <Input
            label="Gastos Mensuales (€)"
            name="gastosMensuales"
            value={form.gastosMensuales}
            onChange={handleChange}
            type="number"
            min={0}
            placeholder="Ej: 50"
            className={inputClass}
            showEuroSymbol={true}
          />
          
          {/* Información calculada */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Ingresos mensuales:</span>
              <span className="font-semibold text-gray-900">
                {new Intl.NumberFormat("es-ES").format(calculations.ingresosMensuales)} €
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Cash flow mensual:</span>
              <span className={`font-semibold ${calculations.cashFlowMensual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {new Intl.NumberFormat("es-ES").format(calculations.cashFlowMensual)} €
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="lg:col-span-2">
        <RentalKPIs calculations={calculations} />
      </div>

      {/* Gráficas */}
      <div className="lg:col-span-2">
        <RentalCharts calculations={calculations} form={form} />
      </div>
    </div>
  )
}

export default RentalCalculator 