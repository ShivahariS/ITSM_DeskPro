import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import { ROLES, ROLE_HOME } from './lib/constants.js';
import ProtectedRoute from './components/layout/ProtectedRoute.jsx';
import AppLayout from './components/layout/AppLayout.jsx';

// Auth
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';

// Shared
import NotificationsPage from './pages/shared/NotificationsPage.jsx';
import NotFound from './pages/shared/NotFound.jsx';
import UserProfile from './pages/shared/UserProfile.jsx';

// End User
import EndUserDashboard from './pages/enduser/Dashboard.jsx';
import EndUserCatalog from './pages/enduser/ServiceCatalog.jsx';
import EndUserRequests from './pages/enduser/MyRequests.jsx';
import EndUserReportIncident from './pages/enduser/ReportIncident.jsx';
import EndUserTickets from './pages/enduser/MyTickets.jsx';

// L1 Support
import L1Overview from './pages/l1/Overview.jsx';
import L1IncidentQueue from './pages/l1/IncidentQueue.jsx';
import L1MyTickets from './pages/l1/MyTickets.jsx';
import L1ServiceRequests from './pages/l1/ServiceRequestsQueue.jsx';
import L1Escalations from './pages/l1/Escalations.jsx';

// L2 Support
import L2Hub from './pages/l2/Hub.jsx';
import L2EscalatedQueue from './pages/l2/EscalatedQueue.jsx';
import L2Problems from './pages/l2/ProblemManagement.jsx';
import L2CiMapping from './pages/l2/CiMapping.jsx';

// L3 Support
import L3MajorIncidents from './pages/l3/MajorIncidents.jsx';
import L3Kedb from './pages/l3/Kedb.jsx';
import L3RequestChange from './pages/l3/RequestChange.jsx';
import L3Reports from './pages/l3/TechnicalReports.jsx';

// Change Manager
import ChangeOverview from './pages/change/Overview.jsx';
import ChangeQueue from './pages/change/ChangeQueue.jsx';
import ChangeCab from './pages/change/CabConsole.jsx';
import ChangeCalendar from './pages/change/ChangeCalendar.jsx';
import ChangePir from './pages/change/PirTracker.jsx';

// Asset Manager
import AssetAnalytics from './pages/asset/Analytics.jsx';
import AssetPendingRequests from './pages/asset/PendingRequests.jsx';
import AssetHardware from './pages/asset/HardwareInventory.jsx';
import AssetLicenses from './pages/asset/SoftwareLicenses.jsx';
import AssetCmdb from './pages/asset/Cmdb.jsx';
import AssetExpiry from './pages/asset/ExpiryAlerts.jsx';

// Admin
import AdminAnalytics from './pages/admin/Analytics.jsx';
import AdminUsers from './pages/admin/UserManagement.jsx';
import AdminCatalog from './pages/admin/CatalogBuilder.jsx';
import AdminAudit from './pages/admin/AuditLogs.jsx';

function RootRedirect() {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={ROLE_HOME[role] || '/login'} replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Authenticated app shell */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/profile" element={<UserProfile />} />

        {/* End User */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.END_USER]} />}>
          <Route path="/enduser/dashboard" element={<EndUserDashboard />} />
          <Route path="/enduser/catalog" element={<EndUserCatalog />} />
          <Route path="/enduser/my-requests" element={<EndUserRequests />} />
          <Route path="/enduser/report-incident" element={<EndUserReportIncident />} />
          <Route path="/enduser/my-tickets" element={<EndUserTickets />} />
          <Route path="/enduser/notifications" element={<NotificationsPage />} />
        </Route>

        {/* L1 Support */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.L1_SUPPORT]} />}>
          <Route path="/l1/overview" element={<L1Overview />} />
          <Route path="/l1/incident-queue" element={<L1IncidentQueue />} />
          <Route path="/l1/my-tickets" element={<L1MyTickets />} />
          <Route path="/l1/service-requests" element={<L1ServiceRequests />} />
          <Route path="/l1/escalations" element={<L1Escalations />} />
          <Route path="/l1/notifications" element={<NotificationsPage />} />
        </Route>

        {/* L2 Support */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.L2_SUPPORT]} />}>
          <Route path="/l2/hub" element={<L2Hub />} />
          <Route path="/l2/escalated-queue" element={<L2EscalatedQueue />} />
          <Route path="/l2/problems" element={<L2Problems />} />
          <Route path="/l2/ci-mapping" element={<L2CiMapping />} />
          <Route path="/l2/notifications" element={<NotificationsPage />} />
        </Route>

        {/* L3 Support */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.L3_SUPPORT]} />}>
          <Route path="/l3/major-incidents" element={<L3MajorIncidents />} />
          <Route path="/l3/kedb" element={<L3Kedb />} />
          <Route path="/l3/request-change" element={<L3RequestChange />} />
          <Route path="/l3/reports" element={<L3Reports />} />
          <Route path="/l3/notifications" element={<NotificationsPage />} />
        </Route>

        {/* Change Manager */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.CHANGE_MANAGER]} />}>
          <Route path="/change/overview" element={<ChangeOverview />} />
          <Route path="/change/queue" element={<ChangeQueue />} />
          <Route path="/change/cab" element={<ChangeCab />} />
          <Route path="/change/calendar" element={<ChangeCalendar />} />
          <Route path="/change/pir" element={<ChangePir />} />
        </Route>

        {/* Asset Manager */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.ASSET_MANAGER]} />}>
          <Route path="/asset/analytics" element={<AssetAnalytics />} />
          <Route path="/asset/pending-requests" element={<AssetPendingRequests />} />
          <Route path="/asset/hardware" element={<AssetHardware />} />
          <Route path="/asset/licenses" element={<AssetLicenses />} />
          <Route path="/asset/cmdb" element={<AssetCmdb />} />
          <Route path="/asset/expiry" element={<AssetExpiry />} />
        </Route>

        {/* Admin */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/catalog" element={<AdminCatalog />} />
          <Route path="/admin/audit-logs" element={<AdminAudit />} />
          <Route path="/admin/notifications" element={<NotificationsPage />} />
        </Route>
      </Route>

      {/* Root + fallback */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}