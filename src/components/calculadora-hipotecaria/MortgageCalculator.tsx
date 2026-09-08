import { isValidLoanTerm } from "../../utils/calculadora-hipotecaria"
import React, { useState, useMemo, Suspense, lazy } from "react"
import { COMUNIDADES } from "../../constants/comunidades"
import {
  cuotaMensual,
  porcentajeFinanciado,
  interesTotal,
  importeTotal,
  calcularTIN,
  getEuriborActual,
  getEuriborHistorico,
  calcularInteresVariable,
  crearTablaEscenarios,
} from "../../utils/calculadora-hipotecaria"
import Input from "./Input"
import Select from "./Select"
import ITPCalculator from "./ITPCalculator"
import ContactButton from "../ContactButton"
import SensitivityTable from "./SensitivityTable"
import AnimatedNumber from "../ui/AnimatedNumber"
import ChartErrorBoundary from "../ui/ChartErrorBoundary"
import { useGoogleAnalytics } from "../../hooks/useGoogleAnalytics"
import { useTranslations } from "../../hooks/useTranslations"
import { formatNumberByLang } from "../../utils/number-format"
import { calculatePurchaseTaxes, defaultPurchase, resultDescription } from '../../fiscal/engine'
import type { Purchase, TaxResult } from '../../fiscal/types'
import { REGIONS } from '../../fiscal/sources'
import TaxBreakdown from '../fiscal/TaxBreakdown'

const inputClass = ""
const inputReadOnlyClass = "cursor-not-allowed bg-paper-2 text-ink-soft"

// Carga diferida: echarts pesa ~1 MB y no debe bloquear el primer render
const MortgageSummaryCharts = lazy(() => import("./MortgageSummaryCharts"))

// Redeploy
const initialState = {
  precio: "",
  tasacion: "",
  comunidad: "",
  tipoVivienda: "",
  otrosCostes: "",
  ahorro: "",
  tipoHipoteca: "Fija",
  tae: "2.0",
  plazo: "30",
  diferencial: "1.0",
  periodoAnalisis: "10",
}

interface MortgageCalculatorProps {
  lang?: 'es' | 'en'
  /** Preselecciona la comunidad autónoma (nombre exacto de COMUNIDADES) */
  initialComunidad?: string
}

