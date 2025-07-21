import React, { useState } from "react"
import Modal from "./Modal"
import { COMUNIDADES } from "../../constants/comunidades"
import { calcularITPAvanzado } from "../../utils/calculadora-hipotecaria"

interface ITPCalculatorProps {
  open: boolean
  onClose: () => void
  onResult: (itp: number, tipoAplicado?: number, descripcion?: string) => void
  comunidadSeleccionada?: string
  initialPrecio?: string | number
  initialTipoVivienda?: string
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
}

const ITPCalculator: React.FC<ITPCalculatorProps> = ({
  open,
  onClose,
  onResult,
  comunidadSeleccionada,
  initialPrecio,
  initialTipoVivienda,
}) => {
  const [form, setForm] = useState({
    ...initialForm,
    comunidad: comunidadSeleccionada || "",
    precio: initialPrecio !== undefined ? String(initialPrecio) : "",
    tipoVivienda: initialTipoVivienda || "",
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
      }))
    }
  }, [open, comunidadSeleccionada, initialPrecio, initialTipoVivienda])

  const comunidad = COMUNIDADES.find((c) => c.nombre === form.comunidad)
  const camposDinamicos = {
    ingresos: comunidad?.camposDinamicos?.ingresos ?? false,
    situacionFamiliar: comunidad?.camposDinamicos?.situacionFamiliar ?? false,
    discapacidad: comunidad?.camposDinamicos?.discapacidad ?? false,
    victimas: comunidad?.camposDinamicos?.victimas ?? false,
    zonaDespoblada: comunidad?.camposDinamicos?.zonaDespoblada ?? false,
  }

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
    }
  }

  const handleSubmit = () => {
    setError("")
    const precio = Number(form.precio)
    if (!comunidad || !precio || precio <= 0) {
      setError("Introduce un precio válido y selecciona comunidad.")
      return
    }
    // Usar la función avanzada
    const { itp, tipoAplicado, descripcion } = calcularITPAvanzado({
      precio,
      tipoVivienda: form.tipoVivienda,
      comunidad: form.comunidad,
      edad: Number(form.edad),
      discapacidad: form.discapacidad,
      porcentajeDiscapacidad: Number(form.porcentajeDiscapacidad),
      situacion: form.situacion,
      numHijos: Number(form.numHijos),
      victimaViolencia: form.victimaViolencia,
      victimaTerrorismo: form.victimaTerrorismo,
      zonaDespoblada: form.zonaDespoblada,
      primeraVivienda: form.primeraVivienda,
    })
    onResult(itp, tipoAplicado, descripcion)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className='text-xl font-bold text-blue-900 mb-4'>Calculadora ITP</h2>
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
            Información de la Vivienda
          </legend>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-blue-900 mb-1'>
                Precio de la vivienda (€)
              </label>
              <input
                type='number'
                name='precio'
                value={form.precio}
                onChange={handleInput}
                className='w-full border border-blue-200 rounded px-3 py-2 h-10'
                min={0}
                placeholder='Ej: 250000'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-blue-900 mb-1'>
                Tipo de vivienda
              </label>
              <select
                name='tipoVivienda'
                value={form.tipoVivienda}
                onChange={handleInput}
                className='w-full border border-blue-200 rounded px-3 py-2 h-10'
              >
                <option value=''>Selecciona</option>
                <option value='Obra nueva'>Obra nueva</option>
                <option value='Segunda mano'>Segunda mano</option>
              </select>
            </div>
            <div className='md:col-span-2'>
              <label className='block text-sm font-medium text-blue-900 mb-1'>
                Comunidad Autónoma
              </label>
              <select
                name='comunidad'
                value={form.comunidad}
                onChange={handleInput}
                className='w-full border border-blue-200 rounded px-3 py-2 h-10'
              >
                <option value=''>Selecciona</option>
                {COMUNIDADES.map((c) => (
                  <option key={c.nombre} value={c.nombre}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>
        <fieldset className='border border-blue-100 rounded-lg p-4'>
          <legend className='font-semibold text-blue-900 mb-2'>
            Información del comprador
          </legend>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-blue-900 mb-1'>
                Edad del comprador (años)
              </label>
              <input
                type='number'
                name='edad'
                value={form.edad}
                onChange={handleInput}
                className='w-full border border-blue-200 rounded px-3 py-2 h-10'
                min={0}
                placeholder='Ej: 35'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-blue-900 mb-1'>
                Base imponible IRPF (€)
              </label>
              <input
                type='number'
                name='baseIrpf'
                value={form.baseIrpf}
                onChange={handleInput}
                className='w-full border border-blue-200 rounded px-3 py-2 h-10'
                min={0}
                placeholder='Ej: 32000'
              />
            </div>
            <div className='md:col-span-2'>
              <label className='block text-sm font-medium text-blue-900 mb-1'>
                Situación familiar
              </label>
              <select
                name='situacion'
                value={form.situacion}
                onChange={handleInput}
                className='w-full border border-blue-200 rounded px-3 py-2 h-10'
              >
                <option value=''>Selecciona</option>
                <option value='individual'>Individual</option>
                <option value='familia-numerosa-general'>
                  Familia numerosa general
                </option>
                <option value='familia-numerosa-especial'>
                  Familia numerosa especial
                </option>
                <option value='familia-monoparental'>
                  Familia monoparental
                </option>
              </select>
            </div>
            {/* Número de hijos solo para familias numerosas o monoparentales */}
            {[
              "familia-numerosa-general",
              "familia-numerosa-especial",
              "familia-monoparental",
            ].includes(form.situacion) && (
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-blue-900 mb-1'>
                  Número de hijos
                </label>
                <input
                  type='number'
                  name='numHijos'
                  value={form.numHijos}
                  onChange={handleInput}
                  className='w-full border border-blue-200 rounded px-3 py-2 h-10'
                  min={0}
                  placeholder='Ej: 3'
                />
              </div>
            )}
            {/* Bloque de checkboxes dinámicos solo si hay alguno visible */}
            {(camposDinamicos.discapacidad ||
              camposDinamicos.victimas ||
              camposDinamicos.zonaDespoblada ||
              camposDinamicos.situacionFamiliar) && (
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
                      ¿Tiene discapacidad reconocida?
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
                        placeholder='% de discapacidad'
                      />
                    )}
                  </>
                )}
                {camposDinamicos.victimas && (
                  <label className='flex items-center gap-2'>
                    <input
                      type='checkbox'
                      name='victimaViolencia'
                      checked={form.victimaViolencia}
                      onChange={handleInput}
                    />
                    ¿Es víctima de violencia de género?
                  </label>
                )}
                {camposDinamicos.victimas && (
                  <label className='flex items-center gap-2'>
                    <input
                      type='checkbox'
                      name='victimaTerrorismo'
                      checked={form.victimaTerrorismo}
                      onChange={handleInput}
                    />
                    ¿Es víctima de terrorismo?
                  </label>
                )}
                {camposDinamicos.zonaDespoblada && (
                  <label className='flex items-center gap-2'>
                    <input
                      type='checkbox'
                      name='zonaDespoblada'
                      checked={form.zonaDespoblada}
                      onChange={handleInput}
                    />
                    Vivienda en municipio con riesgo de despoblación
                  </label>
                )}
                {camposDinamicos.situacionFamiliar && (
                  <label className='flex items-center gap-2'>
                    <input
                      type='checkbox'
                      name='primeraVivienda'
                      checked={form.primeraVivienda}
                      onChange={handleInput}
                    />
                    ¿Es su primera vivienda?
                  </label>
                )}
              </div>
            )}
          </div>
        </fieldset>
        <div className='flex justify-end'>
          <button
            type='submit'
            className='bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow'
          >
            Calcular ITP
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default ITPCalculator
