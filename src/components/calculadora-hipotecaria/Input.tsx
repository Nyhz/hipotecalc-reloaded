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
}) => (
  <div>
    <label
      className='flex text-sm font-medium mb-1 items-center gap-1'
      htmlFor={name}
    >
      {label}
      {labelIcon && <span>{labelIcon}</span>}
    </label>
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
      className={className}
    />
  </div>
)

export default Input
