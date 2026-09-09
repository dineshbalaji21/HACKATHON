import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMockData } from '../../contexts/MockDataContext';
import { Card } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { RiskScore } from '../../components/RiskScore';
import { MagnifyingGlass, WarningCircle, Funnel } from '@phosphor-icons/react';

export default function OfficerCases() {
  const navigate = useNavigate();
  const location = useLocation();
  const { complaints, currentUser } = useMockData();
  
  const [activeTab, setActiveTab] = useState(location.state?.defaultFilter || 'All');
  const [searchQuery, setSearchQuery] = useState('');

  const officerCases = complaints.filter(c => c.assignedOfficerId === currentUser.id && !c.isParent);
  const tabs = ['All', 'Pending', 'In Progress', 'Overdue', 'Critical'];

  const filtered = officerCases.filter(c => {
    let tabMatch = false;
    if (activeTab === 'All') tabMatch = true;
    else if (activeTab === 'Critical') tabMatch = c.riskScore >= 80;
    else tabMatch = c.status === activeTab;

    const searchMatch = c.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        c.issue?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        c.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    return tabMatch && searchMatch;
  });

  return (
    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header className="mb-6 border-b border-gray-100 border-opacity-10 pb-4">
        <h1 className="m-0 mb-1 text-2xl text-primary uppercase tracking-widest">ASSIGNED QUEUE</h1>
        <p className="text-secondary text-sm m-0">Manage operational deployment and SLA tracking.</p>
      </header>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <input 
            type="text" 
            placeholder="Search payload ID or coordinates..." 
            className="w-full pl-10 pr-4 rounded-lg border border-teal-500 border-opacity-20 bg-bg-surface text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none transition-colors text-sm"
            style={{ height: '44px' }}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <MagnifyingGlass size={18} className="absolute left-3.5 top-3 text-secondary opacity-70" />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-4" style={{ scrollbarWidth: 'none' }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`filter-chip ${activeTab === tab ? 'active' : ''}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {filtered.length === 0 ? (
          <Card className="text-center py-10 text-secondary bg-surface-hover">
            <Funnel size={48} className="mx-auto mb-4 opacity-20" />
            <p className="tracking-widest uppercase font-bold text-sm m-0">NO PAYLOADS LOCATED</p>
          </Card>
        ) : (
          filtered.map(c => (
            <Card key={c.id} onClick={() => navigate(`/officer/cases/${c.id}`)} className="flex justify-between items-center hover:border-primary cursor-pointer border-l-4 bg-surface-hover border-opacity-50 transition-colors" style={{ borderLeftColor: c.riskScore >= 80 ? 'var(--danger)' : 'var(--warning)' }}>
              <div style={{ flex: 1 }}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-bg-main text-secondary px-2 py-0.5 rounded text-[10px] font-mono border border-gray-100 border-opacity-10">{c.id}</span>
                  <StatusBadge status={c.status} />
                  {c.status === 'Overdue' && <span className="text-danger font-bold text-[10px] uppercase tracking-widest bg-danger-bg bg-opacity-20 border border-danger px-2 py-0.5 rounded animate-pulse"><WarningCircle size={12} className="inline mr-1"/>SLA Breached</span>}
                </div>
                <h4 className="text-sm font-bold text-white m-0 mb-1">{c.title || c.issue}</h4>
                <div className="flex gap-4 text-[10px] font-mono text-secondary mt-2 opacity-80 uppercase tracking-widest">
                  <span>Coordinates: {c.location}</span>
                </div>
              </div>
              <div className="pl-6 border-l border-gray-100 border-opacity-10 flex flex-col items-center gap-2">
                <RiskScore score={c.riskScore} complaint={c} />
                {c.reopenCount > 0 && <span className="text-danger font-bold text-[9px] uppercase tracking-widest mt-1">Reopened x{c.reopenCount}</span>}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
