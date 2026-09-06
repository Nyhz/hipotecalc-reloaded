import React, { useState, useMemo } from "react"
import { COMUNIDADES } from "../../constants/comunidades"
import { calculatePurchaseTaxes, defaultPurchase } from "../../fiscal/engine"
import type { Purchase, TaxResult } from "../../fiscal/types"
import { REGIONS } from "../../fiscal/sources"
import ITPCalculator from "../calculadora-hipotecaria/ITPCalculator"
import TaxBreakdown from "../fiscal/TaxBreakdown"
import Input from "./Input"
import Select from "./Select"
import RentalKPIs from "./RentalKPIs"
import RentalCharts from "./RentalCharts"
import CashFlowEntradaChart from "./CashFlowEntradaChart"
import ContactButton from "../ContactButton"
import AnimatedNumber from "../ui/AnimatedNumber"
import { useTranslations } from "../../hooks/useTranslations"
import { formatNumberByLang } from "../../utils/number-format"

const inputClass = ""

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

  const [fiscalInput,setFiscalInput]=useState<Purchase|null>(null)
  const [showTax,setShowTax]=useState(false)
  const fiscal=useMemo(()=>calculatePurchaseTaxes({
    ...(fiscalInput??defaultPurchase(Number(form.precio),form.comunidad)),
    precio:Number(form.precio),comunidad:form.comunidad,habitual:false,
  }),[form.precio,form.comunidad,fiscalInput])
  const onTaxResult=(_n:number,_rate?:number,_description?:string,detail?:TaxResult)=>{
    if(!detail)return
    setFiscalInput({...detail.input,habitual:false})
    setForm(p=>({...p,precio:String(detail.input.precio),comunidad:REGIONS.find(([id])=>id===detail.input.comunidad)?.[1]??detail.input.comunidad}))
  }

  // Cálculos memoizados que se recalculan automáticamente cuando cambian los inputs
  const calculations = useMemo(() => {
    const precioNum = Number(form.precio) || 0
    const entradaNum = Number(form.entrada) || 0
    const interesNum = Number(form.interes) || 0
    const plazoNum = Number(form.plazo) || 0
    const ocupacionNum = Number(form.ocupacion) || 0
    const alquilerMensualNum = Number(form.alquilerMensual) || 0
    const gastosMensualesNum = Number(form.gastosMensuales) || 0

    const itp = fiscal.total ?? 0
    const porcentajeITP = fiscal.fiscalBase>0?itp/fiscal.fiscalBase*100:0

    // Cálculo de la hipoteca (sin permitir importes negativos si la entrada
    // supera el coste total, igual que en la calculadora hipotecaria)
    const cantidadHipoteca = Math.max(0, precioNum + itp - entradaNum)
    const interesMensual = interesNum / 12 / 100
    const numeroCuotas = plazoNum * 12

    // Cuota mensual de la hipoteca (numeroCuotas > 0: un plazo vacío o 0
    // dividiría por cero y propagaría Infinity a todos los KPIs)
    let cuotaMensual = 0
    if (cantidadHipoteca > 0 && numeroCuotas > 0) {
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

    // Rentabilidad neta anual: (ingresos - gastos) sobre el coste total de
    // adquisición, sin descontar la cuota hipotecaria — la financiación no
    // cambia la rentabilidad del inmueble (su efecto se ve en el cash-on-cash)
    const costeAdquisicion = precioNum + itp
    const roiAnual = costeAdquisicion > 0
      ? ((ingresosMensuales - gastosMensualesNum) * 12 / costeAdquisicion) * 100
      : 0

    // Cash on Cash Return (basado en la entrada)
    const cashOnCashReturn = entradaNum > 0 ? (cashFlowMensual * 12 / entradaNum) * 100 : 0

    // Meses para break even (cuando el cash flow acumulado iguala la entrada);
    // null = nunca se recupera; 0 = inmediato (sin entrada y cash flow positivo)
    const mesesBreakEven = cashFlowMensual > 0 ? entradaNum / cashFlowMensual : null

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
  }, [form, fiscal])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    if(name==="comunidad")setFiscalInput(null)

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
      // La ocupación es un porcentaje: no aceptar valores por encima de 100
      if (name === "ocupacion" && numValue > 100) {
        return
      }
    }

    setForm((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <>
      <div className="flex flex-col xl:flex-row gap-6 mt-4 items-start">
        {/* Formulario: 2 tarjetas en columna, ocupa el ancho restante */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          <div className='lg:col-span-2 pl-card p-5'>
            <button type='button' className='btn-outline px-4 py-2 mb-3' onClick={()=>setShowTax(true)}>{lang==='es'?'Impuestos de adquisición: fecha, valor y tipo de vivienda':'Purchase taxes: date, value and property type'}</button>
            <p className='text-xs mb-3'>{lang==='es'?'Inversión para alquiler: no se aplican beneficios exclusivos de vivienda habitual.':'Rental investment: relief reserved for a main residence does not apply.'}</p>
            <TaxBreakdown result={fiscal} lang={lang}/>
            <ITPCalculator open={showTax} onClose={()=>setShowTax(false)} onResult={onTaxResult} initialPrecio={form.precio} comunidadSeleccionada={form.comunidad} initialFiscal={fiscal.input} lang={lang} investment/>
          </div>
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
        {fiscal.total!==null?<aside className="w-full xl:w-[22rem] receipt p-6 flex flex-col gap-4 xl:sticky xl:top-24">
          <div className="receipt-head">
            <span>{t('rental.results.receiptTitle')}</span>
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
            <span>{t('mortgage.form.mortgageAmount')}</span>
            <b>{formatNumberByLang(calculations.cantidadHipoteca, lang)} €</b>
          </div>
          <div className="receipt-row">
            <span>{t('mortgage.form.monthlyPaymentLabel')}</span>
            <b>{formatNumberByLang(calculations.cuotaMensual, lang)} €</b>
          </div>
          <div className="receipt-total">
            <span className="receipt-label">{t('rental.results.cashFlowLabel')}</span>
            <AnimatedNumber
              value={calculations.cashFlowMensual}
              suffix={"\u00A0€"}
              decimals={2}
              className={`receipt-num ${calculations.cashFlowMensual >= 0 ? '!text-positive' : '!text-negative'}`}
            />
          </div>
          <ContactButton variant="receipt" labelKey="rental.results.improveCta" lang={lang} source="rental_receipt" />
        </aside>:<aside className='w-full xl:w-[22rem] receipt p-6 text-sm' role='status'>{lang==='es'?'Completa los datos fiscales del inmueble para calcular la inversión y su rentabilidad.':'Complete the property tax details to calculate investment cost and returns.'}</aside>}
      </div>

      {/* KPIs y gráficas a lo ancho, debajo */}
      {fiscal.total!==null&&<><div className="mt-6">
        <RentalKPIs calculations={calculations} lang={lang} />
      </div>
      <div className="mt-6">
        <CashFlowEntradaChart
          precioTotal={calculations.precioTotal}
          interes={Number(form.interes) || 0}
          plazo={Number(form.plazo) || 0}
          ingresosMensuales={calculations.ingresosMensuales}
          gastosMensuales={calculations.gastosMensuales}
          entradaActual={Number(form.entrada) || 0}
          lang={lang}
        />
      </div>
      <div className="mt-6">
        <RentalCharts calculations={calculations} lang={lang} />
      </div></>}
    </>
  )
}

export default RentalCalculator
