import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useMockData } from '../../contexts/MockDataContext';
import {
  House,
  FolderOpen,
  PlusCircle,
  Path,
  Bell,
  ChatCircleDots,
  User,
  Question,
  SignOut,
  ShieldCheck,
  MagnifyingGlass,
  List,
  X,
  CaretRight,
  Info,
  PhoneCall,
  PaperPlaneRight
} from '@phosphor-icons/react';
import './CitizenLayout.css';
import ProfileHoverCard from '../../components/ProfileHoverCard';
import Tooltip from '../../components/Tooltip';

export default function CitizenLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout, notifications, complaints, addMessage } = useMockData();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [messagesModalOpen, setMessagesModalOpen] = useState(false);
  const [activeMessageCaseId, setActiveMessageCaseId] = useState(null);
  const [quickMessageText, setQuickMessageText] = useState('');

  if (!currentUser || currentUser.role !== 'citizen') {
    navigate('/auth');
    return null;
  }

  const unreadCount = notifications.filter(n => n.userId === currentUser.id && !n.read).length;
  const myCases = complaints.filter(c => c.citizenId === currentUser.id && !c.isParent);
  const casesWithMessages = myCases.filter(c => c.messages && c.messages.length > 0);

  const navItems = [
    { path: '/citizen/home', icon: House, label: 'Overview' },
    { path: '/citizen/cases', icon: FolderOpen, label: 'My Cases' },
    { path: '/citizen/report', icon: PlusCircle, label: 'Report an Issue' },
    {
      path: '/citizen/cases?filter=Active',
      icon: Path,
      label: 'Track Resolution',
      onClick: () => navigate('/citizen/cases', { state: { defaultFilter: 'Active' } })
    },
    { path: '/citizen/notifications', icon: Bell, label: 'Notifications', badge: unreadCount },
    {
      path: '#messages',
      icon: ChatCircleDots,
      label: 'Messages',
      onClick: () => {
        if (myCases.length > 0 && !activeMessageCaseId) {
          setActiveMessageCaseId(myCases[0].id);
        }
        setMessagesModalOpen(true);
      }
    },
    { path: '/citizen/profile', icon: User, label: 'My Profile' },
    {
      path: '#help',
      icon: Question,
      label: 'Help & Support',
      onClick: () => setSupportModalOpen(true)
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  // Compute breadcrumb label
  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path.includes('/citizen/home')) return 'Overview';
    if (path.includes('/citizen/report')) return 'Report an Issue';
    if (path.includes('/citizen/cases/') && path.split('/').length > 3) return 'Case Details';
    if (path.includes('/citizen/cases')) return 'My Cases';
    if (path.includes('/citizen/notifications')) return 'Notifications';
    if (path.includes('/citizen/profile')) return 'My Profile';
    return 'Portal';
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/citizen/home')) return 'Citizen Portal';
    if (path.includes('/citizen/report')) return 'Report a Civic Issue';
    if (path.includes('/citizen/cases/') && path.split('/').length > 3) return 'Case Resolution Tracking';
    if (path.includes('/citizen/cases')) return 'My Grievance Cases';
    if (path.includes('/citizen/notifications')) return 'Citizen Alerts & Updates';
    if (path.includes('/citizen/profile')) return 'Citizen Profile & Verification';
    return 'Citizen Portal';
  };

  const selectedCaseForMessage = myCases.find(c => c.id === activeMessageCaseId) || myCases[0];

  const handleSendQuickMessage = () => {
    if (!quickMessageText.trim() || !selectedCaseForMessage) return;
    addMessage(selectedCaseForMessage.id, currentUser.id, currentUser.name, quickMessageText.trim());
    setQuickMessageText('');
  };

  return (
    <div className="citizen-desktop-layout role-citizen">
      {/* Mobile Drawer Overlay */}
      <div
        className={`citizen-drawer-overlay ${mobileMenuOpen ? 'active' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Left Desktop Sidebar */}
      <aside className={`citizen-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        {/* Brand Header */}
        <div className="citizen-sidebar-header">
          <div className="citizen-brand">
            <div className="citizen-brand-icon">
              <ShieldCheck size={24} weight="fill" />
            </div>
            <div>
              <h2 className="citizen-brand-name">GovAction AI</h2>
              <p className="citizen-brand-tag">Citizen Portal</p>
            </div>
          </div>
          <div className="citizen-system-status">
            <span className="status-pulse-dot" />
            AI CIVIC ENGINE LIVE
          </div>
        </div>

        {/* Navigation items */}
        <nav className="citizen-sidebar-nav">
          {navItems.map(item => {
            const Icon = item.icon;
            const isPathActive = item.path !== '#help' && item.path !== '#messages' && (
              location.pathname === item.path ||
              (item.path.startsWith('/citizen/cases') && location.pathname.startsWith('/citizen/cases')) ||
              (item.path.startsWith('/citizen/report') && location.pathname.startsWith('/citizen/report'))
            );

            return (
              <button
                key={item.label}
                type="button"
                className={`citizen-nav-item ${isPathActive ? 'active' : ''}`}
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (item.onClick) {
                    item.onClick();
                  } else {
                    navigate(item.path);
                  }
                }}
              >
                <div className="citizen-nav-left">
                  <Icon size={19} weight={isPathActive ? 'fill' : 'regular'} />
                  <span>{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span className="citizen-badge-count">{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer / Citizen Account */}
        <div className="citizen-sidebar-footer">
          <ProfileHoverCard user={currentUser} profilePath="/citizen/profile">
            <div
              className="citizen-user-summary"
              onClick={() => navigate('/citizen/profile')}
              title="View Profile Details"
            >
              <div className="citizen-avatar-box">
                {currentUser.name?.charAt(0) || 'C'}
              </div>
              <div className="citizen-user-meta">
                <p className="citizen-user-name">{currentUser.name || 'Citizen'}</p>
                <p className="citizen-user-district">
                  {currentUser.district ? `${currentUser.district} Jurisdiction` : 'Verified Resident'}
                </p>
              </div>
            </div>
          </ProfileHoverCard>

          <button
            type="button"
            className="citizen-logout-btn"
            onClick={handleLogout}
          >
            <SignOut size={16} weight="bold" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="citizen-main-area">
        {/* Top Header */}
        <header className="citizen-top-header">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="citizen-mobile-hamburger"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open Navigation"
            >
              <List size={24} />
            </button>

            <div className="citizen-header-left">
              <div className="citizen-breadcrumbs">
                <span>Home</span>
                <CaretRight size={10} />
                <span>Citizen Portal</span>
                <CaretRight size={10} />
                <span style={{ color: 'var(--primary, #39E6D0)' }}>{getBreadcrumb()}</span>
              </div>
              <h1 className="citizen-page-title">{getPageTitle()}</h1>
            </div>
          </div>

          <div className="citizen-header-right">
            {/* Quick Search */}
            <div className="citizen-search-bar">
              <MagnifyingGlass size={16} className="citizen-search-icon" />
              <input
                type="text"
                className="citizen-search-input"
                placeholder="Search issues, cases..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    navigate('/citizen/cases', { state: { searchQuery: e.target.value.trim() } });
                  }
                }}
              />
              <span className="citizen-search-shortcut">↵</span>
            </div>

            {/* Notifications Button */}
            <Tooltip content={unreadCount > 0 ? `${unreadCount} Unread Notifications` : 'Notifications'}>
              <button
                type="button"
                className="citizen-icon-btn"
                onClick={() => navigate('/citizen/notifications')}
                aria-label="Notifications"
              >
                <Bell size={19} />
                {unreadCount > 0 && <span className="citizen-icon-badge" />}
              </button>
            </Tooltip>

            {/* Messages Button */}
            <Tooltip content="Case Communications">
              <button
                type="button"
                className="citizen-icon-btn"
                onClick={() => {
                  if (myCases.length > 0 && !activeMessageCaseId) {
                    setActiveMessageCaseId(myCases[0].id);
                  }
                  setMessagesModalOpen(true);
                }}
                aria-label="Case Communications"
              >
                <ChatCircleDots size={19} />
                {casesWithMessages.length > 0 && (
                  <span className="citizen-icon-badge" style={{ background: 'var(--primary, #35D6C3)' }} />
                )}
              </button>
            </Tooltip>

            {/* User Profile Pill */}
            <ProfileHoverCard user={currentUser} profilePath="/citizen/profile">
              <div
                className="citizen-profile-pill"
                onClick={() => navigate('/citizen/profile')}
                style={{ cursor: 'pointer' }}
              >
                <div className="citizen-header-avatar">
                  {currentUser.name?.charAt(0) || 'C'}
                </div>
                <div className="citizen-profile-info">
                  <span className="citizen-profile-name">{currentUser.name?.split(' ')[0] || 'Citizen'}</span>
                  <span className="citizen-profile-role">Citizen</span>
                </div>
              </div>
            </ProfileHoverCard>
          </div>
        </header>

        {/* Viewport Content */}
        <main className="citizen-viewport">
          <Outlet />
        </main>
      </div>

      {/* Help & Support Modal */}
      {supportModalOpen && (
        <div className="citizen-modal-backdrop" onClick={() => setSupportModalOpen(false)}>
          <div className="citizen-modal-box" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-100 border-opacity-10 flex justify-between items-center bg-bg-surface">
              <div className="flex items-center gap-2">
                <Question size={22} className="text-primary" weight="fill" />
                <h3 className="m-0 text-base font-bold text-white uppercase tracking-wider">Citizen Support & SLA Guidelines</h3>
              </div>
              <button
                type="button"
                className="bg-transparent border-none text-secondary hover:text-white cursor-pointer p-1"
                onClick={() => setSupportModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4 text-sm text-secondary">
              <div className="p-3 rounded-lg bg-bg-main border border-primary border-opacity-20 flex items-start gap-3">
                <Info size={24} className="text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-primary font-bold m-0 text-sm mb-1">How GovAction AI Works</h4>
                  <p className="m-0 text-xs leading-relaxed opacity-90">
                    When you report a grievance, our AI automatically analyzes the description and evidence, maps it to the precise municipal department, sets an enforceable SLA deadline, and dispatches the task to the responsible field officer.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-bg-main border border-gray-100 border-opacity-10">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-1">High Priority SLA</span>
                  <p className="m-0 font-bold text-white text-sm">24 – 48 Hours</p>
                  <p className="m-0 text-[11px] text-secondary mt-1">Streetlight outages, drainage blockage, hazardous debris.</p>
                </div>
                <div className="p-3 rounded-lg bg-bg-main border border-gray-100 border-opacity-10">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-secondary block mb-1">Standard SLA</span>
                  <p className="m-0 font-bold text-white text-sm">3 – 7 Working Days</p>
                  <p className="m-0 text-[11px] text-secondary mt-1">Road resurfacing, civic amenities, park maintenance.</p>
                </div>
              </div>

              <div className="border-t border-gray-100 border-opacity-10 pt-4 flex justify-between items-center text-xs">
                <div className="flex items-center gap-2 text-white">
                  <PhoneCall size={16} className="text-success" />
                  <span>Helpline: <strong>1800-425-CIVIC</strong> (Toll Free)</span>
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setSupportModalOpen(false)}
                >
                  Understood
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages Modal */}
      {messagesModalOpen && (
        <div className="citizen-modal-backdrop" onClick={() => setMessagesModalOpen(false)}>
          <div className="citizen-modal-box" style={{ maxWidth: '680px' }} onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-100 border-opacity-10 flex justify-between items-center bg-bg-surface">
              <div className="flex items-center gap-2">
                <ChatCircleDots size={22} className="text-primary" weight="fill" />
                <h3 className="m-0 text-base font-bold text-white uppercase tracking-wider">Direct Officer Communications</h3>
              </div>
              <button
                type="button"
                className="bg-transparent border-none text-secondary hover:text-white cursor-pointer p-1"
                onClick={() => setMessagesModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            {myCases.length === 0 ? (
              <div className="p-8 text-center text-secondary">
                <FolderOpen size={40} className="mx-auto mb-2 opacity-40 text-primary" />
                <p className="text-sm font-semibold mb-1">No Active Cases for Messaging</p>
                <p className="text-xs opacity-70">Submit a grievance to enable direct communications with the assigned department officer.</p>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row min-h-[380px]">
                {/* Case selector column */}
                <div className="w-full md:w-56 border-r border-gray-100 border-opacity-10 p-2 overflow-y-auto bg-bg-main">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-secondary px-2 py-1 mb-1">Your Cases</p>
                  {myCases.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      className={`w-full text-left p-2.5 rounded-md mb-1 transition-all border ${selectedCaseForMessage?.id === c.id ? 'bg-primary bg-opacity-15 border-primary border-opacity-40 text-primary' : 'bg-transparent border-transparent text-secondary hover:bg-surface'}`}
                      onClick={() => setActiveMessageCaseId(c.id)}
                    >
                      <span className="text-[10px] font-mono block opacity-75">{c.id}</span>
                      <span className="text-xs font-bold block truncate text-white">{c.title || c.issue}</span>
                      <span className="text-[10px] block opacity-60 mt-0.5">{c.department}</span>
                    </button>
                  ))}
                </div>

                {/* Conversation area */}
                <div className="flex-1 flex flex-col bg-bg-surface">
                  <div className="p-3 border-b border-gray-100 border-opacity-10 flex justify-between items-center bg-bg-main bg-opacity-40">
                    <div>
                      <p className="text-xs font-bold text-white m-0 truncate">{selectedCaseForMessage?.title || selectedCaseForMessage?.issue}</p>
                      <p className="text-[10px] text-primary m-0 font-mono">Assigned: {selectedCaseForMessage?.assignedOfficerName || 'Officer Auto-dispatching'}</p>
                    </div>
                    <button
                      type="button"
                      className="text-[10px] font-bold uppercase tracking-wider text-primary bg-transparent border-none cursor-pointer underline"
                      onClick={() => {
                        setMessagesModalOpen(false);
                        navigate(`/citizen/cases/${selectedCaseForMessage?.id}`);
                      }}
                    >
                      View Case →
                    </button>
                  </div>

                  {/* Messages Feed */}
                  <div className="flex-1 p-4 flex flex-col gap-3 overflow-y-auto max-h-[260px]">
                    {!selectedCaseForMessage?.messages || selectedCaseForMessage.messages.length === 0 ? (
                      <p className="text-xs text-secondary text-center italic my-auto opacity-75">
                        No messages exchanged yet. Send an inquiry or update regarding this ticket.
                      </p>
                    ) : (
                      selectedCaseForMessage.messages.map((msg, i) => {
                        const isMe = msg.senderId === currentUser.id;
                        return (
                          <div key={msg.id || i} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                            <div className="w-7 h-7 rounded-md bg-gray-700 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white">
                              {msg.senderName?.[0] || 'O'}
                            </div>
                            <div className={`p-2.5 rounded-lg text-xs max-w-[80%] ${isMe ? 'bg-primary bg-opacity-20 text-white rounded-tr-none border border-primary border-opacity-30' : 'bg-bg-main text-secondary rounded-tl-none border border-gray-100 border-opacity-10'}`}>
                              <p className="m-0 font-bold text-[9px] uppercase tracking-wider text-primary mb-1">{msg.senderName}</p>
                              <p className="m-0 leading-relaxed text-text-primary">{msg.text}</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="p-3 border-t border-gray-100 border-opacity-10 flex gap-2 bg-bg-main">
                    <input
                      type="text"
                      className="flex-1 p-2 rounded text-xs border border-gray-100 border-opacity-20 bg-bg-surface text-white outline-none focus:border-primary"
                      placeholder="Type a message to the department officer..."
                      value={quickMessageText}
                      onChange={e => setQuickMessageText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSendQuickMessage()}
                    />
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ padding: '0.5rem 1rem' }}
                      onClick={handleSendQuickMessage}
                    >
                      <PaperPlaneRight size={16} weight="fill" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
