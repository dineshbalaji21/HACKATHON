import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMockData } from '../../contexts/MockDataContext';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Warning, TrendUp, WarningCircle, CheckCircle } from '@phosphor-icons/react';

export default function DeptDashboard() {
  const navigate = useNavigate();
  const { complaints, users, currentUser } = useMockData();
  
  const deptCases = complaints.filter(c => c.department === (currentUser.departmentName || currentUser.department) && !c.isParent);
  const deptOfficers = users.filter(u => u.role === 'officer' && (u.departmentName || u.department) === (currentUser.departmentName || currentUser.department));

  const stats = {
    total: deptCases.length,
    pending: deptCases.filter(c => c.status === 'Pending' || c.status === 'In Progress').length,
    overdue: deptCases.filter(c => c.status === 'Overdue').length,
    highRisk: deptCases.filter(c => c.riskScore >= 80).length,
    reopened: deptCases.filter(c => c.status === 'Reopened').length,
    resolved: deptCases.filter(c => c.status === 'Solved').length,
  };
  
  const resolutionRate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;

  // Generate mock officer stats for the dashboard table
  const officerStats = deptOfficers.map(off => {
    const assigned = deptCases.filter(c => c.assignedOfficerId === off.id);
    return {
      id: off.id,
      name: off.name,
      pending: assigned.filter(c => c.status === 'In Progress' || c.status === 'Pending').length,
      overdue: assigned.filter(c => c.status === 'Overdue').length,
      highRisk: assigned.filter(c => c.riskScore >= 80).length,
      reopened: assigned.filter(c => c.status === 'Reopened').length,
    };
  }).sort((a, b) => b.overdue - a.overdue); // Sort by most overdue

  const problematicOfficer = officerStats.find(o => o.overdue > 2 || o.reopened > 1);

  const goToCases = (filterState) => {
    navigate('/department/cases', { state: { defaultFilter: filterState } });
  };

  return (
    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Hero Command Center */}
      <section className="mb-8 border-b border-gray-100 border-opacity-10 pb-6">
        <h1 className="text-3xl mb-1 text-primary">{(currentUser.departmentName || currentUser.department || 'DEPARTMENT').toUpperCase()} COMMAND CENTER</h1>
        <p className="text-secondary mb-6 text-sm">Strategic overview of departmental case resolution and officer performance.</p>
        
        <div className="grid grid-cols-4 gap-6">
          <Card className="flex flex-col justify-center bg-surface-hover border-opacity-30 border-success">
            <h3 className="text-xs text-secondary uppercase tracking-widest mb-2">Resolution Rate</h3>
            <div className="text-4xl font-bold text-success mb-1">{resolutionRate}%</div>
            <div className="text-xs text-success flex items-center gap-1"><TrendUp size={14} /> Peak efficiency</div>
          </Card>
          <Card className="flex flex-col justify-center bg-surface-hover cursor-pointer hover:border-primary" onClick={() => goToCases('Overdue')}>
            <h3 className="text-xs text-secondary uppercase tracking-widest mb-2">SLA Breaches</h3>
            <div className="text-4xl font-bold text-warning mb-1">{stats.overdue}</div>
            <div className="text-xs text-warning flex items-center gap-1"><WarningCircle size={14} /> Attention Required</div>
          </Card>
          <Card className="flex flex-col justify-center bg-surface-hover cursor-pointer hover:border-primary" onClick={() => goToCases('Reopened')}>
            <h3 className="text-xs text-secondary uppercase tracking-widest mb-2">Repeated Failures</h3>
            <div className="text-4xl font-bold text-danger mb-1">{stats.reopened}</div>
            <div className="text-xs text-danger flex items-center gap-1"><WarningCircle size={14} /> Escalation imminent</div>
          </Card>
          <Card className="flex flex-col justify-center border-danger bg-danger-bg bg-opacity-10 cursor-pointer hover:bg-opacity-20" onClick={() => goToCases('High Risk')}>
            <h3 className="text-xs text-danger uppercase tracking-widest mb-2">Critical Risk</h3>
            <div className="text-4xl font-bold text-danger mb-1">{stats.highRisk}</div>
            <div className="text-xs text-danger font-bold uppercase animate-pulse">Immediate Action Req</div>
          </Card>
        </div>
      </section>

      <div className="grid grid-cols-3 gap-6">
        <section className="col-span-2">
          <h2 className="mb-4 text-xl text-secondary">OFFICER FLEET STATUS</h2>
          <Card style={{ padding: 0, overflow: 'hidden' }} className="border-opacity-30">
            {officerStats.length === 0 ? (
              <div className="p-8 text-center text-secondary">No officers found for this department.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead className="bg-surface-hover text-secondary border-b border-gray-100 border-opacity-10">
                  <tr>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider">Officer</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-center">Active Workload</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-center text-warning">Overdue</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-center text-danger">High Risk</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-center text-danger">Reopened</th>
                  </tr>
                </thead>
                <tbody>
                  {officerStats.map(off => (
                    <tr key={off.id} onClick={() => navigate('/department/officers')} style={{ borderBottom: '1px solid rgba(145, 184, 180, 0.1)', cursor: 'pointer' }} className="hover:bg-surface-hover transition-colors">
                      <td className="p-4 font-semibold text-primary">{off.name}</td>
                      <td className="p-4 text-center font-mono">{off.pending}</td>
                      <td className={`p-4 text-center font-mono ${off.overdue > 0 ? 'text-warning font-bold' : 'text-secondary opacity-50'}`}>{off.overdue}</td>
                      <td className={`p-4 text-center font-mono ${off.highRisk > 0 ? 'text-danger font-bold' : 'text-secondary opacity-50'}`}>{off.highRisk}</td>
                      <td className={`p-4 text-center font-mono ${off.reopened > 0 ? 'text-danger font-bold' : 'text-secondary opacity-50'}`}>{off.reopened}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </section>

        <section>
          <h2 className="mb-4 text-xl text-danger flex items-center gap-2">
            <Warning size={24} /> ALERTS
          </h2>
          {problematicOfficer ? (
            <Card className="bg-danger-bg bg-opacity-20 border-danger border-opacity-50 mb-4 backdrop-blur-md">
              <h3 className="text-danger mb-3 flex items-center gap-2 tracking-wide uppercase text-sm font-bold">
                <WarningCircle size={18} weight="fill" className="animate-pulse" /> Intervention Req
              </h3>
              <p className="text-primary font-bold mb-2">{problematicOfficer.name}</p>
              <ul className="pl-4 mb-6 text-sm text-secondary space-y-1">
                <li><strong className="text-warning">{problematicOfficer.overdue}</strong> overdue cases</li>
                <li><strong className="text-danger">{problematicOfficer.highRisk}</strong> high-risk cases</li>
                <li><strong className="text-danger">{problematicOfficer.reopened}</strong> citizen rejections</li>
              </ul>
              <div className="flex flex-col gap-2">
                <Button size="sm" className="bg-danger text-white border-none hover:bg-red-600" onClick={() => navigate('/department/officers')}>Review Workload</Button>
                <Button size="sm" variant="secondary" onClick={() => navigate('/department/cases')}>Reassign Cases</Button>
              </div>
            </Card>
          ) : (
            <Card className="text-center text-secondary py-8 bg-surface-hover border-success border-opacity-30">
              <CheckCircle size={32} className="text-success mx-auto mb-2 opacity-50" />
              <p className="text-sm uppercase tracking-wide">Fleet Optimal</p>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
