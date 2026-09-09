import React from 'react';
import './Tooltip.css';

export default function Tooltip({ children, content, position = 'top', className = '' }) {
  if (!content) return children;

  return (
    <span className={`civic-tooltip-wrapper ${className}`}>
      {children}
      <span className={`civic-tooltip-content ${position}`} role="tooltip">
        {content}
      </span>
    </span>
  );
}
