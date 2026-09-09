import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMockData } from '../../contexts/MockDataContext';
import { Card } from '../../components/Card';
import { WarningCircle, FolderOpen, TrendUp } from '@phosphor-icons/react';

export default function CollectorDashboard() {
  const navigate = useNavigate();
  const { complaints, govOrders } = useMockData();
  
  const topLevelCases = complaints.filter(c => !c.parentId);
  
  const stats = {
    total: topLevelCases.length,
    active: topLevelCases.filter(c => c.status !== 'Resolved' && c.status !== 'Solved').length,
    resolved: topLevelCases.filter(c => c.status === 'Resolved' || c.status === 'Solved').length,
    highRisk: topLevelCases.filter(c => c.riskScore >= 80).length,
    critical: topLevelCases.filter(c => c.riskScore >= 95).length,
    overdue: topLevelCases.filter(c => c.status === 'Overdue').length,
  };

  const departments = ['Municipality', 'Sanitation', 'Water Supply', 'Electrical', 'Roads & Highways'];
  
  const deptStats = departments.map(dept => {
    const dCases = complaints.filter(c => c.department === dept && !c.isParent);
    const resolved = dCases.filter(c => c.status === 'Solved' || c.status === 'Resolved').length;
    const rate = dCases.length > 0 ? Math.round((resolved / dCases.length) * 100) : 0;
    const active = dCases.filter(c => c.status === 'In Progress' || c.status === 'Pending').length;
    const highRisk = dCases.filter(c => c.riskScore >= 80).length;
    
    return { name: dept, total: dCases.length, rate, active, highRisk };
  }).sort((a, b) => b.highRisk - a.highRisk); // sort by most high risk

  return (
    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Hero Command Center */}
      <section className="mb-8 border-b border-gray-100 border-opacity-10 pb-6">
        <h1 className="text-3xl mb-1 text-primary">DISTRICT COMMAND CENTER</h1>
        <p className="text-secondary mb-6 text-sm">Real-time macro-level governance monitoring and crisis management.</p>
        
        <div className="grid grid-cols-4 gap-6">
          <Card className="flex flex-col justify-center bg-surface-hover border-opacity-30 border-primary cursor-pointer hover:border-primary">
            <h3 className="text-xs text-secondary uppercase tracking-widest mb-2">Total Cases</h3>
            <div className="text-4xl font-bold text-primary mb-1">{stats.total}</div>
            <div className="text-xs text-primary flex items-center gap-1"><TrendUp size={14} /> District-wide total</div>
          </Card>
          <Card className="flex flex-col justify-center bg-surface-hover cursor-pointer hover:border-primary">
            <h3 className="text-xs text-secondary uppercase tracking-widest mb-2">Active Workload</h3>
            <div className="text-4xl font-bold text-primary mb-1">{stats.active}</div>
            <div className="text-xs text-primary flex items-center gap-1">Across all departments</div>
          </Card>
          <Card className="flex flex-col justify-center bg-surface-hover cursor-pointer hover:border-warning">
            <h3 className="text-xs text-secondary uppercase tracking-widest mb-2">SLA Breaches</h3>
            <div className="text-4xl font-bold text-warning mb-1">{stats.overdue}</div>
            <div className="text-xs text-warning flex items-center gap-1"><WarningCircle size={14} /> Require attention</div>
          </Card>
          <Card className="flex flex-col justify-center border-danger bg-danger-bg bg-opacity-10 cursor-pointer hover:bg-opacity-20">
            <h3 className="text-xs text-danger uppercase tracking-widest mb-2">Critical Risk</h3>
            <div className="text-4xl font-bold text-danger mb-1">{stats.critical}</div>
            <div className="text-xs text-danger font-bold uppercase animate-pulse">Escalations active</div>
          </Card>
        </div>
      </section>

      <div className="grid grid-cols-3 gap-6">
        <section className="col-span-2">
          <h2 className="mb-4 text-xl text-secondary">DEPARTMENT COMPLIANCE INDEX</h2>
          <Card style={{ padding: 0, overflow: 'hidden' }} className="border-opacity-30">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead className="bg-surface-hover text-secondary border-b border-gray-100 border-opacity-10">
                <tr>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider">Department</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-center">Active Cases</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-center">Resolution Rate</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-center text-danger">High Risk</th>
                </tr>
              </thead>
              <tbody>
                {deptStats.map(dept => (
                  <tr key={dept.name} style={{ borderBottom: '1px solid rgba(145, 184, 180, 0.1)' }} className="hover:bg-surface-hover transition-colors">
                    <td className="p-4 font-semibold text-primary">{dept.name}</td>
                    <td className="p-4 text-center font-mono">{dept.active}</td>
                    <td className="p-4 text-center">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="w-16 bg-gray-800 rounded-full h-2">
                          <div className={`h-2 rounded-full ${dept.rate < 50 ? 'bg-danger shadow-[var(--glow-critical)]' : dept.rate < 80 ? 'bg-warning' : 'bg-success'}`} style={{ width: `${dept.rate}%` }}></div>
                        </div>
                        <span className="text-xs font-mono font-bold w-8">{dept.rate}%</span>
                      </div>
                    </td>
                    <td className={`p-4 text-center font-mono ${dept.highRisk > 0 ? 'text-danger font-bold' : 'text-secondary opacity-50'}`}>{dept.highRisk}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </section>

        <section>
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-xl text-secondary m-0">ACTIVE GO DIRECTIVES</h2>
          </div>
          <div className="flex flex-col gap-4">
            {govOrders.length === 0 ? (
              <Card className="text-center py-8 text-secondary bg-surface-hover border-opacity-30">
                <FolderOpen size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm uppercase tracking-widest font-bold">No Active Directives</p>
                <p className="text-xs mt-1 opacity-60">Government orders will appear here when issued.</p>
              </Card>
            ) : (
              govOrders.map(order => (
                <Card key={order.id} className="border-l-4 cursor-pointer hover:bg-surface-hover hover:border-primary transition-colors bg-surface-hover border-opacity-50" style={{ borderLeftColor: order.compliance === 100 ? 'var(--success)' : 'var(--primary)' }} onClick={() => navigate(`/collector/orders/${order.id}`)}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="m-0 text-sm font-mono text-primary">{order.id}</h3>
                    <span className={`text-xs font-bold font-mono ${order.compliance === 100 ? 'text-success' : 'text-primary'}`}>{order.compliance || 0}%</span>
                  </div>
                  <p className="font-semibold text-sm m-0 mb-3 truncate">{order.title}</p>
                  <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                    <div className={`h-1.5 rounded-full ${order.compliance === 100 ? 'bg-success' : 'bg-primary'}`} style={{ width: `${order.compliance || 0}%`, boxShadow: order.compliance === 100 ? 'none' : 'var(--glow-primary)' }}></div>
                  </div>
                </Card>
              ))
            )}
            <button
              onClick={() => navigate('/collector/orders')}
              className="w-full p-4 border border-dashed border-primary border-opacity-30 rounded-md text-primary font-semibold hover:bg-primary hover:bg-opacity-10 transition-colors flex items-center justify-center gap-2 bg-transparent cursor-pointer uppercase tracking-wider text-xs mt-2"
            >
              <FolderOpen size={16} /> Manage GOs
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
