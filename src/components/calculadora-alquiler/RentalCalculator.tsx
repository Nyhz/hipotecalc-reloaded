import React, { useState, useMemo } from "react"
import { COMUNIDADES } from "../../constants/comunidades"
import { calcularITP } from "../../utils/calculadora-hipotecaria"
import Input from "./Input"
import Select from "./Select"
import RentalKPIs from "./RentalKPIs"
import RentalCharts from "./RentalCharts"
import ContactButton from "../ContactButton"
import AnimatedNumber from "../ui/AnimatedNumber"
import { useTranslations } from "../../hooks/useTranslations"
import { formatNumberByLang } from "../../utils/number-format"

const inputClass = "input-pl"
const inputReadOnlyClass = inputClass + " cursor-not-allowed"

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

interface RentalCalculatorProps {
  lang?: 'es' | 'en'
}

const RentalCalculator: React.FC<RentalCalculatorProps> = ({ lang = 'es' }) => {
  const { t } = useTranslations(lang)
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
    let cuotaMensual = 0
    if (cantidadHipoteca > 0) {
      if (interesMensual > 0) {
        cuotaMensual = (cantidadHipoteca * interesMensual * Math.pow(1 + interesMensual, numeroCuotas)) / 
          (Math.pow(1 + interesMensual, numeroCuotas) - 1)
      } else {
        // Si el interés es 0, la cuota es simplemente el monto dividido por el número de cuotas
        cuotaMensual = cantidadHipoteca / numeroCuotas
      }
    }

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
    <>
      <div className="flex flex-col xl:flex-row gap-6 mt-4 items-start">
        {/* Formulario: 2 tarjetas en columna, ocupa el ancho restante */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          {/* Datos de la Propiedad */}
          <div className="pl-card p-5 md:p-6">
            <h2 className="font-heading text-xl font-bold text-ink mb-6">
              {t('rental.form.propertyDetails')}
            </h2>
            <div className="space-y-4">
              <Input
                label={t('rental.form.propertyPrice')}
                name="precio"
                value={form.precio}
                onChange={handleChange}
                type="number"
                min={0}
                placeholder={`${t('mortgage.form.itpModal.examplePlaceholder')} 200000`}
                className={inputClass}
                showEuroSymbol={true}
              />
              <Input
                label={t('mortgage.form.downPaymentAmountLabel')}
                name="entrada"
                value={form.entrada}
                onChange={handleChange}
                type="number"
                min={0}
                placeholder={`${t('mortgage.form.itpModal.examplePlaceholder')} 40000`}
                className={inputClass}
                showEuroSymbol={true}
              />
              <Input
                label={t('rental.form.interestRate')}
                name="interes"
                value={form.interes}
                onChange={handleChange}
                type="number"
                min={0}
                step={0.01}
                placeholder={`${t('mortgage.form.itpModal.examplePlaceholder')} 2.5`}
                className={inputClass}
              />
              <Select
                label={t('mortgage.form.autonomousCommunity')}
                name="comunidad"
                value={form.comunidad}
                onChange={handleChange}
                options={COMUNIDADES.map((c) => ({ value: c.nombre, label: c.nombre }))}
                className={inputClass}
              />
              <Input
                label={t('rental.form.loanTerm')}
                name="plazo"
                value={form.plazo}
                onChange={handleChange}
                type="number"
                min={1}
                max={40}
                placeholder={`${t('mortgage.form.itpModal.examplePlaceholder')} 30`}
                className={inputClass}
              />
            </div>
          </div>

          {/* Detalles del Alquiler */}
          <div className="pl-card p-5 md:p-6">
            <h2 className="font-heading text-xl font-bold text-ink mb-6">
              {t('rental.form.rentalDetails')}
            </h2>
            <div className="space-y-4">
              <Input
                label={t('rental.form.monthlyRentLabel')}
                name="alquilerMensual"
                value={form.alquilerMensual}
                onChange={handleChange}
                type="number"
                min={0}
                placeholder={`${t('mortgage.form.itpModal.examplePlaceholder')} 1000`}
                className={inputClass}
                showEuroSymbol={true}
              />
              <Input
                label={t('rental.form.occupancyRate')}
                name="ocupacion"
                value={form.ocupacion}
                onChange={handleChange}
                type="number"
                min={0}
                max={100}
                placeholder={`${t('mortgage.form.itpModal.examplePlaceholder')} 100`}
                className={inputClass}
              />
              <Input
                label={t('rental.form.monthlyExpensesLabel')}
                name="gastosMensuales"
                value={form.gastosMensuales}
                onChange={handleChange}
                type="number"
                min={0}
                placeholder={`${t('mortgage.form.itpModal.examplePlaceholder')} 50`}
                className={inputClass}
                showEuroSymbol={true}
              />
            </div>
          </div>
        </div>

        {/* Recibo sticky */}
        <aside className="w-full xl:w-[22rem] receipt p-6 flex flex-col gap-4 xl:sticky xl:top-24">
          <div className="receipt-head">
            <span>{t('rental.results.profitabilityMetrics')}</span>
            <span className="text-brand-blue">■</span>
          </div>
          <div className="receipt-row">
            <span>{t('rental.form.monthlyIncome')}</span>
            <b>{formatNumberByLang(calculations.ingresosMensuales, lang)} €</b>
          </div>
          <div className="receipt-row">
            <span>ITP ({calculations.porcentajeITP}%)</span>
            <b>{formatNumberByLang(calculations.itp, lang)} €</b>
          </div>
          <div className="receipt-row">
            <span>{t('mortgage.form.monthlyPaymentLabel')}</span>
            <b>{formatNumberByLang(calculations.cuotaMensual, lang)} €</b>
          </div>
          <div className="receipt-total">
            <span className="receipt-label">{t('rental.results.cashFlowLabel')}</span>
            <AnimatedNumber
              value={calculations.cashFlowMensual}
              suffix=" €"
              decimals={2}
              className={`receipt-num ${calculations.cashFlowMensual >= 0 ? '!text-positive' : '!text-negative'}`}
            />
          </div>
          <ContactButton variant="receipt" labelKey="rental.results.improveCta" lang={lang} />
        </aside>
      </div>

      {/* KPIs y gráficas a lo ancho, debajo */}
      <div className="mt-6">
        <RentalKPIs calculations={calculations} lang={lang} />
      </div>
      <div className="mt-6">
        <RentalCharts calculations={calculations} form={form} lang={lang} />
      </div>
    </>
  )
}

export default RentalCalculator 
