import React from 'react';
import { CircleNotch } from '@phosphor-icons/react';
import './Button.css';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  loadingText,
  disabled = false,
  className = '',
  icon,
  ...props
}) => {
  const baseClass = 'civic-btn';
  const variantClass = `civic-btn-${variant}`;
  const sizeClass = `civic-btn-${size}`;
  const widthClass = fullWidth ? 'civic-btn-full' : '';
  const loadingClass = loading ? 'civic-btn-loading' : '';

  return (
    <button
      className={`${baseClass} ${variantClass} ${sizeClass} ${widthClass} ${loadingClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <CircleNotch size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} className="civic-btn-spinner" />
          <span>{loadingText || 'Processing...'}</span>
        </>
      ) : (
        <>
          {icon && <span className="civic-btn-icon">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
