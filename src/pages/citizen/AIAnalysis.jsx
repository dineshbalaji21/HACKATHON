import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Brain, MagnifyingGlass, ShieldCheck, MapPin, Check } from '@phosphor-icons/react';

export default function AIAnalysis() {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(0);
  const formData = location.state || {
    title: 'Grievance Concern',
    description: 'Pothole on main road causing hazard',
    location: 'Anna Nagar 4th Avenue',
    category: 'Roads & Infrastructure',
    priority: 'Medium'
  };

  // Detect multi-issue from description
  const isMulti = formData.description.toLowerCase().includes('garbage') && 
                  formData.description.toLowerCase().includes('streetlight') || 
                  formData.description.toLowerCase().includes('drainage');

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => {
        if (prev >= 4) {
          clearInterval(timer);
          return 4;
        }
        return prev + 1;
      });
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  const handleNext = () => {
    navigate('/citizen/report/review', { state: { formData, isMulti } });
  };

  const steps = [
    { text: 'Scanning grievance payload signature...', icon: MagnifyingGlass },
    { text: 'Extracting location coordinates & zone boundaries...', icon: MapPin },
    { text: isMulti ? 'Complex multi-hazard detected. Splitting sub-cases...' : 'Routing to operational department...', icon: Brain },
    { text: 'Calculating threat/risk vector & SLA deadline...', icon: ShieldCheck },
    { text: 'Analysis complete. Ready for citizen review.', icon: Brain }
  ];

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6 animate-fade-in pb-12">
      <div className="text-center pt-6 pb-2">
        <Brain size={56} className="mx-auto mb-3 text-primary animate-ai-glow" weight="fill" />
        <h2 className="text-2xl font-extrabold m-0 mb-1 text-primary uppercase tracking-widest">AI CORE DIAGNOSTICS</h2>
        <p className="text-xs text-secondary m-0">Processing payload for autonomous municipal dispatch.</p>
      </div>

      <Card className="bg-surface-hover border-primary border-opacity-30 relative overflow-hidden p-6">
        <div className="absolute top-0 left-0 h-1 bg-primary transition-all duration-300" style={{ width: `${(step / 4) * 100}%`, boxShadow: 'var(--glow-primary)' }} />
        <div className="flex flex-col gap-4 relative z-10 pt-2">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isCurrent = step === idx;
            const isDone = step > idx;
            
            return (
              <div key={idx} className={`flex items-center gap-4 transition-all duration-300 ${isCurrent ? 'opacity-100 scale-102 transform origin-left' : isDone ? 'opacity-70' : 'opacity-25'}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${isCurrent ? 'bg-primary bg-opacity-20 text-primary border border-primary border-opacity-50 shadow-[var(--glow-primary)]' : isDone ? 'bg-bg-main text-success' : 'bg-bg-main text-secondary'}`}>
                  {isDone ? <Check size={16} weight="bold" /> : <Icon size={18} weight={isCurrent ? 'fill' : 'regular'} className={isCurrent ? 'animate-pulse' : ''} />}
                </div>
                <p className={`m-0 text-xs font-mono ${isCurrent ? 'text-primary font-bold' : isDone ? 'text-white' : 'text-secondary'}`}>
                  {s.text}
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      {step >= 4 && (
        <div className="mt-2 animate-fade-in text-center flex flex-col gap-3">
          <p className="text-xs uppercase tracking-widest text-success font-bold flex justify-center items-center gap-2 m-0">
            <ShieldCheck size={16} weight="fill" /> Payload Verified & Ready
          </p>
          <button
            type="button"
            className="btn btn-primary w-full py-3 text-xs uppercase font-extrabold tracking-widest shadow-[var(--glow-primary)]"
            onClick={handleNext}
          >
            Proceed to Review & Confirm
          </button>
        </div>
      )}
    </div>
  );
}
