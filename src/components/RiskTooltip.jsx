import React from 'react';
import './RiskScore.css';

export default function RiskTooltip({ complaint, children }) {
  if (!complaint) return children;

  const score = complaint.riskScore || 35;
  const factors = complaint.riskFactors && complaint.riskFactors.length > 0
    ? complaint.riskFactors
    : [
        complaint.priority === 'Critical' ? { factor: 'Critical Priority Tier', score: 40 }
          : complaint.priority === 'High' ? { factor: 'High Priority Grievance', score: 20 }
          : { factor: 'Standard Municipal Priority', score: 10 },
        complaint.status === 'Overdue' ? { factor: 'SLA Deadline Exceeded', score: 25 } : null,
        complaint.reopenCount > 0 ? { factor: `Citizen Reopened (${complaint.reopenCount}x)`, score: 20 } : null,
        { factor: 'Public Infrastructure Impact', score: 15 }
      ].filter(Boolean);

  const levelLabel = score >= 75 ? 'CRITICAL RISK'
    : score >= 50 ? 'HIGH RISK'
    : score >= 30 ? 'MEDIUM RISK'
    : 'LOW RISK';

  const levelColor = score >= 75 ? 'var(--critical, #FF6B6B)'
    : score >= 50 ? 'var(--secondary, #F2B84B)'
    : score >= 30 ? 'var(--primary, #35D6C3)'
    : 'var(--success, #5BD58A)';

  return (
    <div className="risk-hover-wrapper">
      {children}
      <div className="risk-hover-panel">
        <div className="risk-hover-head">
          <span className="risk-hover-title" style={{ color: levelColor }}>
            {levelLabel} — {score}/100
          </span>
        </div>
        <div className="risk-hover-factors">
          {factors.map((f, i) => (
            <div key={i} className="risk-factor-row">
              <span className="risk-factor-bullet" style={{ background: levelColor }} />
              <span className="risk-factor-text">{f.factor}</span>
              {f.score > 0 && <span className="risk-factor-score">+{f.score}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
