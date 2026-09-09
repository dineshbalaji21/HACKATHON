import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMockData } from '../../contexts/MockDataContext';
import StatusBadge from '../../components/StatusBadge';
import RiskTooltip from '../../components/RiskTooltip';
import {
  MagnifyingGlass,
  MapPin,
  Funnel,
  Buildings,
  UserCheck,
  ArrowRight,
  Plus,
  ArrowsClockwise
} from '@phosphor-icons/react';

export default function CitizenCases() {
  const navigate = useNavigate();
  const location = useLocation();
  const { complaints, currentUser } = useMockData();

  const [activeTab, setActiveTab] = useState(
    location.state?.defaultFilter || 'All'
  );
  const [searchQuery, setSearchQuery] = useState(
    location.state?.searchQuery || ''
  );
  const [selectedDept, setSelectedDept] = useState('All');

  // Filter complaints belonging to current citizen
  const myCases = complaints.filter(c => c.citizenId === currentUser?.id && !c.isParent);

  // Department list from current cases
  const departments = ['All', ...new Set(myCases.map(c => c.department).filter(Boolean))];

  // Tab definitions
  const tabs = [
    { label: 'All', count: myCases.length },
    { label: 'Active', count: myCases.filter(c => c.status !== 'Resolved' && c.status !== 'Solved').length },
    { label: 'In Progress', count: myCases.filter(c => c.status === 'In Progress').length },
    { label: 'Resolved', count: myCases.filter(c => c.status === 'Resolved' || c.status === 'Solved').length },
    { label: 'Overdue', count: myCases.filter(c => c.status === 'Overdue').length }
  ];

  // Filter logic
  const filtered = myCases.filter(c => {
    let tabMatch = true;
    if (activeTab === 'Active') {
      tabMatch = c.status !== 'Resolved' && c.status !== 'Solved';
    } else if (activeTab === 'In Progress') {
      tabMatch = c.status === 'In Progress';
    } else if (activeTab === 'Resolved') {
      tabMatch = c.status === 'Resolved' || c.status === 'Solved';
    } else if (activeTab === 'Overdue') {
      tabMatch = c.status === 'Overdue';
    }

    const deptMatch = selectedDept === 'All' || c.department === selectedDept;

    const query = searchQuery.toLowerCase().trim();
    const searchMatch = !query ||
      c.id.toLowerCase().includes(query) ||
      (c.title && c.title.toLowerCase().includes(query)) ||
      (c.issue && c.issue.toLowerCase().includes(query)) ||
      (c.location && c.location.toLowerCase().includes(query)) ||
      (c.department && c.department.toLowerCase().includes(query));

    return tabMatch && deptMatch && searchMatch;
  });

  const renderRiskTag = (c) => {
    const score = c.riskScore || 35;
    let label = 'STANDARD';
    let riskClass = 'risk-low';

    if (score >= 70 || c.priority === 'Critical') {
      label = 'HIGH RISK';
      riskClass = 'risk-critical';
    } else if (score >= 45 || c.priority === 'High') {
      label = 'MODERATE';
      riskClass = 'risk-medium';
    }

    return (
      <RiskTooltip complaint={c}>
        <span className={`citizen-risk-tag ${riskClass} cursor-help`}>
          {label}
        </span>
      </RiskTooltip>
    );
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-12">
      {/* ── Page Header ── */}
      <div className="flex justify-between items-end flex-wrap gap-4 border-b border-gray-100 border-opacity-10 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white m-0 tracking-tight">My Grievance Cases</h2>
          <p className="text-sm text-secondary m-0 mt-1">
            Track operational execution, SLA enforcement, and officer communications across all reported civic issues.
          </p>
        </div>

        <button
          type="button"
          className="civic-btn civic-btn-primary civic-btn-sm"
          onClick={() => navigate('/citizen/report')}
        >
          <Plus size={16} weight="bold" />
          + Report New Issue
        </button>
      </div>

      {/* ── Search & Filter Bar (Perfect 44px Baseline Alignment) ── */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Tab pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-surface bg-opacity-70 rounded-lg border border-gray-100 border-opacity-10">
          {tabs.map(t => (
            <button
              key={t.label}
              type="button"
              onClick={() => setActiveTab(t.label)}
              className={`filter-chip ${activeTab === t.label ? 'active' : ''}`}
            >
              {t.label} ({t.count})
            </button>
          ))}
        </div>

        {/* Right side: Search & Department filter */}
        <div className="flex items-center gap-2.5">
          {/* Department dropdown (44px height) */}
          {departments.length > 2 && (
            <select
              className="px-3 rounded-lg text-xs bg-surface border border-gray-100 border-opacity-20 text-white outline-none focus:border-primary transition-colors cursor-pointer"
              style={{ height: '44px', minWidth: '160px' }}
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
            >
              {departments.map(d => (
                <option key={d} value={d}>
                  {d === 'All' ? 'All Departments' : d}
                </option>
              ))}
            </select>
          )}

          {/* Search box (44px height) */}
          <div className="relative flex-1 md:w-72">
            <MagnifyingGlass size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary opacity-70 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by ID, keyword, location..."
              className="w-full pl-9 pr-8 rounded-lg text-xs bg-surface border border-gray-100 border-opacity-20 text-white outline-none focus:border-primary transition-colors"
              style={{ height: '44px' }}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-secondary hover:text-white bg-transparent border-none cursor-pointer p-1"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Cases List (High Information Density Desktop Cards) ── */}
      {filtered.length === 0 ? (
        <div className="citizen-empty-state-card py-12">
          <Funnel size={36} className="text-secondary opacity-40 mb-3" />
          <h4 className="text-base font-bold text-white m-0">No cases matched your criteria</h4>
          <p className="text-xs text-secondary max-w-sm m-0 mt-1 mb-4">
            Try adjusting your search query, department filter, or active status tab.
          </p>
          <button
            type="button"
            className="civic-btn civic-btn-secondary civic-btn-sm"
            onClick={() => {
              setActiveTab('All');
              setSearchQuery('');
              setSelectedDept('All');
            }}
          >
            <ArrowsClockwise size={14} />
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(c => (
            <div
              key={c.id}
              className="citizen-case-row-card"
              onClick={() => navigate(`/citizen/cases/${c.id}`)}
            >
              {/* Header row */}
              <div className="citizen-case-row-top">
                <div className="citizen-case-id-group">
                  <span className="citizen-case-id-badge">{c.id}</span>
                  {renderRiskTag(c)}
                  {c.reopenCount > 0 && (
                    <span className="text-[10px] font-bold text-danger bg-danger-bg bg-opacity-20 px-2 py-0.5 rounded border border-danger border-opacity-30">
                      REOPENED ×{c.reopenCount}
                    </span>
                  )}
                </div>

                <span className="citizen-view-case-link">
                  Track Resolution
                  <ArrowRight size={14} />
                </span>
              </div>

              {/* Main content row */}
              <div className="citizen-case-row-main">
                <div className="citizen-case-title-area">
                  <h4 className="citizen-case-title">{c.title || c.issue}</h4>
                  <div className="citizen-case-meta-line">
                    <span className="citizen-case-meta-item">
                      <Buildings size={14} className="text-primary opacity-80" />
                      {c.department || 'Municipal Department'}
                    </span>
                    <span className="citizen-case-meta-item">
                      <MapPin size={14} className="text-secondary opacity-80" />
                      {c.location || 'Reported Location'}
                    </span>
                    {c.assignedOfficerName && (
                      <span className="citizen-case-meta-item">
                        <UserCheck size={14} className="text-success opacity-80" />
                        {c.assignedOfficerName}
                      </span>
                    )}
                  </div>
                </div>

                <div className="citizen-case-row-status-block">
                  <StatusBadge status={c.status} />

                  {c.expectedResolution && (
                    <div className="citizen-case-deadline-block">
                      <p className="citizen-deadline-label">SLA Target</p>
                      <p className="citizen-deadline-date">{c.expectedResolution}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
