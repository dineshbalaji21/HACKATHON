import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMockData } from '../../contexts/MockDataContext';
import { Card } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { RiskScore } from '../../components/RiskScore';
import { Button } from '../../components/Button';
import { TrendUp, WarningCircle, CheckCircle } from '@phosphor-icons/react';

export default function OfficerDashboard() {
  const navigate = useNavigate();
  const { complaints, currentUser } = useMockData();

  const officerCases = complaints.filter(c => c.assignedOfficerId === currentUser.id && !c.isParent);
  
  const stats = {
    assigned: officerCases.length,
    inProgress: officerCases.filter(c => c.status === 'In Progress').length,
    dueToday: officerCases.filter(c => c.expectedResolution === new Date().toISOString().split('T')[0]).length,
    overdue: officerCases.filter(c => c.status === 'Overdue').length,
    critical: officerCases.filter(c => c.riskScore >= 80).length,
    resolved: officerCases.filter(c => c.status === 'Resolved' || c.status === 'Solved').length,
  };

  const resolutionRate = stats.assigned > 0 ? Math.round((stats.resolved / stats.assigned) * 100) : 0;

  const priorityCases = [...officerCases]
    .filter(c => c.status !== 'Resolved' && c.status !== 'Solved')
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 4);

  const goToCases = (filterState) => {
    navigate('/officer/cases', { state: { defaultFilter: filterState } });
  };

  return (
    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Hero Command Center */}
      <section className="mb-8">
        <h1 className="text-3xl mb-1 text-primary">DISTRICT GOVERNANCE OVERVIEW</h1>
        <p className="text-secondary mb-6 text-sm">Real-time view of assigned citizen grievances, government actions, and administrative risk.</p>
        
        <div className="grid grid-cols-4 gap-6">
          <Card className="flex flex-col justify-center bg-surface-hover">
            <h3 className="text-xs text-secondary uppercase tracking-widest mb-2">Resolution Rate</h3>
            <div className="text-4xl font-bold text-success mb-1">{resolutionRate}%</div>
            <div className="text-xs text-success flex items-center gap-1"><TrendUp size={14} /> {stats.assigned > 0 ? `${stats.assigned} total assigned` : 'No cases yet'}</div>
          </Card>
          <Card className="flex flex-col justify-center bg-surface-hover">
            <h3 className="text-xs text-secondary uppercase tracking-widest mb-2">Attention Required</h3>
            <div className="text-4xl font-bold text-warning mb-1">{stats.dueToday + stats.overdue}</div>
            <div className="text-xs text-warning flex items-center gap-1"><WarningCircle size={14} /> {stats.overdue} overdue</div>
          </Card>
          <Card className="flex flex-col justify-center bg-surface-hover">
            <h3 className="text-xs text-secondary uppercase tracking-widest mb-2">Resolved Cases</h3>
            <div className="text-4xl font-bold text-primary mb-1">{stats.resolved}</div>
            <div className="text-xs text-primary flex items-center gap-1"><CheckCircle size={14} /> Completed this period</div>
          </Card>
          <Card className="flex flex-col justify-center border-danger bg-danger-bg bg-opacity-10 cursor-pointer hover:bg-opacity-20" onClick={() => goToCases('Critical')}>
            <h3 className="text-xs text-danger uppercase tracking-widest mb-2">Critical Escalations</h3>
            <div className="text-4xl font-bold text-danger mb-1">{stats.critical}</div>
            <div className="text-xs text-danger font-bold uppercase animate-pulse">Immediate Action Req</div>
          </Card>
        </div>
      </section>

      <div className="grid grid-cols-6 gap-4 mb-10">
        <Card className="text-center bg-surface-hover cursor-pointer hover:border-primary" onClick={() => goToCases('All')}>
          <div className="text-3xl font-bold text-primary">{stats.assigned}</div>
          <div className="text-xs text-secondary uppercase font-bold mt-2 tracking-wide">Total</div>
        </Card>
        <Card className="text-center bg-surface-hover cursor-pointer hover:border-primary" onClick={() => goToCases('In Progress')}>
          <div className="text-3xl font-bold text-primary">{stats.inProgress}</div>
          <div className="text-xs text-secondary uppercase font-bold mt-2 tracking-wide">Active</div>
        </Card>
      </div>

      <section>
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-xl text-secondary">PRIORITY QUEUE</h2>
          <Button variant="ghost" size="sm" onClick={() => goToCases('All')}>View All →</Button>
        </div>
        
        <div className="flex flex-col gap-3">
          {priorityCases.length === 0 ? (
            <Card className="text-center py-8 text-secondary">
              No pending cases in the priority queue!
            </Card>
          ) : (
            priorityCases.map(c => (
              <Card key={c.id} className="flex justify-between items-center hover:border-primary cursor-pointer border-l-4" style={{ borderLeftColor: c.riskScore >= 80 ? 'var(--danger)' : 'var(--warning)' }} onClick={() => navigate(`/officer/cases/${c.id}`)}>
                <div style={{ flex: 1 }}>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="m-0 text-base">{c.id}</h3>
                    <StatusBadge status={c.status} />
                    {c.status === 'Overdue' && <span className="text-danger font-bold text-xs uppercase bg-danger-bg px-2 py-0.5 rounded">Overdue</span>}
                  </div>
                  <p className="font-medium text-sm text-primary mb-1">{c.title || c.issue}</p>
                  <p className="text-secondary text-xs">{c.location}</p>
                </div>
                
                <div className="flex items-center gap-6">
                  <RiskScore score={c.riskScore} />
                  <Button size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/officer/cases/${c.id}`); }}>Action</Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
