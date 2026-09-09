import React from 'react';
import RiskTooltip from './RiskTooltip';

export const RiskScore = ({ score, complaint }) => {
  const getRiskLevel = (s) => {
    if (s >= 80) return { label: 'CRITICAL', color: 'var(--critical, #FF6B6B)' };
    if (s >= 50) return { label: 'HIGH RISK', color: 'var(--secondary, #F2B84B)' };
    if (s >= 30) return { label: 'MEDIUM', color: 'var(--primary, #35D6C3)' };
    return { label: 'LOW', color: 'var(--success, #5BD58A)' };
  };

  const risk = getRiskLevel(score);
  
  // Radial SVG math
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const complaintData = complaint || { riskScore: score };

  return (
    <RiskTooltip complaint={complaintData}>
      <div className="flex flex-col items-center cursor-help">
        <div className="relative flex items-center justify-center mb-1" style={{ width: '50px', height: '50px' }}>
          <svg className="transform -rotate-90 w-full h-full">
            <circle cx="25" cy="25" r="20" stroke="rgba(145, 184, 180, 0.2)" strokeWidth="4" fill="transparent" />
            <circle 
              cx="25" cy="25" r="20" 
              stroke={risk.color} 
              strokeWidth="4" 
              fill="transparent" 
              strokeDasharray={circumference} 
              strokeDashoffset={strokeDashoffset} 
              style={{ transition: 'stroke-dashoffset 0.5s ease-in-out', strokeLinecap: 'round' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center font-bold text-sm" style={{ color: risk.color }}>
            {score}
          </div>
        </div>
        <span className="text-[10px] font-bold tracking-wider" style={{ color: risk.color }}>{risk.label}</span>
      </div>
    </RiskTooltip>
  );
};

