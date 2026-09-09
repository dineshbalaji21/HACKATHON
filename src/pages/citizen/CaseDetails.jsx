import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMockData } from '../../contexts/MockDataContext';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import {
  CaretLeft,
  MapPin,
  CheckCircle,
  XCircle,
  ChatCircleText,
  WarningCircle,
  Check,
  Clock,
  Buildings,
  ShieldCheck,
  UserCheck,
  PaperPlaneRight,
  Sparkle,
  Camera,
  ArrowsClockwise
} from '@phosphor-icons/react';
import './CaseDetails.css';

export default function CaseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { complaints, currentUser, updateComplaintStatus, addAuditTrail, addMessage } = useMockData();

  const caseData = complaints.find(c => c.id === id);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [newMessage, setNewMessage] = useState('');

  if (!caseData) {
    return (
      <div className="citizen-empty-state-card py-16">
        <WarningCircle size={48} className="text-secondary opacity-40 mb-3" />
        <h3 className="text-lg font-bold text-white mb-2">Grievance Ticket Not Found</h3>
        <p className="text-xs text-secondary mb-4">The requested ticket ID does not exist or may have been archived.</p>
        <Button onClick={() => navigate('/citizen/cases')}>Back to My Cases</Button>
      </div>
    );
  }

  const handleVerify = (isResolved) => {
    if (isResolved) {
      updateComplaintStatus(id, 'Solved');
      addAuditTrail(id, 'Citizen physically inspected and closed ticket', currentUser.name, 'Solved');
      alert('Thank you for confirming resolution! Case is now officially marked as closed.');
    } else {
      setShowRejectForm(true);
    }
  };

  const submitRejection = () => {
    if (!rejectReason.trim()) {
      alert('Please provide a specific reason for reopening.');
      return;
    }
    updateComplaintStatus(id, 'Reopened', {
      reopenCount: (caseData.reopenCount || 0) + 1
    });
    addAuditTrail(id, `Citizen rejected resolution: "${rejectReason}"`, currentUser.name, 'Reopened');
    setShowRejectForm(false);
    setRejectReason('');
    alert('Case has been officially reopened and escalated to the Department Head.');
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      addMessage(id, currentUser.id, currentUser.name, newMessage.trim());
      setNewMessage('');
    }
  };

  // Generate Connected Timeline Items
  const timelineEvents = [
    {
      title: 'Grievance Registered',
      desc: 'Ticket created in GovAction AI database',
      status: 'completed',
      icon: <Check size={14} weight="bold" />
    },
    {
      title: 'AI Classification & Routing',
      desc: `Routed to ${caseData.department || 'Concerned Dept'}`,
      status: 'completed',
      icon: <Sparkle size={14} weight="bold" />,
      isAi: true
    }
  ];

  if (caseData.assignedOfficerName) {
    timelineEvents.push({
      title: 'Department Officer Assigned',
      desc: `Field Officer: ${caseData.assignedOfficerName}`,
      status: 'completed',
      icon: <UserCheck size={14} weight="bold" />
    });
  }

  if (caseData.status === 'In Progress' || caseData.status === 'Resolved' || caseData.status === 'Solved') {
    timelineEvents.push({
      title: 'Field Operation In Progress',
      desc: 'Officer actively resolving issue on-site',
      status: 'completed',
      icon: <Check size={14} weight="bold" />
    });
  } else if (caseData.status === 'Overdue') {
    timelineEvents.push({
      title: 'SLA Deadline Exceeded',
      desc: 'Automated executive escalation triggered',
      status: 'error',
      icon: <WarningCircle size={14} weight="bold" />
    });
  } else {
    timelineEvents.push({
      title: 'Awaiting Action Dispatch',
      desc: 'Officer inspecting reported coordinates',
      status: 'active',
      icon: <Clock size={14} weight="bold" />
    });
  }

  if (caseData.status === 'Resolved') {
    timelineEvents.push({
      title: 'Action Completed — Verification Required',
      desc: 'Waiting for citizen on-site inspection',
      status: 'action',
      icon: <WarningCircle size={14} weight="bold" />
    });
  } else if (caseData.status === 'Solved') {
    timelineEvents.push({
      title: 'Citizen Verified & Closed',
      desc: 'Resolution verified by resident',
      status: 'success',
      icon: <CheckCircle size={14} weight="bold" />
    });
  } else if (caseData.status === 'Reopened') {
    timelineEvents.push({
      title: 'Ticket Reopened & Escalated',
      desc: 'Citizen rejected resolution on-site',
      status: 'error',
      icon: <ArrowsClockwise size={14} weight="bold" />
    });
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-12">
      {/* ── Top Bar ── */}
      <div className="flex justify-between items-center border-b border-gray-100 border-opacity-10 pb-4">
        <button
          type="button"
          onClick={() => navigate('/citizen/cases')}
          className="flex items-center gap-1.5 text-primary bg-transparent border-none font-bold text-xs uppercase tracking-wider cursor-pointer hover:underline"
        >
          <CaretLeft size={16} weight="bold" />
          Back to My Cases
        </button>

        <div className="flex items-center gap-2">
          <span className="citizen-case-id-badge font-mono">{caseData.id}</span>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary bg-opacity-15 text-primary border border-primary border-opacity-30 uppercase tracking-widest">
            {caseData.department}
          </span>
        </div>
      </div>

      {/* ── Case Header ── */}
      <div>
        <h2 className="text-2xl font-extrabold text-white m-0 tracking-tight">
          {caseData.title || caseData.issue}
        </h2>
        <div className="flex items-center gap-4 text-xs text-secondary mt-2 flex-wrap">
          <span className="flex items-center gap-1.5">
            <MapPin size={15} className="text-primary" />
            {caseData.location}
          </span>
          {caseData.expectedResolution && (
            <span className="flex items-center gap-1.5">
              <Clock size={15} className="text-warning" />
              SLA Deadline: <strong className="text-white font-mono">{caseData.expectedResolution}</strong>
            </span>
          )}
          {caseData.assignedOfficerName && (
            <span className="flex items-center gap-1.5">
              <UserCheck size={15} className="text-success" />
              Assigned: <strong className="text-white">{caseData.assignedOfficerName}</strong>
            </span>
          )}
        </div>
      </div>

      {/* ── Verification Required Action Card (if Resolved) ── */}
      {caseData.status === 'Resolved' && (
        <div className="p-5 rounded-xl bg-warning bg-opacity-10 border-2 border-warning border-opacity-60 shadow-[var(--glow-secondary)] flex flex-col gap-3">
          <div className="flex items-center gap-2 text-warning font-extrabold uppercase tracking-wider text-sm">
            <WarningCircle size={22} weight="fill" className="animate-pulse" />
            Verification Required — Confirm Physical Resolution
          </div>
          <p className="text-sm text-text-primary m-0 leading-relaxed">
            The assigned municipal officer reported that the field work has been finished. As the reporting citizen, please verify whether the issue is genuinely fixed at the location.
          </p>

          {!showRejectForm ? (
            <div className="flex gap-3 mt-1">
              <button
                type="button"
                className="btn btn-danger flex-1 text-xs uppercase font-bold tracking-wider py-2.5"
                onClick={() => handleVerify(false)}
              >
                <XCircle size={18} />
                No, Problem Still Exists
              </button>
              <button
                type="button"
                className="btn btn-primary flex-1 text-xs uppercase font-bold tracking-wider py-2.5 bg-success text-bg-main border-none hover:bg-green-400"
                onClick={() => handleVerify(true)}
              >
                <CheckCircle size={18} weight="fill" />
                Yes, Verified & Fixed
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 mt-2 p-3.5 rounded-lg bg-bg-main border border-danger border-opacity-40">
              <label className="text-xs font-bold uppercase tracking-wider text-danger">
                State reason why this issue is not resolved:
              </label>
              <textarea
                className="w-full p-2.5 rounded text-xs bg-bg-surface border border-danger border-opacity-30 text-white outline-none focus:border-danger leading-relaxed"
                placeholder="e.g. Streetlight still flickering, debris was only moved to side of road..."
                rows={3}
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
              />
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" size="sm" onClick={() => setShowRejectForm(false)}>
                  Cancel
                </Button>
                <Button variant="danger" size="sm" onClick={submitRejection}>
                  Submit & Reopen Ticket
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Two-Column Desktop Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Payload Details & Chat */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Payload Details Card */}
          <div className="civic-card flex flex-col gap-4">
            <h3 className="text-xs uppercase font-bold tracking-widest text-secondary m-0 border-b border-gray-100 border-opacity-10 pb-2 flex items-center justify-between">
              <span>Grievance Diagnostic Payload</span>
              <span className="text-primary font-mono">{caseData.priority || 'Medium'} Priority</span>
            </h3>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-secondary block mb-1">Description</span>
              <div className="p-3.5 rounded-lg bg-bg-main border border-gray-100 border-opacity-10 font-mono text-xs leading-relaxed text-text-primary">
                {caseData.description || 'No detailed description provided.'}
              </div>
            </div>

            {/* Evidence items */}
            {caseData.evidence && caseData.evidence.length > 0 && (
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-secondary block mb-1.5">Evidence Files</span>
                <div className="flex gap-2 flex-wrap">
                  {caseData.evidence.map((ev, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-bg-main border border-gray-100 border-opacity-15 text-xs text-secondary font-mono">
                      <Camera size={14} className="text-primary" />
                      {typeof ev === 'string' ? ev : ev.name || 'attachment.jpg'}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Direct Communication with Officer */}
          <div className="civic-card flex flex-col p-0 overflow-hidden">
            <div className="p-3.5 border-b border-gray-100 border-opacity-10 flex justify-between items-center bg-bg-surface">
              <div className="flex items-center gap-2">
                <ChatCircleText size={18} className="text-primary" />
                <h4 className="text-xs uppercase font-bold tracking-widest text-white m-0">Direct Officer Communications</h4>
              </div>
              <span className="text-[10px] text-secondary font-mono">
                {caseData.assignedOfficerName ? `Officer: ${caseData.assignedOfficerName}` : 'Auto-routed'}
              </span>
            </div>

            {/* Messages feed */}
            <div className="p-4 flex flex-col gap-3 overflow-y-auto max-h-[300px] min-h-[160px] bg-bg-main bg-opacity-40">
              {!caseData.messages || caseData.messages.length === 0 ? (
                <p className="text-xs text-secondary text-center italic my-auto opacity-70">
                  No messages exchanged yet. Send an inquiry or update regarding this ticket.
                </p>
              ) : (
                caseData.messages.map(msg => {
                  const isCitizen = msg.senderId === currentUser.id;
                  return (
                    <div key={msg.id} className={`flex gap-2 ${isCitizen ? 'flex-row-reverse' : ''}`}>
                      <div className="w-7 h-7 rounded-md bg-gray-700 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white">
                        {msg.senderName?.[0] || 'O'}
                      </div>
                      <div className={`p-2.5 rounded-lg text-xs max-w-[80%] ${
                        isCitizen
                          ? 'bg-primary bg-opacity-20 text-white rounded-tr-none border border-primary border-opacity-30'
                          : 'bg-bg-main text-secondary rounded-tl-none border border-gray-100 border-opacity-10'
                      }`}>
                        <p className="m-0 font-bold text-[9px] uppercase tracking-wider text-primary mb-1">{msg.senderName}</p>
                        <p className="m-0 leading-relaxed text-text-primary">{msg.text}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Chat Input */}
            <div className="p-3 border-t border-gray-100 border-opacity-10 flex gap-2 bg-bg-main">
              <input
                type="text"
                placeholder="Type a message to the assigned department team..."
                className="flex-1 p-2 rounded text-xs bg-bg-surface border border-gray-100 border-opacity-20 text-white outline-none focus:border-primary"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              />
              <button
                type="button"
                className="btn btn-primary"
                style={{ padding: '0.5rem 1rem' }}
                onClick={handleSendMessage}
              >
                <PaperPlaneRight size={16} weight="fill" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Connected Timeline & Audit Trail */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Progress Timeline */}
          <div className="civic-card">
            <h3 className="text-xs uppercase font-bold tracking-widest text-secondary mb-6 m-0 border-b border-gray-100 border-opacity-10 pb-2">
              Progress & SLA Tracking
            </h3>

            <div className="relative pl-6">
              <div className="absolute left-3.5 top-2 bottom-6 w-[2px] bg-gray-100 bg-opacity-10" />

              {timelineEvents.map((ev, idx) => {
                let dotClass = 'bg-gray-700 border-gray-700';
                let textClass = 'text-secondary';

                if (ev.status === 'completed') {
                  dotClass = 'bg-primary border-primary';
                  textClass = 'text-primary';
                } else if (ev.status === 'active') {
                  dotClass = 'bg-bg-main border-primary shadow-[var(--glow-primary)]';
                  textClass = 'text-primary';
                } else if (ev.status === 'action') {
                  dotClass = 'bg-warning border-warning shadow-[var(--glow-secondary)] animate-pulse';
                  textClass = 'text-warning';
                } else if (ev.status === 'success') {
                  dotClass = 'bg-success border-success';
                  textClass = 'text-success';
                } else if (ev.status === 'error') {
                  dotClass = 'bg-danger border-danger shadow-[var(--glow-critical)]';
                  textClass = 'text-danger';
                }

                return (
                  <div key={idx} className="relative mb-6 last:mb-0">
                    <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center text-bg-main z-10 ${dotClass} ${ev.status === 'active' ? 'text-primary' : ''}`}>
                      {ev.status !== 'active' && ev.icon}
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold m-0 flex items-center gap-1.5 ${textClass}`}>
                        {ev.title}
                        {ev.isAi && (
                          <span className="text-[8px] bg-primary bg-opacity-20 text-primary px-1.5 py-0.5 rounded uppercase tracking-widest border border-primary border-opacity-30">
                            AI Core
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-secondary m-0 mt-0.5 opacity-80">{ev.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cryptographic Audit Trail */}
          {caseData.auditTrail && caseData.auditTrail.length > 0 && (
            <div className="civic-card">
              <h3 className="text-xs uppercase font-bold tracking-widest text-secondary mb-3 m-0 border-b border-gray-100 border-opacity-10 pb-2">
                Operational Audit Log
              </h3>
              <div className="flex flex-col gap-2">
                {caseData.auditTrail.map((trail, i) => (
                  <div key={i} className="p-2.5 rounded bg-bg-main border border-gray-100 border-opacity-10 text-[11px]">
                    <div className="flex justify-between items-center text-secondary mb-1">
                      <span className="font-bold text-white">{trail.actor}</span>
                      <span className="font-mono text-[10px] opacity-70">
                        {new Date(trail.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="m-0 text-secondary">{trail.action}</p>
                    <span className="text-[9px] font-bold text-primary uppercase mt-1 inline-block">
                      Status: {trail.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
