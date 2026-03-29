import React from 'react'
import { clsx } from 'clsx'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', className, children, ...props }) => {
  return (
    <button
      className={clsx(
        'px-4 py-2 rounded-lg font-medium transition-colors',
        variant === 'primary' && 'bg-wine-700 text-white hover:bg-wine-800',
        variant === 'secondary' && 'bg-bodega-200 text-bodega-800 hover:bg-bodega-300',
        variant === 'outline' && 'border border-wine-700 text-wine-700 hover:bg-wine-50',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
