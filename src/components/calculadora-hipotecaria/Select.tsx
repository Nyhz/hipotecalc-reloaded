import React from "react"
import { useTranslations } from "../../hooks/useTranslations"

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
  placeholder,
  className,
  readOnly,
}) => {
  const { t } = useTranslations()
  const defaultPlaceholder = placeholder || t('mortgage.form.itpModal.selectOption')
  
  return (
  <div>
    <label className='block text-sm font-medium mb-1' htmlFor={name}>
      {label}
    </label>
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className={(className ? className + " " : "") + "py-2 h-10"}
      disabled={readOnly}
    >
      <option value=''>{defaultPlaceholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
  )
}

export default Select
