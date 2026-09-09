import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MockDataProvider } from './contexts/MockDataContext';
import ProtectedRoute from './components/ProtectedRoute';

// ── Auth Pages ──────────────────────────────────────────────────────────────
import PortalSelection from './pages/auth/PortalSelection';
import CitizenAuthPage from './pages/auth/CitizenAuthPage';
import OfficerAuthPage from './pages/auth/OfficerAuthPage';
import DeptHeadAuthPage from './pages/auth/DeptHeadAuthPage';
import CollectorAuthPage from './pages/auth/CollectorAuthPage';
import AccessRestricted from './pages/auth/AccessRestricted';

// ── Citizen Pages ───────────────────────────────────────────────────────────
import CitizenLayout from './pages/citizen/CitizenLayout';
import CitizenHome from './pages/citizen/CitizenHome';
import CitizenCases from './pages/citizen/CitizenCases';
import CaseDetails from './pages/citizen/CaseDetails';
import ReportComplaint from './pages/citizen/ReportComplaint';
import AIAnalysis from './pages/citizen/AIAnalysis';
import ComplaintReview from './pages/citizen/ComplaintReview';
import CitizenNotifications from './pages/citizen/CitizenNotifications';
import CitizenProfile from './pages/citizen/CitizenProfile';

// ── Officer Pages ────────────────────────────────────────────────────────────
import OfficerDashboard from './pages/officer/OfficerDashboard';
import OfficerCases from './pages/officer/OfficerCases';
import OfficerCaseDetail from './pages/officer/OfficerCaseDetail';

// ── Department Pages ─────────────────────────────────────────────────────────
import DeptDashboard from './pages/department/DeptDashboard';
import DeptCases from './pages/department/DeptCases';
import DeptCaseDetail from './pages/department/DeptCaseDetail';
import DeptOfficers from './pages/department/DeptOfficers';

// ── Collector Pages ──────────────────────────────────────────────────────────
import CollectorDashboard from './pages/collector/CollectorDashboard';
import CollectorMap from './pages/collector/CollectorMap';
import CollectorOrders from './pages/collector/CollectorOrders';
import GovOrderDetails from './pages/collector/GovOrderDetails';

import GovLayout from './components/GovLayout';

function App() {
  return (
    <MockDataProvider>
      <BrowserRouter>
        <Routes>
          {/* Root → portal selection */}
          <Route path="/" element={<Navigate to="/auth" replace />} />

          {/* ── Auth Routes (public) ───────────────────────────────────── */}
          <Route path="/auth" element={<PortalSelection />} />
          <Route path="/auth/citizen" element={<CitizenAuthPage mode="login" />} />
          <Route path="/auth/citizen/register" element={<CitizenAuthPage mode="register" />} />
          <Route path="/auth/officer" element={<OfficerAuthPage mode="login" />} />
          <Route path="/auth/officer/register" element={<OfficerAuthPage mode="register" />} />
          <Route path="/auth/department-head" element={<DeptHeadAuthPage mode="login" />} />
          <Route path="/auth/department-head/register" element={<DeptHeadAuthPage mode="register" />} />
          <Route path="/auth/collector" element={<CollectorAuthPage mode="login" />} />
          <Route path="/auth/collector/register" element={<CollectorAuthPage mode="register" />} />

          {/* Legacy redirect — in case old bookmarks point here */}
          <Route path="/citizen/login" element={<Navigate to="/auth/citizen" replace />} />

          {/* ── Citizen Routes (protected) ─────────────────────────────── */}
          <Route
            path="/citizen"
            element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <CitizenLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/citizen/home" replace />} />
            <Route path="home" element={<CitizenHome />} />
            <Route path="cases" element={<CitizenCases />} />
            <Route path="cases/:id" element={<CaseDetails />} />
            <Route path="report" element={<ReportComplaint />} />
            <Route path="report/analysis" element={<AIAnalysis />} />
            <Route path="report/review" element={<ComplaintReview />} />
            <Route path="notifications" element={<CitizenNotifications />} />
            <Route path="profile" element={<CitizenProfile />} />
          </Route>

          {/* ── Government Routes (protected) ──────────────────────────── */}
          <Route element={<GovLayout />}>
            {/* Officer */}
            <Route path="/officer" element={<Navigate to="/officer/dashboard" replace />} />
            <Route
              path="/officer/dashboard"
              element={<ProtectedRoute allowedRoles={['officer']}><OfficerDashboard /></ProtectedRoute>}
            />
            <Route
              path="/officer/cases"
              element={<ProtectedRoute allowedRoles={['officer']}><OfficerCases /></ProtectedRoute>}
            />
            <Route
              path="/officer/priority"
              element={<ProtectedRoute allowedRoles={['officer']}><OfficerDashboard /></ProtectedRoute>}
            />
            <Route
              path="/officer/cases/:id"
              element={<ProtectedRoute allowedRoles={['officer']}><OfficerCaseDetail /></ProtectedRoute>}
            />

            {/* Department Head */}
            <Route path="/department" element={<Navigate to="/department/dashboard" replace />} />
            <Route path="/department-head" element={<Navigate to="/department/dashboard" replace />} />
            <Route path="/department-head/dashboard" element={<Navigate to="/department/dashboard" replace />} />
            <Route path="/department-head/cases" element={<Navigate to="/department/cases" replace />} />
            <Route path="/department-head/cases/:id" element={<ProtectedRoute allowedRoles={['department_head']}><DeptCaseDetail /></ProtectedRoute>} />
            <Route path="/department-head/officers" element={<Navigate to="/department/officers" replace />} />
            <Route
              path="/department/dashboard"
              element={<ProtectedRoute allowedRoles={['department_head']}><DeptDashboard /></ProtectedRoute>}
            />
            <Route
              path="/department/cases"
              element={<ProtectedRoute allowedRoles={['department_head']}><DeptCases /></ProtectedRoute>}
            />
            <Route
              path="/department/cases/:id"
              element={<ProtectedRoute allowedRoles={['department_head']}><DeptCaseDetail /></ProtectedRoute>}
            />
            <Route
              path="/department/officers"
              element={<ProtectedRoute allowedRoles={['department_head']}><DeptOfficers /></ProtectedRoute>}
            />

            {/* Collector */}
            <Route path="/collector" element={<Navigate to="/collector/dashboard" replace />} />
            <Route
              path="/collector/dashboard"
              element={<ProtectedRoute allowedRoles={['district_collector']}><CollectorDashboard /></ProtectedRoute>}
            />
            <Route
              path="/collector/departments"
              element={<ProtectedRoute allowedRoles={['district_collector']}><CollectorDashboard /></ProtectedRoute>}
            />
            <Route
              path="/collector/map"
              element={<ProtectedRoute allowedRoles={['district_collector']}><CollectorMap /></ProtectedRoute>}
            />
            <Route
              path="/collector/orders"
              element={<ProtectedRoute allowedRoles={['district_collector']}><CollectorOrders /></ProtectedRoute>}
            />
            <Route
              path="/collector/orders/:id"
              element={<ProtectedRoute allowedRoles={['district_collector']}><GovOrderDetails /></ProtectedRoute>}
            />
          </Route>

          {/* ── Catch-all ──────────────────────────────────────────────── */}
          <Route path="/access-restricted" element={<AccessRestricted />} />
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      </BrowserRouter>
    </MockDataProvider>
  );
}

export default App;
