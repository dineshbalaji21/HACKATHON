import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from '@phosphor-icons/react';
import './ProfileHoverCard.css';

export default function ProfileHoverCard({ user, children, profilePath = '/citizen/profile' }) {
  const navigate = useNavigate();
  if (!user) return children;

  const roleLabel = {
    citizen: 'Citizen Resident',
    officer: 'Field Officer',
    department_head: 'Department Head',
    district_collector: 'District Collector'
  }[user.role] || user.role;

  const subId = user.citizenId || user.officerId || user.headId || user.collectorId || 'Active';

  return (
    <div className="profile-hover-trigger">
      {children}
      <div className="profile-hover-dropdown">
        <div className="profile-hover-header">
          <div className="profile-hover-avatar">
            {user.name?.charAt(0) || 'U'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p className="profile-hover-name">{user.name}</p>
            <p className="profile-hover-role">{roleLabel}</p>
          </div>
        </div>

        <div className="profile-hover-grid">
          <div className="profile-hover-row">
            <span className="profile-hover-label">Identifier</span>
            <span className="profile-hover-val font-mono">{subId}</span>
          </div>
          {user.departmentName && (
            <div className="profile-hover-row">
              <span className="profile-hover-label">Department</span>
              <span className="profile-hover-val">{user.departmentName}</span>
            </div>
          )}
          <div className="profile-hover-row">
            <span className="profile-hover-label">Jurisdiction</span>
            <span className="profile-hover-val">{user.district || 'District'}</span>
          </div>
          <div className="profile-hover-row">
            <span className="profile-hover-label">Account Status</span>
            <span className="profile-hover-val text-success">Verified Active</span>
          </div>
        </div>

        <div
          className="profile-hover-link"
          onClick={() => navigate(profilePath)}
        >
          View Profile <ArrowRight size={13} />
        </div>
      </div>
    </div>
  );
}
