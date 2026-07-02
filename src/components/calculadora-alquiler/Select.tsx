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
  className?: string
  placeholder?: string
}

const Select: React.FC<SelectProps> = ({
  label,
  name,
  value,
  onChange,
  options,
  className = "",
  placeholder,
}) => {
  const { t } = useTranslations()
  const defaultPlaceholder = placeholder || t('mortgage.form.itpModal.selectOption')
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="label-pl">
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={`input-pl cursor-pointer ${className ?? ""}`.trim()}
      >
        <option value="">{defaultPlaceholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default Select 