import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMockData } from '../../contexts/MockDataContext';
import {
  Bell,
  Check,
  WarningCircle,
  Clock,
  ArrowRight,
  ShieldCheck
} from '@phosphor-icons/react';

export default function CitizenNotifications() {
  const navigate = useNavigate();
  const { currentUser, notifications, markNotificationRead, markAllNotificationsRead } = useMockData();

  const [filter, setFilter] = useState('All'); // 'All' | 'Unread'

  const myNotifications = notifications.filter(n => n.userId === currentUser?.id);
  const unreadCount = myNotifications.filter(n => !n.read).length;

  const filtered = myNotifications.filter(n => {
    if (filter === 'Unread') return !n.read;
    return true;
  });

  const handleNotificationClick = (id, link) => {
    markNotificationRead(id);
    if (link) navigate(link);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-gray-100 border-opacity-10 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white m-0 tracking-tight">Citizen Alerts & Updates</h2>
          <p className="text-sm text-secondary m-0 mt-1">
            Real-time status updates, SLA notifications, and verification requests for your civic grievances.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            className="btn btn-secondary text-xs flex items-center gap-1.5"
            onClick={() => markAllNotificationsRead(currentUser.id)}
          >
            <Check size={14} weight="bold" />
            Mark all {unreadCount} read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setFilter('All')}
          className={`filter-chip ${filter === 'All' ? 'active' : ''}`}
        >
          All Notifications ({myNotifications.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('Unread')}
          className={`filter-chip ${filter === 'Unread' ? 'active' : ''}`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="citizen-empty-state-card py-16">
          <Bell size={40} className="text-secondary opacity-40 mb-3" />
          <h4 className="text-base font-bold text-white m-0">No alerts found</h4>
          <p className="text-xs text-secondary m-0 mt-1">
            {filter === 'Unread'
              ? 'You are all caught up! No unread notifications.'
              : 'When officers take action on your complaints, live notifications will appear here.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map(n => {
            const isResolvedAlert = n.text?.toLowerCase().includes('resolved');
            const isReopenAlert = n.text?.toLowerCase().includes('reopen');

            return (
              <div
                key={n.id}
                className={`p-4 rounded-xl border transition-all flex justify-between items-center cursor-pointer ${
                  !n.read
                    ? 'bg-surface border-primary border-opacity-35 shadow-sm'
                    : 'bg-bg-main bg-opacity-60 border-gray-100 border-opacity-10 opacity-75 hover:opacity-100'
                }`}
                onClick={() => handleNotificationClick(n.id, n.link)}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isResolvedAlert
                      ? 'bg-warning bg-opacity-15 text-warning border border-warning border-opacity-30'
                      : isReopenAlert
                      ? 'bg-danger bg-opacity-15 text-danger border border-danger border-opacity-30'
                      : 'bg-primary bg-opacity-15 text-primary border border-primary border-opacity-30'
                  }`}>
                    {isResolvedAlert ? (
                      <WarningCircle size={20} weight="fill" />
                    ) : isReopenAlert ? (
                      <Clock size={20} weight="fill" />
                    ) : (
                      <ShieldCheck size={20} weight="fill" />
                    )}
                  </div>

                  <div>
                    <p className={`text-sm m-0 leading-snug ${!n.read ? 'text-white font-semibold' : 'text-text-primary'}`}>
                      {n.text}
                    </p>
                    <span className="text-[11px] text-secondary font-mono mt-1 inline-block">
                      {new Date(n.time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-primary shadow-[var(--glow-primary)]" />
                  )}
                  {n.link && (
                    <span className="text-xs text-primary font-bold flex items-center gap-1 hover:underline">
                      View <ArrowRight size={14} />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
