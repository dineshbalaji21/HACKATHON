/* oxlint-disable react/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getStoredUsers,
  getSession,
  setSession,
  clearSession,
} from '../services/authService';

const MockDataContext = createContext();

// Helper to calculate risk score dynamically
export const calculateRiskScore = (complaint) => {
  let score = 35; // Base severity
  let factors = [];

  if (complaint.priority === 'High') { score += 20; factors.push({ factor: 'High Priority', score: 20 }); }
  if (complaint.priority === 'Critical') { score += 40; factors.push({ factor: 'Critical Priority', score: 40 }); }

  if (complaint.status === 'Overdue') {
    score += 25;
    factors.push({ factor: 'Deadline exceeded', score: 25 });
  }

  if (complaint.reopenCount > 0) {
    const rScore = complaint.reopenCount * 15;
    score += rScore;
    factors.push({ factor: `Reopened ${complaint.reopenCount} times`, score: rScore });
  }

  // Cap at 100
  return {
    total: Math.min(100, score),
    factors
  };
};

export const MockDataProvider = ({ children }) => {
  // Session-based user (persists across refreshes)
  const [currentUser, setCurrentUser] = useState(() => getSession());

  // Users are managed by authService — we read them for cross-referencing
  const [users, setUsers] = useState(() => getStoredUsers());

  const [complaints, setComplaints] = useState(() => {
    try {
      const saved = localStorage.getItem('govAction_complaints');
      if (saved) {
        return JSON.parse(saved).map(c => {
          if (!c.isParent) {
            const risk = calculateRiskScore(c);
            return { ...c, riskScore: risk.total, riskFactors: risk.factors };
          }
          return c;
        });
      }
    } catch (e) {
      console.warn('Error reading complaints from storage:', e);
    }
    return [];
  });

  const [govOrders, setGovOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('govAction_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('govAction_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist state changes to localStorage safely
  useEffect(() => {
    try {
      localStorage.setItem('govAction_complaints', JSON.stringify(complaints));
    } catch (err) {
      console.warn('Failed to save complaints:', err);
    }
  }, [complaints]);

  useEffect(() => {
    try {
      localStorage.setItem('govAction_orders', JSON.stringify(govOrders));
    } catch (err) {
      console.warn('Failed to save orders:', err);
    }
  }, [govOrders]);

  useEffect(() => {
    try {
      localStorage.setItem('govAction_notifications', JSON.stringify(notifications));
    } catch (err) {
      console.warn('Failed to save notifications:', err);
    }
  }, [notifications]);

  // Keep users in sync when authService writes new registrations
  const refreshUsers = () => setUsers(getStoredUsers());

  // ── Auth Actions ──────────────────────────────────────────────────────────

  /**
   * Called after a successful authService login. Accepts the full user object.
   */
  const login = (user) => {
    setSession(user);
    setCurrentUser(user);
    refreshUsers();
  };

  const logout = () => {
    clearSession();
    setCurrentUser(null);
  };

  // ── Notifications ─────────────────────────────────────────────────────────

  const addNotification = (userId, text, link = null) => {
    setNotifications(prev => [{
      id: `n${Date.now()}`,
      userId,
      text,
      read: false,
      time: new Date().toISOString(),
      link
    }, ...prev]);
  };

  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = (userId) => {
    setNotifications(prev => prev.map(n => n.userId === userId ? { ...n, read: true } : n));
  };

  // ── Complaints ────────────────────────────────────────────────────────────

  const addAuditTrail = (caseId, action, actor, status) => {
    setComplaints(prev => prev.map(c => {
      if (c.id === caseId) {
        return {
          ...c,
          auditTrail: [...(c.auditTrail || []), { time: new Date().toISOString(), actor, action, status }]
        };
      }
      return c;
    }));
  };

  const addComplaint = (newComplaint) => {
    const parentId = `GRV${Math.floor(Math.random() * 9000) + 1000}`;
    const now = new Date().toISOString();

    if (newComplaint.subCases && newComplaint.subCases.length > 0) {
      const parent = {
        id: parentId,
        isParent: true,
        title: newComplaint.title || 'Multiple Civic Issues',
        description: newComplaint.description,
        status: 'Pending',
        location: newComplaint.location,
        district: newComplaint.district,
        citizenId: currentUser?.id,
        auditTrail: [{ time: now, actor: currentUser?.name || 'Citizen', action: 'Submitted multi-issue complaint', status: 'Pending' }]
      };

      const children = newComplaint.subCases.map((sub, idx) => {
        const childId = `${parentId}-${String.fromCharCode(65 + idx)}`;
        const childBase = {
          ...sub,
          id: childId,
          parentId: parentId,
          title: sub.issue,
          description: newComplaint.description,
          location: newComplaint.location,
          district: newComplaint.district,
          citizenId: currentUser?.id,
          priority: newComplaint.priority || 'Medium',
          reopenCount: 0,
          evidence: [],
          messages: [],
          auditTrail: [{ time: now, actor: 'AI System', action: 'Sub-case generated from multi-issue complaint', status: 'Pending' }]
        };
        const risk = calculateRiskScore(childBase);
        return { ...childBase, riskScore: risk.total, riskFactors: risk.factors };
      });

      setComplaints(prev => [...prev, parent, ...children]);
      addNotification(currentUser?.id, `Complaint ${parentId} submitted successfully.`, `/citizen/cases/${parentId}`);
      return parentId;
    } else {
      const singleBase = {
        ...newComplaint,
        id: parentId,
        citizenId: currentUser?.id,
        reopenCount: 0,
        evidence: [],
        messages: [],
        auditTrail: [{ time: now, actor: currentUser?.name || 'Citizen', action: 'Submitted complaint', status: 'Pending' }]
      };
      const risk = calculateRiskScore(singleBase);
      const single = { ...singleBase, riskScore: risk.total, riskFactors: risk.factors };

      setComplaints(prev => [...prev, single]);
      addNotification(currentUser?.id, `Complaint ${parentId} submitted successfully.`, `/citizen/cases/${parentId}`);
      return parentId;
    }
  };

  const updateComplaintStatus = (id, newStatus, additionalData = {}) => {
    setComplaints(prev => {
      const newComplaints = prev.map(c => {
        if (c.id === id) {
          let updated = { ...c, status: newStatus, ...additionalData };

          if (newStatus === 'Reopened') {
            updated.reopenCount = (updated.reopenCount || 0) + 1;
            const deptHead = users.find(u => u.role === 'department_head' && u.departmentName === updated.department);
            if (deptHead) addNotification(deptHead.id, `Case ${id} was REOPENED by citizen.`, `/department/cases`);
          }

          if (newStatus === 'Resolved') {
            addNotification(updated.citizenId, `Case ${id} marked resolved. Please verify.`, `/citizen/cases/${id}`);
          }

          if (!updated.isParent) {
            const risk = calculateRiskScore(updated);
            updated.riskScore = risk.total;
            updated.riskFactors = risk.factors;
          }

          return updated;
        }
        return c;
      });

      // Update parent status if all children are solved
      const targetCase = newComplaints.find(c => c.id === id);
      if (targetCase && targetCase.parentId) {
        const siblings = newComplaints.filter(c => c.parentId === targetCase.parentId);
        if (siblings.every(s => s.status === 'Solved')) {
          const parentIndex = newComplaints.findIndex(c => c.id === targetCase.parentId);
          if (parentIndex > -1) {
            newComplaints[parentIndex] = { ...newComplaints[parentIndex], status: 'Solved' };
          }
        }
      }

      return newComplaints;
    });
  };

  const addMessage = (caseId, senderId, senderName, text) => {
    setComplaints(prev => prev.map(c => {
      if (c.id === caseId) {
        return {
          ...c,
          messages: [...(c.messages || []), { id: Date.now(), senderId, senderName, text, time: new Date().toISOString() }]
        };
      }
      return c;
    }));
  };

  // ── Gov Orders ────────────────────────────────────────────────────────────

  const addGovOrder = (order) => {
    setGovOrders(prev => [...prev, { ...order, id: `GO-${new Date().getFullYear()}-${Math.floor(Math.random() * 900) + 100}` }]);
  };

  const updateGovOrderTask = (orderId, taskId, status) => {
    setGovOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const newTasks = o.tasks.map(t => t.id === taskId ? { ...t, status } : t);
        const completed = newTasks.filter(t => t.status === 'Completed').length;
        const compliance = Math.round((completed / newTasks.length) * 100);
        return { ...o, tasks: newTasks, compliance };
      }
      return o;
    }));
  };

  return (
    <MockDataContext.Provider value={{
      currentUser,
      users,
      login,
      logout,
      refreshUsers,
      complaints,
      addComplaint,
      updateComplaintStatus,
      addAuditTrail,
      addMessage,
      govOrders,
      addGovOrder,
      updateGovOrderTask,
      notifications,
      markNotificationRead,
      markAllNotificationsRead,
      calculateRiskScore,
    }}>
      {children}
    </MockDataContext.Provider>
  );
};

export const useMockData = () => useContext(MockDataContext);
