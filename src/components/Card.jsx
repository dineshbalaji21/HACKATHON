import React from 'react';

export const Card = ({ children, className = '', onClick, style = {} }) => {
  return (
    <div 
      className={`civic-card ${className}`} 
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  );
};
