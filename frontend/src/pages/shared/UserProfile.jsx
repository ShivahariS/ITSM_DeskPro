// import { useCallback } from 'react';
// import { User, Mail, Phone, Shield, Users, MapPin, Info } from 'lucide-react';
// import { useAuth } from '../../context/AuthContext.jsx';
// import { getUser } from '../../api/users.js';
// import { useAsync } from '../../lib/hooks.js';
// import { ROLE_LABELS, USER_STATUS_BADGE, TEAMS } from '../../lib/constants.js';
// import { initials } from '../../lib/format.js';
// import { PageHeader, Card, Loading, ErrorState } from '../../components/ui/index.jsx';
// import StatusBadge from '../../components/common/StatusBadge.jsx';
//
// export default function UserProfile() {
//   const { user, role } = useAuth();
//
//   const fetcher = useCallback(() => {
//     // Only ADMIN and Support roles have permissions to hit `/users/{id}` endpoint
//     if (['ADMIN', 'L1_SUPPORT', 'L2_SUPPORT', 'L3_SUPPORT'].includes(role)) {
//       return getUser(user.userID);
//     }
//     return Promise.resolve(null);
//   }, [role, user?.userID]);
//
//   const { data, loading, error, reload } = useAsync(fetcher, [fetcher]);
//
//   // Fallback to local auth details if no backend fetch is authorized/available
//   const displayName = data?.name || user?.name || '—';
//   const displayEmail = data?.email || user?.email || '—';
//   const displayRole = data?.role || role || '—';
//   const displayId = data?.userID || user?.userID || '—';
//
//   // Check if we display support/admin details
//   const isExtendedProfileAvailable = ['ADMIN', 'L1_SUPPORT', 'L2_SUPPORT', 'L3_SUPPORT'].includes(role) && data;
//
//   if (loading) return <Loading label="Loading profile details…" />;
//   if (error) return <ErrorState message={error} onRetry={reload} />;
//
//   return (
//     <div className="max-w-4xl mx-auto space-y-6">
//       <PageHeader
//         title="User Profile"
//         subtitle="Your system identity and account information"
//       />
//
//       {/* Profile Card Header */}
//       <Card className="overflow-hidden border border-slate-100 shadow-sm">
//         {/* Decorative banner with Plum/Mint gradient */}
//         <div className="h-32 bg-gradient-to-r from-plum-600 to-plum-900" />
//
//         {/* Profile Meta Section */}
//         <div className="px-6 pt-5 pb-5 relative flex flex-col sm:flex-row items-center sm:items-center gap-4">
//           <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-cyanaccent-300 text-2xl font-bold text-plum border-4 border-white shadow-md -mt-10 sm:-mt-12 z-10">
//             {initials(displayName)}
//           </span>
//           <div className="text-center sm:text-left flex-1 min-w-0">
//             <h2 className="text-xl font-bold text-plum truncate">{displayName}</h2>
//             <p className="text-sm text-slate-500 font-medium">{ROLE_LABELS[displayRole] || displayRole}</p>
//           </div>
//           <div className="shrink-0 flex items-center gap-2">
//             {isExtendedProfileAvailable ? (
//               <StatusBadge value={data.status} map={USER_STATUS_BADGE} />
//             ) : (
//               <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-200">
//                 Authenticated
//               </span>
//             )}
//           </div>
//         </div>
//       </Card>
//
//       {/* Account Details Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         {/* Primary Details Card */}
//         <Card className="p-5 space-y-4">
//           <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Account Details</h3>
//
//           <div className="space-y-3">
//             <div className="flex items-center gap-3">
//               <span className="p-2 bg-slate-50 rounded-lg text-slate-400">
//                 <Shield size={16} />
//               </span>
//               <div>
//                 <p className="text-xs text-slate-400">User ID</p>
//                 <p className="text-sm font-semibold text-plum">#{displayId}</p>
//               </div>
//             </div>
//
//             <div className="flex items-center gap-3">
//               <span className="p-2 bg-slate-50 rounded-lg text-slate-400">
//                 <User size={16} />
//               </span>
//               <div>
//                 <p className="text-xs text-slate-400">Full Name</p>
//                 <p className="text-sm font-semibold text-plum">{displayName}</p>
//               </div>
//             </div>
//
//             <div className="flex items-center gap-3">
//               <span className="p-2 bg-slate-50 rounded-lg text-slate-400">
//                 <Mail size={16} />
//               </span>
//               <div>
//                 <p className="text-xs text-slate-400">Email Address</p>
//                 <p className="text-sm font-semibold text-plum">{displayEmail}</p>
//               </div>
//             </div>
//           </div>
//         </Card>
//
//         {/* Extended Settings / Info */}
//         <Card className="p-5 space-y-4">
//           <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Organizational Details</h3>
//
//           <div className="space-y-3">
//             <div className="flex items-center gap-3">
//               <span className="p-2 bg-slate-50 rounded-lg text-slate-400">
//                 <Phone size={16} />
//               </span>
//               <div>
//                 <p className="text-xs text-slate-400">Phone Number</p>
//                 <p className="text-sm font-semibold text-plum">
//                   {isExtendedProfileAvailable ? (data.phone || '—') : '—'}
//                 </p>
//               </div>
//             </div>
//
//             <div className="flex items-center gap-3">
//               <span className="p-2 bg-slate-50 rounded-lg text-slate-400">
//                 <Users size={16} />
//               </span>
//               <div>
//                 <p className="text-xs text-slate-400">Assigned Team</p>
//                 <p className="text-sm font-semibold text-plum">
//                   {isExtendedProfileAvailable ? (TEAMS[data.teamID] || '—') : '—'}
//                 </p>
//               </div>
//             </div>
//
//             <div className="flex items-center gap-3">
//               <span className="p-2 bg-slate-50 rounded-lg text-slate-400">
//                 <MapPin size={16} />
//               </span>
//               <div>
//                 <p className="text-xs text-slate-400">Location</p>
//                 <p className="text-sm font-semibold text-plum">
//                   {isExtendedProfileAvailable ? (data.locationID || '—') : '—'}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </Card>
//       </div>
//     </div>
//   );
// }

