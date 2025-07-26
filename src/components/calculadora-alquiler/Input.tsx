import React from "react"

interface InputProps {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
  min?: number
  max?: number
  step?: number
  placeholder?: string
  className?: string
  readOnly?: boolean
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
  className = "",
  readOnly = false,
  showEuroSymbol = false,
}) => {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        {showEuroSymbol && (
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            €
          </span>
        )}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          readOnly={readOnly}
          className={`${className} ${showEuroSymbol ? "pl-8" : ""}`}
        />
      </div>
    </div>
  )
}

export default Input 