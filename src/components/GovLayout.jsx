import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useMockData } from '../contexts/MockDataContext';
import {
  SquaresFour,
  FolderOpen,
  ShieldCheck,
  ChartBar,
  MapPin,
  SignOut,
  Bell,
  IdentificationCard,
  Buildings,
  Crown,
} from '@phosphor-icons/react';
import ProfileHoverCard from './ProfileHoverCard';
import Tooltip from './Tooltip';

export default function GovLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout, notifications } = useMockData();

  // Redirect non-gov users
  if (!currentUser || currentUser.role === 'citizen') {
    // Handled by ProtectedRoute — this is a fallback
    navigate('/auth');
    return null;
  }

  const role = currentUser.role;
  const unreadCount = notifications.filter(n => n.userId === currentUser.id && !n.read).length;

  const getNavItems = () => {
    switch (role) {
      case 'officer':
        return [
          { path: '/officer/dashboard', icon: SquaresFour, label: 'Dashboard' },
          { path: '/officer/cases', icon: FolderOpen, label: 'My Cases' },
        ];
      case 'department_head':
        return [
          { path: '/department/dashboard', icon: SquaresFour, label: 'Dashboard' },
          { path: '/department/cases', icon: FolderOpen, label: 'Department Cases' },
          { path: '/department/officers', icon: ChartBar, label: 'Officer Performance' },
        ];
      case 'district_collector':
        return [
          { path: '/collector/dashboard', icon: ShieldCheck, label: 'Command Center' },
          { path: '/collector/map', icon: MapPin, label: 'District Hotspots' },
          { path: '/collector/orders', icon: FolderOpen, label: 'Gov Orders' },
        ];
      default:
        return [];
    }
  };

  const getRoleLabel = () => {
    switch (role) {
      case 'officer': return 'Field Officer';
      case 'department_head': return 'Department Head';
      case 'district_collector': return 'District Collector';
      default: return role;
    }
  };

  const getRoleIcon = () => {
    switch (role) {
      case 'officer': return <IdentificationCard size={16} />;
      case 'department_head': return <Buildings size={16} />;
      case 'district_collector': return <Crown size={16} />;
      default: return null;
    }
  };

  const getSubId = () => {
    if (role === 'officer') return currentUser.officerId || currentUser.employeeId || '';
    if (role === 'department_head') return currentUser.headId || '';
    if (role === 'district_collector') return currentUser.collectorId || '';
    return '';
  };

  const navItems = getNavItems();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className={`dashboard-layout role-${role}`}>
      <aside className="dashboard-sidebar">
        <div className="p-6 border-b border-gray-100 border-opacity-10">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck size={24} className="text-primary" weight="fill" />
            <h2 className="text-xl m-0 text-primary uppercase tracking-wider">GovAction AI</h2>
          </div>
          <p className="text-xs text-secondary mt-1 tracking-wider uppercase font-semibold flex items-center gap-1.5">
            {getRoleIcon()} {getRoleLabel()} • {currentUser.district}
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-success bg-success-bg bg-opacity-10 p-1.5 rounded border border-success border-opacity-20 inline-flex">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
            SYSTEM OPERATIONAL
          </div>
        </div>

        <nav style={{ flex: 1, padding: 'var(--spacing-6) 0' }} className="flex flex-col gap-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path ||
              (location.pathname.startsWith(item.path) &&
                item.path !== '/officer/dashboard' &&
                item.path !== '/department/dashboard' &&
                item.path !== '/collector/dashboard');
            return (
              <div
                key={item.path}
                onClick={() => navigate(item.path)}
                className="relative flex items-center gap-3 px-6 py-3 cursor-pointer transition-all"
                style={{
                  backgroundColor: isActive ? 'rgba(16, 47, 49, 0.9)' : 'transparent',
                  color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                }}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[var(--glow-primary)]"></div>
                )}
                <Icon size={20} weight={isActive ? 'fill' : 'regular'} />
                <span className={`text-sm ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
              </div>
            );
          })}
        </nav>

        <div className="p-6 border-t border-gray-100 border-opacity-10 bg-surface bg-opacity-50">
          <Tooltip content="Active Operational & Escalation Alerts">
            <div className="flex justify-between items-center mb-6 cursor-pointer hover:text-primary transition-colors text-secondary">
              <div className="flex items-center gap-2">
                <Bell size={20} />
                <span className="font-semibold text-sm">Alerts</span>
              </div>
              {unreadCount > 0 && (
                <span className="bg-danger text-white text-xs font-bold px-2 py-0.5 rounded-sm">{unreadCount}</span>
              )}
            </div>
          </Tooltip>

          {/* Profile block with hover card */}
          <ProfileHoverCard user={currentUser} profilePath={location.pathname}>
            <div className="flex items-center gap-3 mb-2 cursor-pointer p-1.5 -mx-1.5 rounded-lg hover:bg-surface transition-colors">
              <div className="w-10 h-10 rounded-md bg-primary bg-opacity-20 border border-primary border-opacity-30 text-primary flex items-center justify-center font-bold text-lg flex-shrink-0">
                {currentUser.name?.[0] || '?'}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <p className="text-sm font-bold truncate text-primary m-0">{currentUser.name}</p>
                <p className="text-xs text-secondary truncate m-0 mt-0.5">
                  {currentUser.departmentName || currentUser.district || ''}
                </p>
              </div>
            </div>
          </ProfileHoverCard>
          {getSubId() && (
            <p className="text-xs font-mono text-secondary mb-4 opacity-70 pl-1">{getSubId()}</p>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-2 bg-transparent border border-danger border-opacity-30 text-danger rounded-md cursor-pointer font-semibold hover:bg-danger hover:bg-opacity-10 transition-all text-xs tracking-wider"
          >
            <SignOut size={16} /> SECURE LOGOUT
          </button>
        </div>
      </aside>

      <main className="dashboard-content p-8">
        <Outlet />
      </main>
    </div>
  );
}
