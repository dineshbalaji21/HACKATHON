import React from 'react';
import { Navigate } from 'react-router-dom';
import { useMockData } from '../contexts/MockDataContext';
import AccessRestricted from '../pages/auth/AccessRestricted';

const _ROLE_PREFIXES = {
  citizen: ['/citizen'],
  officer: ['/officer'],
  department_head: ['/department'],
  district_collector: ['/collector', '/department', '/officer'], // collector can see dept/officer routes read-only
};

/**
 * ProtectedRoute — wraps routes that require authentication.
 * 
 * Props:
 *  - allowedRoles: string[] — list of roles that can access the wrapped route
 *  - children: React node
 */
export default function ProtectedRoute({ allowedRoles, children }) {
  const { currentUser } = useMockData();

  // Not logged in → send to portal selection
  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }

  // Wrong role → show restricted page
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <AccessRestricted />;
  }

  return children;
}
