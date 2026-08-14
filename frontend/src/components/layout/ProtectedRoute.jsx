import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLE_HOME } from '../../lib/constants.js';

// Guards routes: requires auth, and optionally restricts to specific roles.
// Renders `children` when provided, otherwise a nested <Outlet/> (for layout/group routes).
export default function ProtectedRoute({ allowedRoles, children }) {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Authenticated but wrong workspace — send them to their own home.
    return <Navigate to={ROLE_HOME[role] || '/login'} replace />;
  }

  return children ?? <Outlet />;
}
