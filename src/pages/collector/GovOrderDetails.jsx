import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMockData } from '../../contexts/MockDataContext';
import { Card } from '../../components/Card';
import { CaretLeft, CheckCircle, Circle, Clock, WarningCircle, Graph } from '@phosphor-icons/react';
import './GovOrderGraph.css';

export default function GovOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { govOrders, updateGovOrderTask } = useMockData();
  
  const order = govOrders.find(o => o.id === id);

  if (!order) return <div className="p-8 text-center text-secondary">Government Order not found.</div>;

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Completed': return <CheckCircle size={24} weight="fill" className="text-success" />;
      case 'In Progress': return <Clock size={24} weight="fill" className="text-primary animate-pulse" />;
      case 'Overdue': return <WarningCircle size={24} weight="fill" className="text-danger" />;
      default: return <Circle size={24} className="text-secondary opacity-50" />;
    }
  };

  const getStatusBg = (status) => {
    switch(status) {
      case 'Completed': return 'bg-success-bg bg-opacity-20 border-success text-success';
      case 'In Progress': return 'bg-primary bg-opacity-10 border-primary text-primary shadow-[var(--glow-primary)]';
      case 'Overdue': return 'bg-danger-bg bg-opacity-20 border-danger text-danger shadow-[var(--glow-critical)]';
      default: return 'bg-bg-main border-gray-600 text-secondary';
    }
  };

  const handleStatusChange = (taskId, e) => {
    updateGovOrderTask(order.id, taskId, e.target.value);
  };

  return (
    <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-1 text-primary bg-transparent border-none font-bold text-xs uppercase tracking-wider mb-6 cursor-pointer hover:text-white transition-colors"
        style={{ padding: 0 }}
      >
        <CaretLeft size={16} /> ABORT TO DIRECTIVES
      </button>

      <Card className="mb-8 border-t-4 border-primary bg-surface-hover">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="m-0 text-3xl mb-1 text-primary font-mono">{order.id}</h1>
            <h2 className="m-0 text-sm font-bold tracking-widest uppercase text-white opacity-90">{order.title}</h2>
          </div>
          <div className="text-right">
            <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider border ${order.compliance === 100 ? 'bg-success-bg bg-opacity-20 text-success border-success' : 'bg-primary bg-opacity-10 text-primary border-primary shadow-[var(--glow-primary)]'}`}>
              {order.compliance === 100 ? 'COMPLETED' : 'ACTIVE RUN'}
            </span>
          </div>
        </div>

        <p className="text-sm bg-bg-main p-4 rounded mb-6 leading-relaxed font-mono opacity-80 border border-gray-100 border-opacity-10">
          {order.description}
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] text-secondary uppercase font-bold tracking-widest mb-1">Target Deadline</p>
            <p className="font-bold font-mono text-white text-lg">{order.deadline}</p>
          </div>
          <div>
            <p className="text-[10px] text-secondary uppercase font-bold tracking-widest mb-1">Overall Compliance</p>
            <div className="flex items-center gap-3">
              <div className="w-full bg-gray-800 rounded-full h-2 flex-1">
                <div className={`h-2 rounded-full ${order.compliance === 100 ? 'bg-success' : 'bg-primary shadow-[var(--glow-primary)]'}`} style={{ width: `${order.compliance || 0}%`, transition: 'width 0.5s ease-in-out' }}></div>
              </div>
              <span className={`font-mono font-bold text-lg ${order.compliance === 100 ? 'text-success' : 'text-primary'}`}>{order.compliance || 0}%</span>
            </div>
          </div>
        </div>
      </Card>

      <h2 className="mb-6 text-lg uppercase tracking-widest text-secondary flex items-center gap-2">
        <Graph size={24} /> Execution Dependency Graph
      </h2>
      
      <div className="graph-container bg-surface-hover rounded-lg border border-primary border-opacity-20 p-8" style={{ backgroundImage: 'linear-gradient(rgba(57, 230, 208, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(57, 230, 208, 0.05) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        {order.tasks.map((task, idx) => (
          <div key={task.id} className="graph-node-wrapper relative z-10">
            <div className={`graph-node border-2 ${getStatusBg(task.status)} flex flex-col relative transition-all duration-300 backdrop-blur-md`} style={{ padding: 'var(--spacing-4)', borderRadius: 'var(--radius-sm)' }}>
              
              <div className="flex justify-between items-center mb-3 pb-3 border-b border-current border-opacity-20">
                <span className="font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center font-mono opacity-80">{idx + 1}</span>
                  {task.dept}
                </span>
                {getStatusIcon(task.status)}
              </div>
              
              <h3 className="text-base font-bold m-0 mb-4 tracking-wide text-white">{task.name}</h3>
              
              <div className="flex justify-between items-center mt-auto">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider opacity-70">
                  {task.officer || 'UNASSIGNED_NODE'}
                </span>
                
                <select 
                  className="text-xs p-1 rounded font-bold font-mono uppercase tracking-wider cursor-pointer"
                  style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: 'inherit', borderColor: 'inherit' }}
                  value={task.status}
                  onChange={(e) => handleStatusChange(task.id, e)}
                >
                  <option value="Pending" className="text-white bg-bg-main">PENDING</option>
                  <option value="In Progress" className="text-white bg-bg-main">IN PROGRESS</option>
                  <option value="Completed" className="text-white bg-bg-main">COMPLETED</option>
                  <option value="Overdue" className="text-white bg-bg-main">OVERDUE</option>
                </select>
              </div>
            </div>
            
            {idx < order.tasks.length - 1 && (
              <div className="graph-edge text-primary opacity-50 flex justify-center py-4 font-bold text-xl animate-pulse">
                ↓
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
