import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLE_HOME } from '../../lib/constants.js';

export default function NotFound() {
  const { isAuthenticated, role } = useAuth();
  const home = isAuthenticated ? ROLE_HOME[role] || '/' : '/login';
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-mint px-6 text-center">
      <p className="text-6xl font-extrabold text-plum">404</p>
      <p className="mt-2 text-lg font-semibold text-slateblue-700">Page not found</p>
      <p className="mt-1 text-sm text-slateblue-500">The page you're looking for doesn't exist.</p>
      <Link to={home} className="btn-primary mt-6">
        Back to safety
      </Link>
    </div>
  );
}
