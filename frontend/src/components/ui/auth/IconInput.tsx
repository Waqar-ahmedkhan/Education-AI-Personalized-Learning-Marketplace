import { forwardRef } from 'react'
import ErrorMessage from './Error'

interface Props {
  id: string
  name: string
  type: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder: string
  label: string
  icon: React.ReactNode
  error?: string
  disabled?: boolean
  rightElement?: React.ReactNode
}

const IconInput = forwardRef<HTMLInputElement | null, Props>(({ id, name, type, value, onChange, placeholder, label, icon, error, disabled, rightElement }, ref) => {
  const isDark = document.documentElement.classList.contains('dark')
  return (
    <div>
      <label htmlFor={id} className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          className={`w-full pl-10 pr-10 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm ${
            error
              ? 'border-red-400 bg-red-50/50 dark:bg-red-900/20 dark:border-red-500'
              : isDark
                ? 'border-gray-600 bg-gray-700 text-white'
                : 'border-gray-300 bg-white'
          }`}
          placeholder={placeholder}
          disabled={disabled}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${error ? 'text-red-500' : 'text-gray-400'}`}>
          {icon}
        </div>
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
      {error && <ErrorMessage id={`${id}-error}`} message={error} />}
    </div>
  )
})

IconInput.displayName = 'IconInput'

export default IconInput