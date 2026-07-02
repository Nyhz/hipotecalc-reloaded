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
    <div>
      <label htmlFor={name} className="label-pl">
        {label}
      </label>
      <div className="relative">
        {showEuroSymbol && (
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">
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
          className={`input-pl ${showEuroSymbol ? "pl-8" : ""} ${className ?? ""}`.trim()}
          style={showEuroSymbol ? { paddingLeft: "2rem" } : undefined}
        />
      </div>
    </div>
  )
}

export default Input 