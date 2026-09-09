import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMockData } from '../../contexts/MockDataContext';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { User, WarningCircle } from '@phosphor-icons/react';

export default function DeptOfficers() {
  const navigate = useNavigate();
  const { users, complaints, currentUser } = useMockData();

  const deptName = currentUser.departmentName || currentUser.department || '';
  const deptOfficers = users.filter(u => u.role === 'officer' && (u.departmentName || u.department) === deptName);
  const deptCases = complaints.filter(c => c.department === deptName && !c.isParent);

  const [messageOpen, setMessageOpen] = useState(null);
  const [messageText, setMessageText] = useState('');

  const officers = deptOfficers.map(off => {
    const assigned = deptCases.filter(c => c.assignedOfficerId === off.id);
    const pending = assigned.filter(c => c.status === 'In Progress' || c.status === 'Pending').length;
    const overdue = assigned.filter(c => c.status === 'Overdue').length;
    const risk = assigned.filter(c => c.riskScore >= 80).length;
    const reopened = assigned.filter(c => c.status === 'Reopened').length;
    
    let status = 'Optimal';
    if (overdue > 2 || reopened > 1) status = 'Critical';
    else if (overdue > 0 || risk > 0) status = 'At Risk';
    else if (pending > 20) status = 'Warning';

    return { ...off, pending, overdue, risk, reopened, status };
  });

  const handleSendMessage = (_officerId) => {
    alert(`Comms link established. Message dispatched to Field Officer.`);
    setMessageOpen(null);
    setMessageText('');
  };

  return (
    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header className="mb-6 border-b border-gray-100 border-opacity-10 pb-4">
        <h1 className="m-0 mb-1 text-2xl text-primary uppercase tracking-widest">OFFICER FLEET MONITORING</h1>
        <p className="text-secondary text-sm m-0">Live tracking of active field personnel and workload anomalies.</p>
      </header>

      <div className="grid grid-cols-3 gap-6">
        {officers.map(officer => (
          <Card key={officer.id} className={`bg-surface-hover border-opacity-30 ${officer.status === 'Critical' ? 'border-danger shadow-[var(--glow-critical)]' : officer.status === 'At Risk' ? 'border-warning' : 'border-primary'}`}>
            <div className="flex items-center gap-3 mb-4 border-b border-gray-100 border-opacity-10 pb-4">
              <div className="w-12 h-12 rounded bg-bg-main border border-gray-100 border-opacity-10 text-primary flex items-center justify-center relative">
                <User size={24} />
                {(officer.status === 'Critical' || officer.status === 'At Risk') && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-danger border border-bg-main animate-pulse"></span>
                )}
              </div>
              <div>
                <h3 className="m-0 text-lg text-white font-mono">{officer.name}</h3>
                <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${officer.status === 'Critical' ? 'text-danger' : officer.status === 'At Risk' ? 'text-warning' : 'text-success'}`}>{officer.status}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="bg-bg-main p-2 rounded border border-gray-100 border-opacity-10">
                <span className="text-[9px] uppercase tracking-widest text-secondary block mb-1 font-bold">Active Load</span> 
                <span className="font-mono text-white text-base">{officer.pending}</span>
              </div>
              <div className={`bg-bg-main p-2 rounded border border-gray-100 border-opacity-10 ${officer.overdue > 0 ? 'border-danger border-opacity-30' : ''}`}>
                <span className="text-[9px] uppercase tracking-widest text-secondary block mb-1 font-bold">SLA Breaches</span> 
                <span className={`font-mono text-base ${officer.overdue > 0 ? 'text-danger font-bold' : 'text-white'}`}>{officer.overdue}</span>
              </div>
              <div className={`bg-bg-main p-2 rounded border border-gray-100 border-opacity-10 ${officer.risk > 0 ? 'border-danger border-opacity-30' : ''}`}>
                <span className="text-[9px] uppercase tracking-widest text-secondary block mb-1 font-bold">High Risk</span> 
                <span className={`font-mono text-base ${officer.risk > 0 ? 'text-danger font-bold' : 'text-white'}`}>{officer.risk}</span>
              </div>
              <div className={`bg-bg-main p-2 rounded border border-gray-100 border-opacity-10 ${officer.reopened > 0 ? 'border-warning border-opacity-30' : ''}`}>
                <span className="text-[9px] uppercase tracking-widest text-secondary block mb-1 font-bold">Rejections</span> 
                <span className={`font-mono text-base ${officer.reopened > 0 ? 'text-warning font-bold' : 'text-white'}`}>{officer.reopened}</span>
              </div>
            </div>

            {(officer.status === 'Critical' || officer.status === 'At Risk') && (
              <div className="bg-danger-bg bg-opacity-20 text-danger text-[10px] p-2 rounded mb-4 flex gap-1 items-center font-bold uppercase tracking-widest border border-danger border-opacity-30">
                <WarningCircle size={14} weight="fill" className="animate-pulse" /> Intervention required
              </div>
            )}

            {messageOpen === officer.id ? (
              <div className="mt-4 pt-4 border-t border-gray-100 border-opacity-10 bg-bg-main p-3 rounded">
                <input 
                  type="text"
                  placeholder="Transmit to node..."
                  className="w-full p-2 rounded text-xs font-mono bg-surface-hover border-primary border-opacity-30 mb-2 focus:bg-bg-main"
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" className="text-[10px] uppercase font-bold tracking-widest" onClick={() => setMessageOpen(null)}>Abort</Button>
                  <Button size="sm" fullWidth className="bg-primary bg-opacity-20 text-primary border-primary text-[10px] uppercase font-bold tracking-widest" onClick={() => handleSendMessage(officer.id)}>Transmit</Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3 mt-auto">
                <Button size="sm" variant="secondary" className="flex-1 text-[10px] uppercase font-bold tracking-widest" onClick={() => navigate('/department/cases', { state: { defaultFilter: 'All' } })}>Queue</Button>
                <Button size="sm" className="flex-1 bg-primary text-bg-main font-bold tracking-widest uppercase text-[10px]" onClick={() => setMessageOpen(officer.id)}>Comm Link</Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
