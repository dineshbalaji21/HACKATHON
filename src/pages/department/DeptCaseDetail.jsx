import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMockData } from '../../contexts/MockDataContext';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { RiskScore } from '../../components/RiskScore';
import { CaretLeft, WarningCircle, UserSwitch, PaperPlaneRight } from '@phosphor-icons/react';

export default function DeptCaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { complaints, updateComplaintStatus, addAuditTrail, currentUser, users, addMessage } = useMockData();
  
  const caseData = complaints.find(c => c.id === id);
  const [showReassign, setShowReassign] = useState(false);
  const [selectedOfficerId, setSelectedOfficerId] = useState('');
  const [newMessage, setNewMessage] = useState('');

  if (!caseData) return <div className="p-4 text-center">Case not found</div>;

  const deptName = currentUser.departmentName || currentUser.department || '';
  const deptOfficers = users.filter(u => u.role === 'officer' && (u.departmentName || u.department) === deptName);

  const handleReassign = () => {
    if (!selectedOfficerId) return;
    const newOfficer = deptOfficers.find(o => o.id === selectedOfficerId);
    
    updateComplaintStatus(id, caseData.status, { 
      assignedOfficerId: newOfficer.id, 
      assignedOfficerName: newOfficer.name 
    });
    
    addAuditTrail(id, `Reassigned to ${newOfficer.name}`, currentUser.name, caseData.status);
    setShowReassign(false);
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      addMessage(id, currentUser.id, currentUser.name, newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-1 text-primary bg-transparent border-none font-bold text-xs uppercase tracking-wider mb-6 cursor-pointer hover:text-white transition-colors"
        style={{ padding: 0 }}
      >
        <CaretLeft size={16} /> BACK TO DEPARTMENT QUEUE
      </button>

      <div className="flex justify-between items-start mb-6 border-b border-gray-100 border-opacity-10 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="m-0 text-3xl text-primary font-mono">{caseData.id}</h1>
            <StatusBadge status={caseData.status} />
          </div>
          <h2 className="text-lg m-0 font-bold uppercase tracking-widest text-white opacity-90">{caseData.title || caseData.issue}</h2>
        </div>
        <div className="flex flex-col items-end gap-2 bg-bg-main p-3 rounded-lg border border-primary border-opacity-20 shadow-[var(--glow-primary)]">
          <RiskScore score={caseData.riskScore} />
          {caseData.reopenCount > 0 && <span className="text-danger font-bold text-[10px] uppercase tracking-widest mt-1 bg-danger-bg bg-opacity-20 px-2 py-0.5 rounded border border-danger">Citizen Rejections: {caseData.reopenCount}</span>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="bg-surface-hover border-opacity-30">
          <p className="text-[10px] text-secondary uppercase font-bold tracking-widest mb-2">Assigned Officer</p>
          <div className="flex justify-between items-center">
            <p className="font-mono text-white text-base">{caseData.assignedOfficerName || 'UNASSIGNED'}</p>
            <Button size="sm" variant="ghost" className="border border-primary border-opacity-30 text-primary uppercase text-[10px] font-bold" onClick={() => setShowReassign(!showReassign)}>
              <UserSwitch size={14} /> Reassign
            </Button>
          </div>
          {showReassign && (
            <div className="mt-4 flex gap-2">
              <select 
                className="flex-1 p-2 text-xs rounded border border-primary border-opacity-30 bg-bg-main text-primary font-mono"
                value={selectedOfficerId}
                onChange={e => setSelectedOfficerId(e.target.value)}
              >
                <option value="">Select Officer Node...</option>
                {deptOfficers.filter(o => o.id !== caseData.assignedOfficerId).map(o => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
              <Button size="sm" onClick={handleReassign} className="bg-primary text-bg-main font-bold">CONFIRM</Button>
            </div>
          )}
        </Card>
        <Card className="bg-surface-hover border-opacity-30">
          <p className="text-[10px] text-secondary uppercase font-bold tracking-widest mb-2">Target SLA Deadline</p>
          <p className={`font-mono text-lg font-bold ${caseData.status === 'Overdue' ? 'text-danger' : 'text-white'}`}>{caseData.expectedResolution}</p>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <section className="col-span-2">
          {caseData.riskScore >= 50 && (
            <Card className="mb-6 bg-danger-bg bg-opacity-10 border-danger shadow-[var(--glow-critical)]">
              <h3 className="text-[10px] uppercase tracking-widest text-danger mb-3 flex items-center gap-2 font-bold">
                <WarningCircle size={16} weight="fill" className="animate-pulse" /> Threat Analysis Vector
              </h3>
              <ul className="text-xs m-0 pl-4 space-y-2 opacity-90 font-mono">
                {caseData.riskFactors?.map((factor, i) => (
                  <li key={i} className="text-white">
                    {factor.factor} <span className="font-bold text-danger">+{factor.score} pts</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card className="bg-surface-hover border-opacity-30">
            <h3 className="text-[10px] uppercase tracking-widest text-secondary mb-3 font-bold">Grievance Payload</h3>
            <p className="text-sm bg-bg-main p-4 rounded font-mono leading-relaxed opacity-80 border border-gray-100 border-opacity-10">{caseData.description || 'No description provided.'}</p>
            <p className="text-[10px] uppercase tracking-widest text-secondary mt-4 mb-2 font-bold">Target Location</p>
            <p className="text-sm bg-bg-main p-3 rounded font-mono border border-gray-100 border-opacity-10">{caseData.location}</p>
          </Card>
        </section>

        <section>
          <Card className="h-full flex flex-col bg-surface-hover border-opacity-30" style={{ padding: 0 }}>
            <h3 className="text-[10px] uppercase tracking-widest text-secondary p-4 m-0 border-b border-gray-100 border-opacity-10 font-bold">Department Comms</h3>
            
            <div className="flex-1 p-4 flex flex-col gap-3 overflow-y-auto" style={{ maxHeight: '300px' }}>
              {caseData.messages?.length === 0 ? (
                <p className="text-xs text-secondary text-center italic py-4 font-mono">No comms established.</p>
              ) : (
                caseData.messages?.map(msg => (
                  <div key={msg.id} className={`flex gap-2 ${msg.senderId === currentUser.id ? 'flex-row-reverse' : ''}`}>
                    <div className="w-6 h-6 rounded bg-gray-700 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white border border-gray-600">
                      {msg.senderName[0]}
                    </div>
                    <div className={`p-2 rounded text-xs max-w-[85%] font-mono ${msg.senderId === currentUser.id ? 'bg-primary bg-opacity-20 text-white border border-primary border-opacity-30' : 'bg-bg-main border border-gray-100 border-opacity-10'}`}>
                      <p className="m-0 font-bold text-[9px] uppercase tracking-widest text-primary opacity-80 mb-1">{msg.senderName}</p>
                      <p className="m-0">{msg.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-3 border-t border-gray-100 border-opacity-10 flex gap-2 bg-bg-main">
              <input 
                type="text"
                placeholder="Transmit message..."
                className="flex-1 p-2 rounded text-xs font-mono border-opacity-30 focus:bg-surface-hover"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              />
              <Button onClick={handleSendMessage} style={{ padding: '0.5rem' }} className="bg-primary bg-opacity-20 border-primary text-primary">
                <PaperPlaneRight size={16} weight="fill" />
              </Button>
            </div>
          </Card>
        </section>
      </div>

      <Card className="bg-surface-hover border-opacity-30">
        <h3 className="text-[10px] uppercase tracking-widest text-secondary mb-4 font-bold">Execution Audit Trail</h3>
        <ul className="m-0 p-0" style={{ listStyle: 'none' }}>
          {caseData.auditTrail?.map((event, idx) => (
            <li key={idx} className="py-3 border-b border-gray-100 border-opacity-10 text-sm flex justify-between items-center last:border-0 hover:bg-bg-main px-2 rounded transition-colors">
              <div>
                <p className="font-bold font-mono text-xs m-0 mb-1 text-white">{event.action}</p>
                <p className="text-[10px] uppercase tracking-widest text-primary m-0">{event.actor}</p>
              </div>
              <div className="text-[10px] font-mono text-secondary text-right opacity-70">
                {new Date(event.time).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
