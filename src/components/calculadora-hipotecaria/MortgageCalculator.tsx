import React, { useState, useMemo } from "react"
import { COMUNIDADES } from "../../constants/comunidades"
import {
  cuotaMensual,
  porcentajeFinanciado,
  interesTotal,
  importeTotal,
  calcularTIN,
  calcularITP,
  calcularIVA,
  getEuriborActual,
  getEuriborHistorico,
  calcularInteresVariable,
  crearTablaEscenarios,
} from "../../utils/calculadora-hipotecaria"
import Input from "./Input"
import Select from "./Select"
import ITPCalculator from "./ITPCalculator"
import MortgageSummaryCharts from "./MortgageSummaryCharts"
import ContactButton from "../ContactButton"
import SensitivityTable from "./SensitivityTable"
import { useGoogleAnalytics } from "../../hooks/useGoogleAnalytics"

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
  tipoHipoteca: "Fija",
  tae: "",
  plazo: "30",
  diferencial: "1.0",
  periodoAnalisis: "10",
}

const MortgageCalculator: React.FC = () => {
  const { trackCalculatorUsage } = useGoogleAnalytics()
  const [showItpModal, setShowItpModal] = useState(false)
  const [form, setForm] = useState(initialState)

  const [itpCalculado, setItpCalculado] = useState(false)
  const [itpTipoAplicado, setItpTipoAplicado] = useState<number | null>(null)
  const [itpDescripcion, setItpDescripcion] = useState<string>("")

  // Handler para recibir el resultado del ITPCalculator
  const handleItpResult = (
    valor: number,
    tipoAplicado?: number,
    descripcion?: string
  ) => {
    setItpTipoAplicado(tipoAplicado ?? null)
    setItpDescripcion(descripcion || "")
    setItpCalculado(true)
  }

  // Cálculos memoizados que se recalculan automáticamente cuando cambian los inputs
  const calculations = useMemo(() => {
    const precioNum = Number(form.precio) || 0
    const otrosCostesNum = Number(form.otrosCostes) || 0
    const ahorroNum = Number(form.ahorro) || 0
    const taeNum = Number(form.tae) || 0
    const plazoNum = Number(form.plazo) || 0
    const diferencialNum = Number(form.diferencial) || 0
    const periodoAnalisisNum = Number(form.periodoAnalisis) || 10

    // Determinar si es obra nueva o segunda mano
    const esObraNueva = form.tipoVivienda === "Obra nueva"
    const esHipotecaVariable = form.tipoHipoteca === "Variable"

    // Si hay un cálculo previo del modal y es del tipo correcto, usarlo
    let impuesto: number
    let descripcionImpuesto: string

    if (itpCalculado && itpTipoAplicado !== null) {
      // Usar el valor calculado del modal
      impuesto = Number(form.precio) * (itpTipoAplicado / 100)
      descripcionImpuesto =
        itpDescripcion || `${esObraNueva ? "IVA" : "ITP"} ${itpTipoAplicado}%`
    } else {
      // Cálculo automático por defecto
      if (esObraNueva) {
        impuesto = calcularIVA(precioNum, 10)
        descripcionImpuesto = "IVA 10%"
      } else {
        // Obtener el porcentaje de ITP de la comunidad seleccionada
        const comunidadSeleccionada = COMUNIDADES.find(
          (c) => c.nombre === form.comunidad
        )
        const porcentajeITP = comunidadSeleccionada?.ITP || 6 // Porcentaje por defecto si no hay comunidad seleccionada
        impuesto = calcularITP(precioNum, porcentajeITP)
        descripcionImpuesto = `ITP ${porcentajeITP}%`
      }
    }

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
      tablaEscenarios = crearTablaEscenarios(diferencialNum, periodoAnalisisNum)
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
      // Usar los valores de la tabla de escenarios
      const escenarioMinimo = tablaEscenarios.find(e => e.escenario === "Mínimo histórico")
      const escenarioMaximo = tablaEscenarios.find(e => e.escenario === "Máximo histórico")
      
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
  }, [form, itpCalculado, itpTipoAplicado, itpDescripcion]) // Incluir las dependencias del modal

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target

    // Track calculator usage for important fields
    if (['precio', 'ahorro', 'tae', 'plazo'].includes(name) && value) {
      trackCalculatorUsage('mortgage', `field_updated_${name}`)
    }

    // Validación para prevenir valores negativos en campos numéricos
    if (
      ["precio", "tasacion", "otrosCostes", "ahorro", "tae", "plazo", "diferencial", "periodoAnalisis"].includes(
        name
      )
    ) {
      const numValue = Number(value)
      if (numValue < 0) {
        return // No actualizar si el valor es negativo
      }
    }

    // Si cambia el tipo de vivienda, limpiar el cálculo del modal
    if (name === "tipoVivienda") {
      setItpCalculado(false)
      setItpTipoAplicado(null)
      setItpDescripcion("")
      trackCalculatorUsage('mortgage', `property_type_changed_${value}`)
    }

    setForm((prev) => ({ ...prev, [name]: value }))
  }

  // Función para formatear el label del impuesto según el tipo de vivienda
  const getImpuestoLabel = () => {
    return calculations.esObraNueva
      ? "IVA (10%)"
      : calculations.descripcionImpuesto
  }

  // Si el usuario edita el campo ITP manualmente, ocultar el aviso
  const handleImpuestoManual = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, impuesto: e.target.value }))
    setItpCalculado(false)
  }

  // Función para restablecer el campo de impuesto
  const handleResetImpuesto = () => {
    setItpCalculado(false)
    setItpTipoAplicado(null)
    setItpDescripcion("")
  }

  // Funciones para sincronizar cambios del modal con el formulario principal
  const handleModalPrecioChange = (precio: string) => {
    setForm((prev) => ({ ...prev, precio }))
  }

  const handleModalComunidadChange = (comunidad: string) => {
    setForm((prev) => ({ ...prev, comunidad }))
  }

  const handleModalTipoViviendaChange = (tipoVivienda: string) => {
    setForm((prev) => ({ ...prev, tipoVivienda }))
  }

  // Determinar si la comunidad seleccionada requiere campos especiales
  const comunidadSeleccionada = COMUNIDADES.find(
    (c) => c.nombre === form.comunidad
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
    <div className='w-full max-w-7xl flex flex-col md:flex-row gap-8 px-4 pt-10'>
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
                showEuroSymbol={true}
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
                showEuroSymbol={true}
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
                <div>
                  <label
                    className='flex text-sm font-medium mb-1 items-center gap-2'
                    htmlFor='impuesto'
                  >
                    <span>
                      {itpTipoAplicado
                        ? `ITP (${itpTipoAplicado}%)`
                        : getImpuestoLabel()}
                    </span>
                    <button
                      type='button'
                      aria-label={`Abrir calculadora ${
                        calculations.esObraNueva ? "IVA" : "ITP"
                      }`}
                      className='text-blue-600 hover:underline hover:text-blue-800 focus:outline-none bg-transparent border-0 p-0 h-auto text-sm font-normal cursor-pointer'
                      style={{ lineHeight: "1", height: "1.5em" }}
                      onClick={() => setShowItpModal(true)}
                    >
                      Calcula tu {calculations.esObraNueva ? "IVA" : "ITP"}
                    </button>
                    {itpCalculado && (
                      <div className='text-xs text-green-700 bg-green-100 rounded px-2 ml-2 py-1 shadow'>
                        {calculations.esObraNueva ? "IVA" : "ITP"} Calculado
                      </div>
                    )}
                  </label>
                  <div className='relative'>
                    <input
                      id='impuesto'
                      name='impuesto'
                type='number'
                      value={calculations.impuesto}
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
                      className={`${inputReadOnlyClass} ${
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
                        aria-label='Restablecer cálculo de impuesto'
                        title='Restablecer cálculo de impuesto'
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
                {itpDescripcion && itpCalculado && (
                  <div className='text-green-800 bg-green-50 border border-green-200 rounded px-3 py-2 mt-2 text-sm text-center'>
                    <span className='font-semibold'>
                      {calculations.esObraNueva ? "IVA" : "Bonificación"}{" "}
                      aplicada:
                    </span>{" "}
                    {itpDescripcion}
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
                showEuroSymbol={true}
              />
              <Input
                label='Precio final (€)'
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
                showEuroSymbol={true}
              />
              <Input
                label='Cantidad hipoteca (€)'
                name='cantidadHipoteca'
                value={calculations.cantidadHipoteca}
                onChange={() => {}}
                type='number'
                readOnly
                className={inputReadOnlyClass}
                showEuroSymbol={true}
              />
              <Select
                label='Tipo de hipoteca'
                name='tipoHipoteca'
                value={form.tipoHipoteca}
                onChange={handleChange}
                options={tiposHipoteca.map((t) => ({ value: t, label: t }))}
                className={inputClass}
              />
              {!calculations.esHipotecaVariable && (
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
              )}
              <Input
                label='TIN (%)'
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
                    label='Diferencial (%)'
                    name='diferencial'
                    value={form.diferencial}
                    onChange={handleChange}
                    type='number'
                    min={0}
                    step={0.01}
                    placeholder='Ej: 1.0'
                    className={inputClass}
                  />
                  
                  <Input
                    label='Período de análisis histórico (años)'
                    name='periodoAnalisis'
                    value={form.periodoAnalisis}
                    onChange={handleChange}
                    type='number'
                    min={1}
                    max={25}
                    placeholder='Ej: 10'
                    className={inputClass}
                  />
                  
                  {/* Tabla de escenarios */}
                  <div className='bg-gray-50 rounded-lg p-4'>
                    <h4 className='font-semibold text-sm text-gray-700 mb-3'>
                      Escenarios de interés variable
                    </h4>
                    <div className='overflow-x-auto'>
                      <table className='w-full text-xs'>
                        <thead>
                          <tr className='border-b border-gray-300'>
                            <th className='text-left py-2 px-2 font-medium text-gray-600'>Escenario</th>
                            <th className='text-right py-2 px-2 font-medium text-gray-600'>Euribor (%)</th>
                            <th className='text-right py-2 px-2 font-medium text-gray-600'>Interés total (%)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {calculations.tablaEscenarios.map((escenario, index) => (
                            <tr key={index} className='border-b border-gray-200'>
                              <td className='py-2 px-2 text-gray-700'>{escenario.escenario}</td>
                              <td className='py-2 px-2 text-right text-gray-700'>{escenario.euribor.toFixed(2)}</td>
                              <td className='py-2 px-2 text-right font-medium text-gray-900'>{escenario.interesTotal.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
              
              <Input
                label='Plazo (años)'
                name='plazo'
                value={form.plazo}
                onChange={handleChange}
                type='number'
                min={1}
                max={40}
                placeholder='Ej: 30'
                className={inputClass}
              />
            </div>
          </fieldset>
        </div>

        {/* Sensitivity Table */}
        <SensitivityTable
          form={form}
          calculations={calculations}
          itpCalculado={itpCalculado}
          itpTipoAplicado={itpTipoAplicado}
          itpDescripcion={itpDescripcion}
        />
      </form>
      <aside className='w-full md:w-96 bg-white rounded-xl shadow-lg p-6 flex flex-col gap-6 border border-blue-100'>
        <h2 className='text-xl font-bold text-blue-900 mb-2'>
          Tu cuota mensual
        </h2>
        <div className='flex flex-col items-center justify-center bg-blue-50 rounded-xl p-6 mb-4 shadow-inner'>
          <span className='text-3xl font-extrabold text-blue-800 mb-2'>
            {calculations.cuota} €
          </span>
          <div className='text-blue-900 font-semibold text-lg mb-3'>
            Cuota mensual estimada
          </div>
          
          {/* Escenarios para hipotecas variables integrados */}
          {calculations.esHipotecaVariable && (
            <div className='flex gap-6 text-sm'>
              <div className='text-center'>
                <div className='text-gray-600 text-xs'>Mínimo histórico</div>
                <div className='font-medium text-green-700'>
                  {new Intl.NumberFormat("es-ES").format(calculations.cuotaMinima)} €
                </div>
              </div>
              <div className='text-center'>
                <div className='text-gray-600 text-xs'>Máximo histórico</div>
                <div className='font-medium text-red-700'>
                  {new Intl.NumberFormat("es-ES").format(calculations.cuotaMaxima)} €
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Información de la hipoteca */}
        <div className='space-y-2'>
          <div className='flex justify-between items-center py-2'>
            <div className='flex items-center gap-2'>
              <span className='text-blue-900 font-semibold'>Importe hipoteca</span>
              <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </div>
            <span className='text-blue-900 font-semibold'>
              {new Intl.NumberFormat("es-ES").format(calculations.cantidadHipoteca)} €
            </span>
          </div>
          <div className='flex justify-between items-center py-2'>
            <div className='flex items-center gap-2'>
              <span className='text-blue-900 font-semibold'>Porcentaje de financiación</span>
              <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </div>
            <span className='text-blue-900 font-semibold'>
              {calculations.porcentaje} %
            </span>
          </div>
        </div>

        {/* Botón de contacto movido arriba */}
        <div className='w-full flex items-center justify-center'>
          <ContactButton variant='desktop' />
        </div>

        {/* Gráficas */}
        <MortgageSummaryCharts
          precioInmueble={Number(form.precio) || 0}
          impuestosGastos={calculations.impuesto + (Number(form.otrosCostes) || 0)}
          ahorroAportado={Number(form.ahorro) || 0}
          cantidadHipoteca={calculations.cantidadHipoteca}
          interesTotal={calculations.interes}
        />

        {/* Información adicional */}
        <div className='space-y-2'>
          <div className='flex justify-between items-center py-2 border-b border-gray-200'>
            <span className='text-blue-900 font-semibold'>% Hipoteca/Tasación</span>
            <span
              className={`font-semibold ${
                calculations.esPorcentajeAlto ? "text-red-600" : "text-blue-900"
              }`}
            >
              {calculations.porcentajeHipotecaTasacion.toFixed(1)} %
            </span>
          </div>
          <div className='flex justify-between items-center py-2'>
            <span className='text-blue-900 font-semibold'>Interés total</span>
            <span className='text-blue-900 font-semibold'>
              {new Intl.NumberFormat("es-ES").format(calculations.interes)} €
            </span>
          </div>
        </div>

      </aside>
      {/* Modal Calculadora ITP */}
      <ITPCalculator
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
        onPrecioChange={handleModalPrecioChange}
        onComunidadChange={handleModalComunidadChange}
        onTipoViviendaChange={handleModalTipoViviendaChange}
      />
    </div>
  )
}

export default MortgageCalculator
