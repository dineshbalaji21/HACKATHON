import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMockData } from '../../contexts/MockDataContext';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { RiskScore } from '../../components/RiskScore';
import { CaretLeft, WarningCircle, CheckCircle, Clock, PaperPlaneRight } from '@phosphor-icons/react';

export default function OfficerCaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { complaints, updateComplaintStatus, addAuditTrail, currentUser, addMessage } = useMockData();
  
  const caseData = complaints.find(c => c.id === id);
  const [note, setNote] = useState('');
  const [messageText, setMessageText] = useState('');

  if (!caseData) return <div className="p-4 text-center">Case not found</div>;

  const handleStatusChange = (newStatus) => {
    updateComplaintStatus(id, newStatus);
    let logMsg = `Status changed to ${newStatus}`;
    if (note) logMsg += ` - Note: ${note}`;
    addAuditTrail(id, logMsg, currentUser.name, newStatus);
    setNote('');
  };

  const handleSendMessage = () => {
    if (messageText.trim()) {
      addMessage(id, currentUser.id, currentUser.name, messageText);
      setMessageText('');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-1 text-primary bg-transparent border-none font-bold text-xs uppercase tracking-wider mb-6 cursor-pointer hover:text-white transition-colors"
        style={{ padding: 0 }}
      >
        <CaretLeft size={16} /> BACK TO QUEUE
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

      <div className="grid grid-cols-3 gap-6 mb-8">
        <section className="col-span-2 flex flex-col gap-6">
          <Card className="bg-surface-hover border-opacity-50">
            <h3 className="text-xs uppercase tracking-widest text-secondary mb-3">Grievance Payload</h3>
            <p className="text-sm bg-bg-main p-4 rounded font-mono leading-relaxed opacity-80 border border-gray-100 border-opacity-10">{caseData.description || 'No description provided.'}</p>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-1">Target Location</p>
                <p className="text-sm bg-bg-main p-2 rounded font-mono border border-gray-100 border-opacity-10">{caseData.location}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-1">SLA Deadline</p>
                <p className={`text-sm bg-bg-main p-2 rounded font-mono border border-gray-100 border-opacity-10 ${caseData.status === 'Overdue' ? 'text-danger font-bold' : ''}`}>{caseData.expectedResolution}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-surface-hover border-opacity-50">
            <h3 className="text-xs uppercase tracking-widest text-secondary mb-3">Command Actions</h3>
            
            {caseData.status === 'Pending' && (
              <Button size="lg" fullWidth onClick={() => handleStatusChange('In Progress')} className="bg-primary bg-opacity-10 border-primary text-primary hover:bg-opacity-20 uppercase tracking-widest font-bold">
                <CheckCircle size={20} weight="fill" /> Accept & Start Execution
              </Button>
            )}

            {(caseData.status === 'In Progress' || caseData.status === 'Reopened' || caseData.status === 'Overdue') && (
              <div className="flex flex-col gap-4">
                <textarea 
                  className="w-full p-3 rounded font-mono text-sm border-opacity-30 bg-bg-main focus:bg-surface"
                  style={{ minHeight: '80px', resize: 'vertical' }}
                  placeholder="Enter operational progress notes or resolution evidence..."
                  value={note}
                  onChange={e => setNote(e.target.value)}
                />
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={() => handleStatusChange(caseData.status)} className="flex-1 uppercase tracking-widest text-xs font-bold">
                    <Clock size={16} /> Log Progress
                  </Button>
                  <Button variant="primary" onClick={() => handleStatusChange('Resolved')} className="flex-1 uppercase tracking-widest text-xs font-bold bg-success-bg bg-opacity-20 text-success border-success hover:bg-opacity-30 hover:shadow-[var(--glow-secondary)]">
                    <CheckCircle size={16} weight="fill" /> Mark Completed
                  </Button>
                </div>
                {caseData.riskScore >= 80 && (
                  <Button variant="danger" className="w-full mt-2 uppercase tracking-widest text-xs font-bold" onClick={() => alert('Escalated to Dept Head.')}>
                    <WarningCircle size={16} weight="fill" /> Escalate to Dept Head
                  </Button>
                )}
              </div>
            )}
            
            {(caseData.status === 'Resolved' || caseData.status === 'Solved') && (
              <div className="text-center p-4 bg-success-bg bg-opacity-10 text-success rounded border border-success border-opacity-30 flex items-center justify-center gap-2 font-bold uppercase tracking-widest">
                <CheckCircle size={24} weight="fill" />
                Case execution marked as complete
              </div>
            )}
          </Card>
        </section>

        <section className="flex flex-col gap-6">
          {caseData.riskScore >= 50 && (
            <Card className="bg-danger-bg bg-opacity-10 border-danger shadow-[var(--glow-critical)]">
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

          <Card className="flex-1 flex flex-col bg-surface-hover border-opacity-30" style={{ padding: 0 }}>
            <h3 className="text-[10px] uppercase tracking-widest text-secondary p-4 m-0 border-b border-gray-100 border-opacity-10 font-bold">Comms Link</h3>
            
            <div className="flex-1 p-4 flex flex-col gap-3 overflow-y-auto max-h-64">
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
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
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
        <h3 className="text-xs uppercase tracking-widest text-secondary mb-4 font-bold">Execution Audit Trail</h3>
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
