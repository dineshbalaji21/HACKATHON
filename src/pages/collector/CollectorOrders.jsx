import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMockData } from '../../contexts/MockDataContext';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { FilePlus, Brain, MagnifyingGlass, CheckCircle, Clock } from '@phosphor-icons/react';

export default function CollectorOrders() {
  const navigate = useNavigate();
  const { govOrders, addGovOrder } = useMockData();
  const [showForm, setShowForm] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
  });

  const handleExtract = () => {
    setIsExtracting(true);
    setTimeout(() => {
      setIsExtracting(false);
      
      const newOrder = {
        title: formData.title || 'New Government Directive',
        description: formData.description || 'Details extracted from GO.',
        status: 'Active',
        deadline: formData.deadline || new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
        tasks: [
          { id: 1, name: 'Initial Survey', dept: 'Revenue', status: 'Pending', officer: null },
          { id: 2, name: 'Execution Phase 1', dept: 'Municipality', status: 'Pending', officer: null },
          { id: 3, name: 'Final Inspection', dept: 'District Admin', status: 'Pending', officer: null }
        ],
        compliance: 0
      };
      
      addGovOrder(newOrder);
      setShowForm(false);
      setFormData({ title: '', description: '', deadline: '' });
    }, 2000);
  };

  const filteredOrders = govOrders.filter(o => 
    `${o.id} ${o.title}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="flex justify-between items-end mb-6 border-b border-gray-100 border-opacity-10 pb-4">
        <div>
          <h1 className="m-0 mb-2 text-2xl text-primary">GOVERNMENT ORDERS (GO)</h1>
          <p className="text-secondary text-sm">Track multi-department directives and cross-functional compliance</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2">
          {showForm ? 'Cancel' : <><FilePlus size={20} /> Issue New GO</>}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8 border-primary shadow-[var(--glow-primary)] animate-fade-in bg-bg-main relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
          <h2 className="mb-4 text-primary text-xl flex items-center gap-2">
            <FilePlus size={24} /> INITIALIZE NEW GO DIRECTIVE
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1">GO Title / Subject</label>
              <input 
                type="text" 
                className="w-full p-3 rounded"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="E.g., Monsoon Flood Prevention Protocol"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1">Target Deadline</label>
              <input 
                type="date" 
                className="w-full p-3 rounded"
                value={formData.deadline}
                onChange={e => setFormData({...formData, deadline: e.target.value})}
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1">Order Document Text</label>
            <textarea 
              className="w-full p-3 rounded font-mono text-sm"
              style={{ minHeight: '150px', resize: 'vertical' }}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="PASTE RAW DIRECTIVE TEXT. AI CORE WILL EXTRACT DEPENDENCY GRAPH..."
            />
          </div>

          {isExtracting ? (
            <div className="flex items-center justify-center gap-3 p-4 bg-primary bg-opacity-10 text-primary rounded border border-primary animate-pulse font-bold tracking-wider uppercase">
              <Brain size={24} weight="fill" className="animate-ai-glow" />
              AI CORE PARSING DIRECTIVE & MAPPING DEPARTMENTAL GRAPH...
            </div>
          ) : (
            <Button size="lg" fullWidth onClick={handleExtract} className="flex items-center justify-center gap-2 font-bold tracking-wider">
              <Brain size={20} weight="fill" /> AI EXTRACT & INITIALIZE ACTION GRAPH
            </Button>
          )}
        </Card>
      )}

      <div className="mb-6 relative">
        <input 
          type="text" 
          placeholder="Search Active Directives..." 
          className="w-full p-3 pl-10 rounded border border-primary border-opacity-30 bg-surface focus:bg-bg-main shadow-[var(--glow-primary)] transition-all font-mono text-sm"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <MagnifyingGlass size={20} className="absolute left-3 top-3 text-primary opacity-70" />
      </div>

      <div className="flex flex-col gap-4">
        {filteredOrders.length === 0 ? (
          <Card className="text-center py-10 text-secondary bg-surface-hover">
            <MagnifyingGlass size={48} className="mx-auto mb-4 opacity-20" />
            <p className="tracking-widest uppercase font-bold text-sm">NO DIRECTIVES LOCATED</p>
          </Card>
        ) : (
          filteredOrders.map(order => (
            <Card key={order.id} className="cursor-pointer hover:bg-surface-hover hover:border-primary transition-colors border-l-4 bg-surface-hover bg-opacity-50" style={{ borderLeftColor: order.compliance === 100 ? 'var(--success)' : 'var(--primary)' }} onClick={() => navigate(`/collector/orders/${order.id}`)}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="m-0 text-lg mb-1 text-primary flex items-center gap-2">
                    <span className="font-mono text-secondary bg-bg-main px-2 py-0.5 rounded text-xs border border-primary border-opacity-20">{order.id}</span>
                    {order.title}
                  </h3>
                  <p className="text-secondary text-sm m-0 line-clamp-1 opacity-80">{order.description}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  {order.compliance === 100 ? (
                    <span className="bg-success-bg bg-opacity-20 text-success border border-success px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 uppercase tracking-wider">
                      <CheckCircle weight="fill" size={14} /> COMPLETED
                    </span>
                  ) : (
                    <span className="bg-primary bg-opacity-10 text-primary border border-primary border-opacity-30 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <Clock weight="fill" size={14} /> ACTIVE RUN
                    </span>
                  )}
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100 border-opacity-10 flex items-center gap-6">
                <div className="flex-1">
                  <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest mb-1">
                    <span className="text-secondary">Compliance Graph</span>
                    <span className={order.compliance === 100 ? 'text-success font-mono text-xs' : 'text-primary font-mono text-xs'}>{order.compliance || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${order.compliance === 100 ? 'bg-success' : 'bg-primary shadow-[var(--glow-primary)]'}`} style={{ width: `${order.compliance || 0}%` }}></div>
                  </div>
                </div>
                <div className="text-[10px] text-secondary font-bold uppercase tracking-widest text-right">
                  Target Deadline
                  <div className="text-text-primary font-mono text-xs mt-0.5">{order.deadline}</div>
                </div>
                <div className="text-[10px] text-secondary font-bold uppercase tracking-widest text-right">
                  Nodes
                  <div className="text-text-primary font-mono text-xs mt-0.5">{order.tasks.length}</div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