const MortgageCalculator: React.FC<MortgageCalculatorProps> = ({ lang = 'es', initialComunidad }) => {
  const { trackCalculatorUsage } = useGoogleAnalytics()
  const { t, currentLang } = useTranslations(lang)

  // Valores internos estables (independientes del idioma) con etiqueta
  // traducida: la lógica de cálculo compara contra estos literales
  const tiposVivienda = [
    { value: "Obra nueva", label: t('mortgage.form.newConstruction') },
    { value: "Segunda mano", label: t('mortgage.form.secondHand') },
  ]
  const tiposHipoteca = [
    { value: "Fija", label: t('mortgage.form.fixed') },
    { value: "Variable", label: t('mortgage.form.variable') },
  ] // TODO: Añadir MIXTA.
  
  const [showItpModal, setShowItpModal] = useState(false)
  const [form, setForm] = useState(() => ({
    ...initialState,
    ...(initialComunidad ? { comunidad: initialComunidad } : {}),
  }))

  const [itpCalculado, setItpCalculado] = useState(false)
  const [itpValorModal, setItpValorModal] = useState<number | null>(null)
  const [itpTipoAplicado, setItpTipoAplicado] = useState<number | null>(null)
  const [itpDescripcion, setItpDescripcion] = useState<string>("")
  const [fiscalInput, setFiscalInput] = useState<Purchase | null>(null)
  const fiscal = useMemo(() => calculatePurchaseTaxes({
    ...(fiscalInput ?? defaultPurchase(Number(form.precio),form.comunidad,form.tipoVivienda==='Obra nueva'?'Obra nueva':'Segunda mano')),
    precio:Number(form.precio),comunidad:form.comunidad,tipoVivienda:form.tipoVivienda==='Obra nueva'?'Obra nueva':'Segunda mano',
  }),[form.precio,form.comunidad,form.tipoVivienda,fiscalInput])

  // Handler para recibir el resultado del ITPCalculator
  const handleItpResult = (
    valor: number,
    tipoAplicado?: number,
    descripcion?: string,
    detail?: TaxResult
  ) => {
    setItpValorModal(valor)
    setItpTipoAplicado(tipoAplicado ?? null)
    setItpDescripcion(descripcion || "")
    setItpCalculado(true)
    if(detail){
      setFiscalInput(detail.input)
      setForm(prev=>({...prev,precio:String(detail.input.precio),comunidad:REGIONS.find(([id])=>id===detail.input.comunidad)?.[1]??detail.input.comunidad,tipoVivienda:detail.input.tipoVivienda}))
    }
  }

  // Cálculos memoizados que se recalculan automáticamente cuando cambian los inputs
  const calculations = useMemo(() => {
    const precioNum = Number(form.precio) || 0
    const otrosCostesNum = Number(form.otrosCostes) || 0
    const ahorroNum = Number(form.ahorro) || 0
    const taeNum = Number(form.tae) || 0
    const diferencialNum = Number(form.diferencial) || 0
    const periodoAnalisisNum = Number(form.periodoAnalisis) || 10

    // Determinar si es obra nueva o segunda mano
    const esObraNueva = form.tipoVivienda === "Obra nueva"
    const esHipotecaVariable = form.tipoHipoteca === "Variable"

    const impuesto = fiscal.total ?? 0 // Incomplete results are not displayed as a mortgage quote.
    const descripcionImpuesto = resultDescription(fiscal,currentLang)

    const precioFinal = precioNum + otrosCostesNum + impuesto
    const cantidadHipoteca = Math.max(0, precioFinal - ahorroNum)

    // Cálculo del interés según el tipo de hipoteca
    let tin: number
    let euriborActual: number = 0
    let euriborHistorico: { min: number; max: number } = { min: 0, max: 0 }
    let tablaEscenarios: any[] = []

    if (esHipotecaVariable) {
      // Para hipotecas variables: Euribor + Diferencial
      euriborActual = getEuriborActual()
      euriborHistorico = getEuriborHistorico(periodoAnalisisNum)
      tin = calcularInteresVariable(euriborActual, diferencialNum)
      tablaEscenarios = crearTablaEscenarios(diferencialNum, periodoAnalisisNum, currentLang)
    } else {
      // Para hipotecas fijas: TAE convertido a TIN
      tin = calcularTIN(taeNum)
    }

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

    // Cálculos adicionales para hipotecas variables
    let cuotaMinima = 0
    let cuotaMaxima = 0
    if (esHipotecaVariable) {
      // Usar los valores de la tabla de escenarios (el orden es siempre: mínimo, actual, máximo)
      const escenarioMinimo = tablaEscenarios[0] // Primer elemento es siempre el mínimo histórico
      const escenarioMaximo = tablaEscenarios[2] // Tercer elemento es siempre el máximo histórico

      if (escenarioMinimo && escenarioMaximo) {
        const paramsMinimo = { ...params, tin: escenarioMinimo.interesTotal }
        const paramsMaximo = { ...params, tin: escenarioMaximo.interesTotal }

        cuotaMinima = cuotaMensual(paramsMinimo)
        cuotaMaxima = cuotaMensual(paramsMaximo)
      }
    }

    // Cálculo del porcentaje de hipoteca vs tasación
    const tasacionNum = Number(form.tasacion) || 0
    const porcentajeHipotecaTasacion =
      tasacionNum > 0 ? (cantidadHipoteca / tasacionNum) * 100 : 0
    const esPorcentajeAlto = porcentajeHipotecaTasacion > 80

    return {
      impuesto,
      esObraNueva,
      descripcionImpuesto,
      precioFinal,
      cantidadHipoteca,
      tin,
      cuota,
      porcentaje,
      interes,
      importe,
      porcentajeHipotecaTasacion,
      esPorcentajeAlto,
      esHipotecaVariable,
      euriborActual,
      euriborHistorico,
      tablaEscenarios,
      cuotaMinima,
      cuotaMaxima,
    }
  }, [form, fiscal, currentLang])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target

    // Track calculator usage for important fields
    if (["precio", "ahorro", "tae", "plazo"].includes(name) && value) {
      trackCalculatorUsage("mortgage", `field_updated_${name}`)
    }

    // Validación para prevenir valores negativos en campos numéricos
    if (
      [
        "precio",
        "tasacion",
        "otrosCostes",
        "ahorro",
        "tae",
        "plazo",
        "diferencial",
        "periodoAnalisis",
      ].includes(name)
    ) {
      const numValue = Number(value)
      if (numValue < 0) {
        return // No actualizar si el valor es negativo
      }
    }

    // Si cambia el tipo de vivienda, el precio o la comunidad, limpiar el
    // cálculo del modal: su importe es fijo y quedaría desactualizado.
    if (["tipoVivienda", "precio", "comunidad"].includes(name)) {
      setItpCalculado(false)
      setItpValorModal(null)
      setItpTipoAplicado(null)
      setItpDescripcion("")
      if(name==='comunidad'||name==='tipoVivienda')setFiscalInput(null)
      if (name === "tipoVivienda") {
        trackCalculatorUsage("mortgage", `property_type_changed_${value}`)
      }
    }

    setForm((prev) => ({ ...prev, [name]: value }))
  }

  // Función para formatear el label del impuesto según el tipo de vivienda
  const getImpuestoLabel = () => {
    return lang==='es'?'Total impuestos de adquisición':'Total purchase taxes'
  }

  // Si el usuario edita el campo ITP manualmente, ocultar el aviso
  const handleImpuestoManual = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, impuesto: e.target.value }))
    setItpCalculado(false)
    setItpValorModal(null)
  }

  // Función para restablecer el campo de impuesto
  const handleResetImpuesto = () => {
    setFiscalInput(null)
    setItpCalculado(false)
    setItpValorModal(null)
    setItpTipoAplicado(null)
    setItpDescripcion("")
  }

  // Funciones para sincronizar cambios del modal con el formulario principal.
  // El precio NO se sincroniza: en el modal puede introducirse el VMA (País
  // Vasco), que es independiente del precio de compraventa.
  // Si el valor sincronizado cambia, el resultado previo del modal queda
  // desactualizado y hay que descartarlo (igual que hace handleChange).
  const handleModalComunidadChange = (comunidad: string) => {
    if (comunidad !== form.comunidad) {
      handleResetImpuesto()
    }
    setForm((prev) => ({ ...prev, comunidad }))
  }

  const handleModalTipoViviendaChange = (tipoVivienda: string) => {
    if (tipoVivienda !== form.tipoVivienda) {
      handleResetImpuesto()
    }
    setForm((prev) => ({ ...prev, tipoVivienda }))
  }

  const validTerm = isValidLoanTerm(form.plazo)
  const canQuote = fiscal.total !== null && (calculations.cantidadHipoteca === 0 || validTerm)

  return (
    <div className='flex flex-col xl:flex-row gap-6 mt-4 items-start'>
      <form
        className='flex-1 pl-card p-5 md:p-6'
        autoComplete='off'
        onSubmit={e => e.preventDefault()}
      >
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <fieldset className='rounded-xl border border-line bg-paper/50 p-4'>
            <legend className='font-data text-[11px] uppercase tracking-widest text-ink-soft px-1 mb-3'>
              {t('mortgage.form.propertyDetails')}
            </legend>
            <div className='grid gap-4'>
              <Input
                label={t('mortgage.form.propertyPrice')}
                name='precio'
                value={form.precio}
                onChange={handleChange}
                type='number'
                min={0}
                placeholder={t('mortgage.form.itpModal.examplePrice')}
                className={inputClass}
                showEuroSymbol={true}
              />
              <Input
                label={t('mortgage.form.propertyAppraisal')}
                name='tasacion'
                value={form.tasacion}
                onChange={handleChange}
                type='number'
                min={0}
                placeholder={t('mortgage.form.itpModal.exampleAppraisal')}
                className={inputClass}
                showEuroSymbol={true}
              />
              <Select
                label={t('mortgage.form.autonomousCommunity')}
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
                label={t('mortgage.form.propertyType')}
                name='tipoVivienda'
                value={form.tipoVivienda}
                onChange={handleChange}
                options={tiposVivienda}
                className={inputClass}
              />
            </div>
          </fieldset>
          <fieldset className='rounded-xl border border-line bg-paper/50 p-4'>
            <legend className='font-data text-[11px] uppercase tracking-widest text-ink-soft px-1 mb-3'>
              {t('mortgage.form.taxesAndCosts')}
            </legend>
            <div className='grid gap-4'>
              <div className='relative'>
                <div>
                  <label
                    className='flex text-sm font-medium mb-1 items-center gap-2'
                    htmlFor='impuesto'
                  >
                    <span>
                      {getImpuestoLabel()}
                    </span>
                    <button
                      type='button'
                      aria-label={`${t('common.openCalculator')} ${
                        calculations.esObraNueva ? t('mortgage.form.itpModal.vatTitle') : t('mortgage.form.itpModal.title')
                      }`}
                      className='text-blue-700 hover:underline hover:text-blue-900 focus:outline-none bg-transparent border-0 p-0 h-auto text-sm font-medium cursor-pointer'
                      style={{ lineHeight: "1", height: "1.5em" }}
                      onClick={() => setShowItpModal(true)}
                    >
                      {lang==='es'?'Fecha, base y beneficios':'Date, tax base and relief'}
                    </button>
                    {itpCalculado && (
                      <div className='text-xs text-green-700 bg-green-100 rounded px-2 ml-2 py-1 shadow-sm'>
                        {t(calculations.esObraNueva ? 'mortgage.form.ivaCalculated' : 'mortgage.form.itpCalculated')}
                      </div>
                    )}
                  </label>
                  <div className='relative'>
                    <input
                      id='impuesto'
                      name='impuesto'
                      type='number'
                      value={fiscal.total??''}
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
                          handleImpuestoManual(
                            correctedEvent as React.ChangeEvent<HTMLInputElement>
                          )
                          setItpTipoAplicado(null)
                          setItpDescripcion("")
                          return
                        }

                        handleImpuestoManual(e)
                        setItpTipoAplicado(null)
                        setItpDescripcion("")
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "-" || e.key === "Minus") {
                          e.preventDefault()
                        }
                      }}
                      readOnly
                      className={`input-pl ${inputReadOnlyClass} ${
                        itpCalculado ? "pr-16" : "pr-8"
                      }`}
                      style={{
                        WebkitAppearance: "none",
                        MozAppearance: "textfield",
                        appearance: "textfield",
                      }}
                    />
                    <span className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none'>
                      €
                    </span>
                    {itpCalculado && (
                      <button
                        type='button'
                        onClick={handleResetImpuesto}
                        className='absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-red-600 focus:outline-none bg-transparent border cursor-pointer rounded-full p-1'
                        aria-label={t('mortgage.form.resetTaxCalculation')}
                        title={t('mortgage.form.resetTaxCalculation')}
                      >
                        <svg
                          className='w-4 h-4'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M6 18L18 6M6 6l12 12'
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
                {Number(form.precio)>0&&<div className='mt-3'><TaxBreakdown result={fiscal} lang={lang}/></div>}
              </div>
              <Input
                label={t('mortgage.form.otherCosts')}
                name='otrosCostes'
                value={form.otrosCostes}
                onChange={handleChange}
                type='number'
                min={0}
                placeholder={`${t('mortgage.form.itpModal.examplePlaceholder')} 5000`}
                className={inputClass}
                showEuroSymbol={true}
              />
              <Input
                label={t('mortgage.form.finalPrice')}
                name='precioFinal'
                value={calculations.precioFinal}
                onChange={() => {}}
                type='number'
                readOnly
                className={inputReadOnlyClass}
                showEuroSymbol={true}
              />
            </div>
          </fieldset>
          <fieldset className='rounded-xl border border-line bg-paper/50 p-4 lg:col-span-2'>
            <legend className='font-data text-[11px] uppercase tracking-widest text-ink-soft px-1 mb-3'>
              {t('mortgage.form.financingAndConditions')}
            </legend>
            <div className='grid gap-4'>
              <Input
                label={t('mortgage.form.savingsContributed')}
                name='ahorro'
                value={form.ahorro}
                onChange={handleChange}
                type='number'
                min={0}
                placeholder={`${t('mortgage.form.itpModal.examplePlaceholder')} 40000`}
                className={inputClass}
                showEuroSymbol={true}
              />
              <Input
                label={t('mortgage.form.mortgageAmount')}
                name='cantidadHipoteca'
                value={calculations.cantidadHipoteca}
                onChange={() => {}}
                type='number'
                readOnly
                className={inputReadOnlyClass}
                showEuroSymbol={true}
              />
              <Select
                label={t('mortgage.form.mortgageType')}
                name='tipoHipoteca'
                value={form.tipoHipoteca}
                onChange={handleChange}
                options={tiposHipoteca}
                className={inputClass}
              />
              {!calculations.esHipotecaVariable && (
                <Input
                  label={t('mortgage.form.annualRate')}
                  name='tae'
                  value={form.tae}
                  onChange={handleChange}
                  type='number'
                  min={0}
                  step={0.01}
                  placeholder={`${t('mortgage.form.itpModal.examplePlaceholder')} 3.25`}
                  className={inputClass}
                />
              )}
              <Input
                label={t('mortgage.form.nominalRate')}
                name='tin'
                value={calculations.tin.toFixed(2)}
                onChange={() => {}}
                type='number'
                readOnly
                className={inputReadOnlyClass}
              />

              {/* Campos específicos para hipotecas variables */}
              {calculations.esHipotecaVariable && (
                <>
                  <Input
                    label={t('mortgage.form.differential')}
                    name='diferencial'
                    value={form.diferencial}
                    onChange={handleChange}
                    type='number'
                    min={0}
                    step={0.01}
                    placeholder={`${t('mortgage.form.itpModal.examplePlaceholder')} 1.0`}
                    className={inputClass}
                  />

                  <Input
                    label={t('mortgage.form.analysisPeriod')}
                    name='periodoAnalisis'
                    value={form.periodoAnalisis}
                    onChange={handleChange}
                    type='number'
                    min={1}
                    max={25}
                    placeholder={`${t('mortgage.form.itpModal.examplePlaceholder')} 10`}
                    className={inputClass}
                  />

                  {/* Tabla de escenarios */}
                  <div className='rounded-xl border border-line bg-paper/60 p-4'>
                    <h4 className='font-semibold text-sm text-gray-700 mb-3'>
                      {t('mortgage.form.variableInterestScenarios')}
                    </h4>
                    <div className='overflow-x-auto'>
                      <table className='w-full text-xs'>
                        <thead>
                          <tr className='border-b border-gray-300'>
                            <th className='text-left py-2 px-2 font-medium text-gray-600'>
                              {t('mortgage.form.scenario')}
                            </th>
                            <th className='text-right py-2 px-2 font-medium text-gray-600'>
                              {t('mortgage.form.euribor')}
                            </th>
                            <th className='text-right py-2 px-2 font-medium text-gray-600'>
                              {t('mortgage.form.totalInterest')}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {calculations.tablaEscenarios.map(
                            (escenario, index) => (
                              <tr
                                key={index}
                                className='border-b border-gray-200'
                              >
                                <td className='py-2 px-2 text-gray-700'>
                                  {escenario.escenario}
                                </td>
                                <td className='py-2 px-2 text-right text-gray-700'>
                                  {escenario.euribor.toFixed(2)}
                                </td>
                                <td className='py-2 px-2 text-right font-medium text-gray-900'>
                                  {escenario.interesTotal.toFixed(2)}
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              <Input
                label={t('mortgage.form.loanTerm')}
                name='plazo'
                value={form.plazo}
                onChange={handleChange}
                type='number'
                min={1}
                max={40}
                placeholder={`${t('mortgage.form.itpModal.examplePlaceholder')} 30`}
                className={inputClass}
              />
            </div>
          </fieldset>
        </div>

        {/* Sensitivity Table */}
        {fiscal.total!==null&&validTerm&&<SensitivityTable
          fiscalInput={fiscal.input}
          form={form}
          calculations={calculations}
          itpCalculado={itpCalculado}
          itpTipoAplicado={itpTipoAplicado}
          itpDescripcion={itpDescripcion}
          lang={currentLang}
        />}
      </form>
      {canQuote?<aside className='w-full xl:w-[22rem] receipt p-6 flex flex-col gap-4 xl:sticky xl:top-24'>
        <div className='receipt-head'>
          <span>{t('mortgage.form.monthlyPayment')}</span>
          <span className='text-brand-blue'>■</span>
        </div>

        <div className='receipt-total'>
          <span className='receipt-label'>{t('mortgage.form.estimatedMonthlyPayment')}</span>
          <AnimatedNumber value={calculations.cuota} suffix={'\u00A0€'} decimals={2} className='receipt-num' />
        </div>

        <ContactButton variant='receipt' labelKey='mortgage.results.improveCta' lang={lang} source='mortgage_receipt' />

        {/* Escenarios para hipotecas variables integrados */}
        {calculations.esHipotecaVariable && (
          <div className='flex flex-col'>
            <div className='receipt-row'>
              <span>{t('mortgage.form.minimumHistorical')}</span>
              <b style={{ color: "var(--color-positive)" }}>
                {formatNumberByLang(calculations.cuotaMinima, currentLang)} €
              </b>
            </div>
            <div className='receipt-row'>
              <span>{t('mortgage.form.maximumHistorical')}</span>
              <b style={{ color: "var(--color-negative)" }}>
                {formatNumberByLang(calculations.cuotaMaxima, currentLang)} €
              </b>
            </div>
          </div>
        )}

        {/* Información de la hipoteca */}
        <div className='flex flex-col'>
          <div className='receipt-row'>
            <span>{t('mortgage.form.mortgageAmount')}</span>
            <b>
              {formatNumberByLang(calculations.cantidadHipoteca, currentLang)} €
            </b>
          </div>
          <div className='receipt-row'>
            <span>{t('mortgage.form.financingPercentage')}</span>
            <b>{calculations.porcentaje} %</b>
          </div>
        </div>

        {/* Gráficas */}
        <ChartErrorBoundary>
          <Suspense fallback={null}>
            <MortgageSummaryCharts
              precioInmueble={Number(form.precio) || 0}
              impuestosGastos={
                calculations.impuesto + (Number(form.otrosCostes) || 0)
              }
              ahorroAportado={Number(form.ahorro) || 0}
              cantidadHipoteca={calculations.cantidadHipoteca}
              interesTotal={calculations.interes}
            />
          </Suspense>
        </ChartErrorBoundary>

        {/* Información adicional */}
        <div className='flex flex-col'>
          <div className='receipt-row'>
            <span>{t('mortgage.form.mortgageAppraisalPercentage')}</span>
            <b style={calculations.esPorcentajeAlto ? { color: "var(--color-negative)" } : undefined}>
              {calculations.porcentajeHipotecaTasacion.toFixed(1)} %
            </b>
          </div>
          <div className='receipt-row'>
            <span>{t('mortgage.form.totalInterestLabel')}</span>
            <b>{formatNumberByLang(calculations.interes, currentLang)} €</b>
          </div>
        </div>
      </aside>:<aside className='w-full xl:w-[22rem] receipt p-6 text-sm' role='status'>{fiscal.total === null ? (lang==='es'?'Completa los datos fiscales del inmueble para calcular el coste de compra y la financiación.':'Complete the property tax details to calculate purchase cost and financing.') : (lang==='es'?'Introduce un plazo de hipoteca de entre 1 y 40 años completos para calcular la cuota.':'Enter a mortgage term of 1 to 40 whole years to calculate payments.')}</aside>}
      {/* Modal Calculadora ITP */}
      <ITPCalculator
        initialFiscal={fiscalInput?{...fiscal.input,habitual:fiscalInput.habitual}:undefined}
        open={showItpModal}
        onClose={() => setShowItpModal(false)}
        onResult={handleItpResult}
        comunidadSeleccionada={form.comunidad}
        initialPrecio={form.precio}
        initialTipoVivienda={form.tipoVivienda}
        initialEdad=''
        initialSituacion=''
        initialDiscapacidad={false}
        initialPorcentajeDiscapacidad=''
        initialPrimeraVivienda={false}
        initialNumHijos=''
        initialVictimaViolencia={false}
        initialVictimaTerrorismo={false}
        initialZonaDespoblada={false}
        initialVpo={false}
        onComunidadChange={handleModalComunidadChange}
        onTipoViviendaChange={handleModalTipoViviendaChange}
        lang={currentLang}
      />
    </div>
  )
}

export default MortgageCalculator