import { useCallback } from 'react';
import { User, Mail, Phone, Shield, Users, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { getUser } from '../../api/users.js';
import { useAsync } from '../../lib/hooks.js';
import { ROLE_LABELS, USER_STATUS_BADGE, TEAMS } from '../../lib/constants.js';
import { initials } from '../../lib/format.js';
import { PageHeader, Card, Loading, ErrorState } from '../../components/ui/index.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';

export default function UserProfile() {
  const { user, role } = useAuth();

  // Fetch profile for the currently logged-in user regardless of role
  const fetcher = useCallback(() => {
    if (user?.userID) {
      return getUser(user.userID);
    }
    return Promise.resolve(null);
  }, [user?.userID]);

  const { data, loading, error, reload } = useAsync(fetcher, [fetcher]);

  // Combine fetched data with auth context as fallback
  const profile = data || user || {};

  const displayName = profile.name || '—';
  const displayEmail = profile.email || '—';
  const displayRole = profile.role || role || '—';
  const displayId = profile.userID || '—';

  if (loading) return <Loading label="Loading profile details…" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="User Profile"
        subtitle="Your system identity and account information"
      />

      {/* Profile Card Header */}
      <Card className="overflow-hidden border border-slate-100 shadow-sm">
        <div className="h-32 bg-gradient-to-r from-plum-600 to-plum-900" />

        <div className="px-6 pt-5 pb-5 relative flex flex-col sm:flex-row items-center sm:items-center gap-4">
          <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-cyanaccent-300 text-2xl font-bold text-plum border-4 border-white shadow-md -mt-10 sm:-mt-12 z-10">
            {initials(displayName)}
          </span>
          <div className="text-center sm:text-left flex-1 min-w-0">
            <h2 className="text-xl font-bold text-plum truncate">{displayName}</h2>
            <p className="text-sm text-slate-500 font-medium">{ROLE_LABELS[displayRole] || displayRole}</p>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            {profile.status ? (
              <StatusBadge value={profile.status} map={USER_STATUS_BADGE} />
            ) : (
              <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-200">
                Authenticated
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Account Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Primary Details Card */}
        <Card className="p-5 space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Account Details</h3>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-slate-50 rounded-lg text-slate-400">
                <Shield size={16} />
              </span>
              <div>
                <p className="text-xs text-slate-400">User ID</p>
                <p className="text-sm font-semibold text-plum">#{displayId}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="p-2 bg-slate-50 rounded-lg text-slate-400">
                <User size={16} />
              </span>
              <div>
                <p className="text-xs text-slate-400">Full Name</p>
                <p className="text-sm font-semibold text-plum">{displayName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="p-2 bg-slate-50 rounded-lg text-slate-400">
                <Mail size={16} />
              </span>
              <div>
                <p className="text-xs text-slate-400">Email Address</p>
                <p className="text-sm font-semibold text-plum">{displayEmail}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Organizational Details Card */}
        <Card className="p-5 space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Organizational Details</h3>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-slate-50 rounded-lg text-slate-400">
                <Phone size={16} />
              </span>
              <div>
                <p className="text-xs text-slate-400">Phone Number</p>
                <p className="text-sm font-semibold text-plum">
                  {profile.phone || '—'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="p-2 bg-slate-50 rounded-lg text-slate-400">
                <Users size={16} />
              </span>
              <div>
                <p className="text-xs text-slate-400">Assigned Team</p>
                <p className="text-sm font-semibold text-plum">
                  {profile.teamID ? (TEAMS[profile.teamID] || `Team #${profile.teamID}`) : '—'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="p-2 bg-slate-50 rounded-lg text-slate-400">
                <MapPin size={16} />
              </span>
              <div>
                <p className="text-xs text-slate-400">Location</p>
                <p className="text-sm font-semibold text-plum">
                  {profile.locationID || '—'}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}