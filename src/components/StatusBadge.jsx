import React from 'react';
import {
  CheckCircle,
  Clock,
  WarningCircle,
  Circle,
  ShieldWarning,
  ArrowClockwise,
  HourglassHigh
} from '@phosphor-icons/react';
import './StatusBadge.css';

export const StatusBadge = ({ status, className = '' }) => {
  const normalized = (status || 'Pending').trim();

  let badgeType = 'pending';
  let Icon = Clock;
  let label = normalized.toUpperCase();

  switch (normalized.toLowerCase()) {
    case 'active':
      badgeType = 'active';
      Icon = Circle;
      break;
    case 'in progress':
      badgeType = 'in-progress';
      Icon = HourglassHigh;
      break;
    case 'overdue':
      badgeType = 'overdue';
      Icon = WarningCircle;
      break;
    case 'high risk':
      badgeType = 'high-risk';
      Icon = ShieldWarning;
      break;
    case 'critical':
      badgeType = 'critical';
      Icon = WarningCircle;
      break;
    case 'reopened':
      badgeType = 'reopened';
      Icon = ArrowClockwise;
      break;
    case 'resolved':
      badgeType = 'resolved';
      Icon = CheckCircle;
      break;
    case 'solved':
    case 'verified':
      badgeType = 'verified';
      Icon = CheckCircle;
      label = 'VERIFIED';
      break;
    case 'pending':
    default:
      badgeType = 'pending';
      Icon = Clock;
      break;
  }

  return (
    <span className={`civic-status-badge status-${badgeType} ${className}`}>
      <Icon size={12} weight="fill" className="status-badge-icon" />
      <span>{label}</span>
    </span>
  );
};

export default StatusBadge;
