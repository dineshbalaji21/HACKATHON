import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMockData } from '../../contexts/MockDataContext';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Brain, MapPin, CheckCircle, Target, ShieldCheck, CaretLeft } from '@phosphor-icons/react';

export default function ComplaintReview() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addComplaint, currentUser } = useMockData();
  
  const { formData, isMulti } = location.state || {};

  if (!formData) {
    return (
      <div className="citizen-empty-state-card py-16 max-w-xl mx-auto">
        <h4 className="text-base font-bold text-white mb-2">No Review Payload Available</h4>
        <p className="text-xs text-secondary mb-4">Please submit a complaint through the guided workflow.</p>
        <Button onClick={() => navigate('/citizen/report')}>Start New Report</Button>
      </div>
    );
  }

  const handleSubmit = () => {
    let payload;
    if (isMulti) {
      payload = {
        title: formData.title || 'Multiple Civic Inconveniences',
        description: formData.description,
        location: formData.location,
        district: currentUser?.district || 'Chennai',
        priority: 'High',
        subCases: [
          {
            issue: 'Hazardous Waste Overflow',
            category: 'Sanitation',
            department: 'Sanitation Department',
            priority: 'High',
            expectedResolution: '2 Days'
          },
          {
            issue: 'Streetlight Inoperative Outage',
            category: 'Electrical',
            department: 'Electrical Department',
            priority: 'High',
            expectedResolution: '24 Hours'
          },
          {
            issue: 'Drainage Stagnation',
            category: 'Municipality',
            department: 'Municipal Works',
            priority: 'Medium',
            expectedResolution: '5 Days'
          }
        ]
      };
    } else {
      payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        department: formData.category?.includes('Lighting') ? 'Electrical Department'
          : formData.category?.includes('Sanitation') ? 'Sanitation Department'
          : formData.category?.includes('Drainage') ? 'Municipal Works'
          : 'Road Infrastructure Dept',
        location: formData.location,
        district: currentUser?.district || 'Chennai',
        priority: formData.priority || 'Medium',
        expectedResolution: '5 Days',
        status: 'In Progress'
      };
    }

    const createdId = addComplaint(payload);
    navigate(`/citizen/cases/${createdId}`);
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6 animate-fade-in pb-12">
      <div className="flex justify-between items-center border-b border-gray-100 border-opacity-10 pb-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-primary bg-transparent border-none font-bold text-xs uppercase tracking-wider cursor-pointer"
        >
          <CaretLeft size={16} weight="bold" /> BACK
        </button>
        <span className="text-xs font-mono text-primary bg-primary bg-opacity-10 px-2.5 py-1 rounded border border-primary border-opacity-20">
          PRE-DISPATCH AUDIT
        </span>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-extrabold m-0 mb-1 text-primary uppercase tracking-widest">AI ROUTING RESULTS</h2>
        <p className="text-xs text-secondary m-0">Review the extracted metadata before execution.</p>
      </div>

      {isMulti && (
        <Card className="bg-primary bg-opacity-10 border-primary border-opacity-30 shadow-[var(--glow-primary)]">
          <div className="flex items-start gap-3">
            <Brain size={24} weight="fill" className="text-primary mt-1 animate-pulse" />
            <div>
              <h3 className="text-xs font-bold text-primary m-0 mb-1 uppercase tracking-wider">Multi-Department Split Detected</h3>
              <p className="text-xs m-0 font-mono opacity-90 leading-relaxed text-text-primary">
                AI has identified multiple distinct issues in your payload. We will automatically generate 3 separate operational tickets for Sanitation, Electrical, and Municipality.
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card className="bg-surface-hover border-opacity-30 p-5">
        <h3 className="text-[10px] uppercase tracking-widest text-secondary mb-2 font-bold">Grievance Payload</h3>
        <h4 className="text-base font-bold text-white m-0 mb-2">{formData.title}</h4>
        <p className="text-xs bg-bg-main p-3 rounded font-mono leading-relaxed opacity-90 border border-gray-100 border-opacity-10 mb-4 text-text-primary">
          {formData.description}
        </p>
        
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 border-t border-gray-100 border-opacity-10 pt-3">
            <div className="w-8 h-8 rounded bg-bg-main text-secondary flex items-center justify-center flex-shrink-0 border border-gray-100 border-opacity-10"><MapPin size={16} /></div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-secondary m-0">Detected Coordinates</p>
              <p className="text-xs font-mono m-0 text-white opacity-90">{formData.location}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 border-t border-gray-100 border-opacity-10 pt-3">
            <div className="w-8 h-8 rounded bg-primary bg-opacity-20 text-primary flex items-center justify-center flex-shrink-0 border border-primary border-opacity-30"><Target size={16} /></div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-secondary m-0">Target Department</p>
              <p className="text-xs font-mono font-bold m-0 text-primary">
                {isMulti ? 'Multiple (Sanitation, Electrical, Municipality)' : formData.category}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 border-t border-gray-100 border-opacity-10 pt-3">
            <div className="w-8 h-8 rounded bg-danger-bg bg-opacity-20 text-danger flex items-center justify-center flex-shrink-0 border border-danger border-opacity-30"><ShieldCheck size={16} /></div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-secondary m-0">Assessed Priority</p>
              <p className="text-xs font-mono font-bold m-0 text-danger">{formData.priority || 'Medium'}</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => navigate(-1)} className="flex-1 uppercase font-bold tracking-widest text-xs">
          Edit
        </Button>
        <button
          type="button"
          onClick={handleSubmit}
          className="btn btn-primary flex-[2] text-xs uppercase font-extrabold tracking-widest flex items-center justify-center gap-2 py-3 shadow-[var(--glow-primary)]"
        >
          <CheckCircle size={18} weight="fill" /> Confirm & Execute
        </button>
      </div>
    </div>
  );
}
