import React from "react"

interface InputProps {
  label: React.ReactNode
  name: string
  value: string | number
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
  min?: number
  max?: number
  step?: number
  placeholder?: string
  readOnly?: boolean
  className?: string
  labelIcon?: React.ReactNode
  showEuroSymbol?: boolean
}

const Input: React.FC<InputProps> = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  min,
  max,
  step,
  placeholder,
  readOnly,
  className,
  labelIcon,
  showEuroSymbol = false,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (type === "number") {
      const inputValue = e.target.value

      // Sanear valores negativos (p. ej. "-5" pegado con el menú contextual)
      // reenviando el MISMO evento con el valor mutado: e.target sigue siendo
      // el elemento real, así el input controlado no se desincroniza del
      // estado (una copia via spread perdería target.name/value)
      if (inputValue.startsWith("-")) {
        e.target.value = inputValue.replace("-", "")
        onChange(e)
        return
      }

      const numValue = Number(inputValue)
      if (!isNaN(numValue) && numValue < 0) {
        e.target.value = "0"
        onChange(e)
        return
      }
    }

    onChange(e)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (type === "number") {
      // Bloquear la tecla del guión/menos
      if (e.key === "-" || e.key === "Minus") {
        e.preventDefault()
      }
    }
  }

  return (
    <div>
      <label className='label-pl' htmlFor={name}>
        {label}
        {labelIcon && <span className='ml-1'>{labelIcon}</span>}
      </label>
      <div className={showEuroSymbol ? "relative" : ""}>
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          readOnly={readOnly}
          className={`input-pl ${showEuroSymbol ? "pr-8" : ""} ${className ?? ""}`.trim()}
          style={{
            WebkitAppearance: "none",
            MozAppearance: "textfield",
          }}
        />
        {showEuroSymbol && (
          <span className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none'>
            €
          </span>
        )}
      </div>
    </div>
  )
}

export default Input
