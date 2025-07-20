import React from "react"

interface Option {
  value: string
  label: string
}

interface SelectProps {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  options: Option[]
  placeholder?: string
  className?: string
  readOnly?: boolean
}

const Select: React.FC<SelectProps> = ({
  label,
  name,
  value,
  onChange,
  options,
  placeholder = "Selecciona",
  className,
  readOnly,
}) => (
  <div>
    <label className='block text-sm font-medium mb-1' htmlFor={name}>
      {label}
    </label>
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className={className}
      disabled={readOnly}
    >
      <option value=''>{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
)

export default Select
