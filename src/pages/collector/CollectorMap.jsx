import React, { useState } from 'react';
import { useMockData } from '../../contexts/MockDataContext';
import { Card } from '../../components/Card';
import { MapPin, Brain, Funnel, WarningCircle } from '@phosphor-icons/react';

export default function CollectorMap() {
  const { complaints } = useMockData();
  const [deptFilter, setDeptFilter] = useState('All');
  
  // Create mock hotspots based on locations that appear frequently
  const locationCounts = {};
  complaints.forEach(c => {
    if (c.isParent) return;
    if (deptFilter !== 'All' && c.department !== deptFilter) return;
    
    const loc = c.location || 'Unknown Area';
    if (!locationCounts[loc]) locationCounts[loc] = [];
    locationCounts[loc].push(c);
  });

  const hotspots = Object.keys(locationCounts).map(loc => {
    const cases = locationCounts[loc];
    const totalRisk = cases.reduce((sum, c) => sum + c.riskScore, 0);
    const avgRisk = cases.length > 0 ? totalRisk / cases.length : 0;
    
    // AI Root cause mock
    let rootCause = "Requires manual investigation";
    if (loc.toLowerCase().includes('ward 12') || loc.toLowerCase().includes('main street')) {
      rootCause = "Aging main pipeline causing frequent leaks and subsequent road damage.";
    } else if (loc.toLowerCase().includes('anna')) {
      rootCause = "Incomplete storm water drain networking leading to chronic waterlogging.";
    }
    
    return {
      location: loc,
      count: cases.length,
      avgRisk,
      rootCause,
      departments: [...new Set(cases.map(c => c.department))],
      active: cases.filter(c => c.status !== 'Resolved' && c.status !== 'Solved').length
    };
  }).sort((a, b) => b.count - a.count); // sort by most complaints

  const departments = ['All', 'Sanitation', 'Water Supply', 'Electrical', 'Roads & Highways', 'Municipality'];

  return (
    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header className="mb-6 flex justify-between items-end border-b border-gray-100 border-opacity-10 pb-4">
        <div>
          <h1 className="m-0 mb-2 text-2xl text-primary">DISTRICT HOTSPOT TOPOLOGY</h1>
          <p className="text-secondary text-sm">AI-detected geographical hotspots and recurring complaint clusters.</p>
        </div>
        <div className="relative" style={{ minWidth: '220px' }}>
          <select 
            className="w-full p-2 pl-8 rounded border border-primary border-opacity-30 bg-surface text-primary font-semibold text-sm appearance-none"
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
          >
            {departments.map(d => <option key={d} value={d}>{d === 'All' ? 'ALL LAYERS (DISTRICT)' : d.toUpperCase()}</option>)}
          </select>
          <Funnel size={16} className="absolute left-2 top-2.5 text-primary pointer-events-none" />
        </div>
      </header>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="col-span-2">
          {/* Mock Map Area */}
          <div className="w-full bg-surface-hover border border-primary border-opacity-20 relative flex items-center justify-center flex-col text-primary overflow-hidden" style={{ height: '600px', borderRadius: 'var(--radius-md)' }}>
            
            {/* Map styling elements */}
            <div className="absolute top-4 left-4 z-20 font-mono text-xs text-primary font-bold opacity-70">
              LAT: 12.9716 N<br />
              LON: 77.5946 E<br />
              ALT: 920m
            </div>
            
            {/* The Stylized Dark Map Grid */}
            <div className="absolute inset-0 z-0 opacity-20" style={{
              backgroundImage: 'linear-gradient(rgba(57, 230, 208, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(57, 230, 208, 0.5) 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}></div>
            
            {/* Topographic mock lines */}
            <svg className="absolute inset-0 z-10 w-full h-full opacity-10" preserveAspectRatio="none" viewBox="0 0 100 100">
              <path d="M0,50 Q25,30 50,50 T100,50" fill="none" stroke="var(--primary)" strokeWidth="0.5" />
              <path d="M0,70 Q30,60 70,80 T100,70" fill="none" stroke="var(--primary)" strokeWidth="0.5" />
              <path d="M20,0 Q40,40 20,100" fill="none" stroke="var(--primary)" strokeWidth="0.5" />
            </svg>
            
            {/* Render mock map pins */}
            {hotspots.slice(0, 5).map((hotspot, idx) => {
              // Deterministic layout for demo
              const positions = [
                { top: 30, left: 40 },
                { top: 60, left: 70 },
                { top: 20, left: 80 },
                { top: 75, left: 30 },
                { top: 50, left: 50 },
              ];
              const pos = positions[idx] || { top: 20 + ((idx * 17) % 60), left: 20 + ((idx * 29) % 60) };
              
              const size = Math.max(40, Math.min(100, hotspot.count * 12));
              const isHighRisk = hotspot.avgRisk >= 80;
              const color = isHighRisk ? 'var(--critical)' : 'var(--warning)';
              const glow = isHighRisk ? 'var(--glow-critical)' : 'var(--glow-secondary)';
              
              return (
                <div key={idx} className="absolute flex flex-col items-center" style={{ top: `${pos.top}%`, left: `${pos.left}%`, transform: 'translate(-50%, -50%)', zIndex: 20 }}>
                  <div className="relative flex items-center justify-center">
                    <div 
                      className="absolute rounded-full animate-pulse-subtle"
                      style={{ 
                        width: `${size * 1.5}px`, height: `${size * 1.5}px`, 
                        backgroundColor: color, opacity: 0.1,
                      }}
                    ></div>
                    <div 
                      className="relative rounded-full flex items-center justify-center text-bg-main font-bold font-mono text-sm border-2 border-bg-main"
                      style={{ 
                        width: `${size}px`, height: `${size}px`, 
                        backgroundColor: color, boxShadow: glow
                      }}
                    >
                      {hotspot.count}
                    </div>
                  </div>
                  <div className="bg-bg-surface px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider mt-2 whitespace-nowrap text-primary border border-primary border-opacity-30 z-30" style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
                    {hotspot.location}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto pr-2" style={{ maxHeight: '600px' }}>
          <h3 className="m-0 text-sm tracking-widest uppercase text-secondary sticky top-0 bg-bg-main py-2 z-10 border-b border-gray-100 border-opacity-10">Critical Clusters</h3>
          {hotspots.length === 0 ? (
            <p className="text-secondary italic text-sm">No clusters found for this filter.</p>
          ) : (
            hotspots.map((hotspot, idx) => (
              <Card key={idx} className={`border-l-4 ${hotspot.avgRisk >= 80 ? 'border-danger bg-danger-bg bg-opacity-10' : 'border-warning'}`} style={{ borderLeftColor: hotspot.avgRisk >= 80 ? 'var(--critical)' : 'var(--secondary)' }}>
                <div className="flex justify-between items-start mb-3">
                  <h4 className="m-0 flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wide">
                    <MapPin size={16} weight="fill" /> {hotspot.location}
                  </h4>
                  {hotspot.avgRisk >= 80 && <WarningCircle size={16} className="text-danger animate-pulse" weight="fill" />}
                </div>
                
                {/* Visual Bar representation */}
                <div className="mb-4">
                  <div className="flex justify-between text-[10px] font-mono font-bold text-secondary mb-1 uppercase tracking-wider">
                    <span>{hotspot.count} Cases</span>
                    <span className={hotspot.active > 0 ? 'text-danger' : 'text-success'}>{hotspot.active} Active</span>
                  </div>
                  <div className="flex w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    {hotspot.departments.map((dept, i) => (
                      <div key={i} className="h-full border-r border-gray-800 last:border-0" style={{ width: `${100 / hotspot.departments.length}%`, backgroundColor: i % 2 === 0 ? 'var(--primary)' : 'var(--secondary)' }}></div>
                    ))}
                  </div>
                  <div className="text-[9px] text-secondary mt-1 font-mono uppercase truncate opacity-70">
                    {hotspot.departments.join(' • ')}
                  </div>
                </div>
                
                {hotspot.count > 1 && (
                  <div className="bg-bg-main p-3 rounded border border-primary border-opacity-20 mt-2">
                    <p className="text-[10px] font-bold text-primary flex items-center gap-1 mb-1 uppercase tracking-wider">
                      <Brain size={14} weight="fill" className="animate-ai-glow" /> AI Root Cause Analysis
                    </p>
                    <p className="text-xs m-0 text-text-primary leading-relaxed opacity-90">{hotspot.rootCause}</p>
                    <p className="text-[9px] text-warning mt-2 font-mono uppercase">⚠ Requires field verification</p>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
