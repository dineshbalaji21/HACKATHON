import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMockData } from '../../contexts/MockDataContext';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { ShieldCheck, User, PoliceCar, Buildings, MapTrifold, WarningCircle } from '@phosphor-icons/react';

export default function CitizenLogin() {
  const navigate = useNavigate();
  const { login, users, resetMockData } = useMockData();
  const [resetting, setResetting] = useState(false);

  const handleLogin = (user) => {
    login(user);
    if (user.role === 'citizen') navigate('/citizen/home');
    if (user.role === 'officer') navigate('/officer/dashboard');
    if (user.role === 'department') navigate('/department/dashboard');
    if (user.role === 'collector') navigate('/collector/dashboard');
  };

  const handleReset = () => {
    setResetting(true);
    resetMockData();
    setTimeout(() => {
      setResetting(false);
      window.location.reload();
    }, 1000);
  };

  const citizens = users.filter(u => u.role === 'citizen');
  const officers = users.filter(u => u.role === 'officer');
  const departments = users.filter(u => u.role === 'department');
  const collectors = users.filter(u => u.role === 'collector');

  return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center p-4 relative overflow-hidden" style={{ backgroundImage: 'radial-gradient(circle at 50% -20%, var(--bg-surface) 0%, transparent 60%)' }}>
      
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(57, 230, 208, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(57, 230, 208, 0.2) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <div className="max-w-4xl w-full flex flex-col gap-8 relative z-10">
        <div className="text-center animate-fade-in">
          <ShieldCheck size={64} className="mx-auto mb-4 text-primary animate-ai-glow" weight="fill" />
          <h1 className="text-4xl font-bold text-primary mb-2 tracking-widest">GovAction AI</h1>
          <p className="text-secondary text-sm font-mono tracking-widest uppercase">Civic Intelligence & Action Command Center</p>
        </div>

        <div className="grid grid-cols-2 gap-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          
          <Card className="bg-surface-hover border-opacity-30 border-primary">
            <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
              <User size={18} /> Public Portal
            </h2>
            <div className="flex flex-col gap-2">
              {citizens.map(u => (
                <Button key={u.id} variant="ghost" className="justify-start bg-bg-main border border-gray-100 border-opacity-10 hover:border-primary text-xs font-mono uppercase" onClick={() => handleLogin(u)}>
                  Log in as {u.name}
                </Button>
              ))}
            </div>
          </Card>

          <Card className="bg-surface-hover border-opacity-30 border-secondary">
            <h2 className="text-sm font-bold uppercase tracking-widest text-secondary mb-4 flex items-center gap-2">
              <PoliceCar size={18} /> Field Operations
            </h2>
            <div className="flex flex-col gap-2">
              {officers.map(u => (
                <Button key={u.id} variant="ghost" className="justify-start bg-bg-main border border-gray-100 border-opacity-10 hover:border-secondary text-xs font-mono uppercase" onClick={() => handleLogin(u)}>
                  {u.name} ({u.department})
                </Button>
              ))}
            </div>
          </Card>

          <Card className="bg-surface-hover border-opacity-30 border-warning">
            <h2 className="text-sm font-bold uppercase tracking-widest text-warning mb-4 flex items-center gap-2">
              <Buildings size={18} /> Department Command
            </h2>
            <div className="flex flex-col gap-2">
              {departments.map(u => (
                <Button key={u.id} variant="ghost" className="justify-start bg-bg-main border border-gray-100 border-opacity-10 hover:border-warning text-xs font-mono uppercase" onClick={() => handleLogin(u)}>
                  {u.name} ({u.department})
                </Button>
              ))}
            </div>
          </Card>

          <Card className="bg-surface-hover border-opacity-30 border-danger">
            <h2 className="text-sm font-bold uppercase tracking-widest text-danger mb-4 flex items-center gap-2">
              <MapTrifold size={18} /> District Administrator
            </h2>
            <div className="flex flex-col gap-2">
              {collectors.map(u => (
                <Button key={u.id} variant="ghost" className="justify-start bg-bg-main border border-gray-100 border-opacity-10 hover:border-danger text-xs font-mono uppercase" onClick={() => handleLogin(u)}>
                  {u.name}
                </Button>
              ))}
            </div>
          </Card>
        </div>

        <div className="text-center mt-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <Button 
            variant="ghost" 
            className="text-secondary text-[10px] uppercase font-bold tracking-widest opacity-50 hover:opacity-100 hover:text-danger" 
            onClick={handleReset}
            disabled={resetting}
          >
            <WarningCircle size={14} className="mr-1" />
            {resetting ? 'Purging Systems...' : 'Reset AI Core Data'}
          </Button>
        </div>
      </div>
    </div>
  );
}
