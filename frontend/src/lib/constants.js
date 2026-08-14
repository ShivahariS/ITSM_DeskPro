/*import {
  LayoutDashboard, ShoppingCart, ClipboardList, AlertTriangle, Ticket, Bell,
  Gauge, Inbox, UserCheck, ClipboardCheck, ArrowUpRight, Layers, Boxes, Network,
  ShieldAlert, BookOpen, GitPullRequest, LineChart, CalendarDays, CheckCircle2,
  Users, Wrench, PackageSearch, KeyRound, ServerCog, ScrollText, BarChart3,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Roles
// ---------------------------------------------------------------------------
export const ROLES = {
  END_USER: 'END_USER',
  L1_SUPPORT: 'L1_SUPPORT',
  L2_SUPPORT: 'L2_SUPPORT',
  L3_SUPPORT: 'L3_SUPPORT',
  CHANGE_MANAGER: 'CHANGE_MANAGER',
  ASSET_MANAGER: 'ASSET_MANAGER',
  ADMIN: 'ADMIN',
};

export const ROLE_LABELS = {
  END_USER: 'End User',
  L1_SUPPORT: 'L1 Support',
  L2_SUPPORT: 'L2 Support',
  L3_SUPPORT: 'L3 Support',
  CHANGE_MANAGER: 'Change Manager',
  ASSET_MANAGER: 'Asset Manager',
  ADMIN: 'Administrator',
};

// Landing route per role (first sidebar item)
export const ROLE_HOME = {
  END_USER: '/enduser/dashboard',
  L1_SUPPORT: '/l1/overview',
  L2_SUPPORT: '/l2/hub',
  L3_SUPPORT: '/l3/major-incidents',
  CHANGE_MANAGER: '/change/overview',
  ASSET_MANAGER: '/asset/analytics',
  ADMIN: '/admin/analytics',
};

// Sidebar navigation per role
export const NAV = {
  END_USER: [
    { to: '/enduser/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/enduser/catalog', label: 'Service Catalog', icon: ShoppingCart },
    { to: '/enduser/my-requests', label: 'My Requests', icon: ClipboardList },
    { to: '/enduser/report-incident', label: 'Report Incident', icon: AlertTriangle },
    { to: '/enduser/my-tickets', label: 'My Tickets', icon: Ticket },
    { to: '/enduser/notifications', label: 'Notifications', icon: Bell },
  ],
  L1_SUPPORT: [
    { to: '/l1/overview', label: 'Support Overview', icon: Gauge },
    { to: '/l1/incident-queue', label: 'Incident Queue', icon: Inbox },
    { to: '/l1/my-tickets', label: 'My Assigned Tickets', icon: UserCheck },
    { to: '/l1/service-requests', label: 'Service Requests Queue', icon: ClipboardCheck },
    { to: '/l1/escalations', label: 'Escalations & Hand-Offs', icon: ArrowUpRight },
    { to: '/l1/notifications', label: 'Notifications', icon: Bell },
  ],
  L2_SUPPORT: [
    { to: '/l2/hub', label: 'L2 Operations Hub', icon: Gauge },
    { to: '/l2/escalated-queue', label: 'Escalated Queue', icon: Layers },
    { to: '/l2/problems', label: 'Problem Management', icon: ShieldAlert },
    { to: '/l2/ci-mapping', label: 'CI Asset Mapping', icon: Network },
    { to: '/l2/notifications', label: 'Notifications', icon: Bell },
  ],
  L3_SUPPORT: [
    { to: '/l3/major-incidents', label: 'Major Incident Workbench', icon: ShieldAlert },
    { to: '/l3/kedb', label: 'Known Error Database', icon: BookOpen },
    { to: '/l3/request-change', label: 'Request a Change', icon: GitPullRequest },
    { to: '/l3/reports', label: 'Technical Reports', icon: LineChart },
    { to: '/l3/notifications', label: 'Notifications', icon: Bell },
  ],
  CHANGE_MANAGER: [
    { to: '/change/overview', label: 'Change Overview', icon: Gauge },
    { to: '/change/queue', label: 'Change Requests Queue', icon: GitPullRequest },
    { to: '/change/cab', label: 'CAB Review Console', icon: ClipboardCheck },
    { to: '/change/calendar', label: 'Change Schedule', icon: CalendarDays },
    { to: '/change/pir', label: 'PIR & Implementation', icon: CheckCircle2 },
  ],
  ASSET_MANAGER: [
    { to: '/asset/analytics', label: 'Asset Analytics', icon: BarChart3 },
    { to: '/asset/hardware', label: 'Hardware Inventory', icon: Boxes },
    { to: '/asset/licenses', label: 'Software Licenses', icon: KeyRound },
    { to: '/asset/cmdb', label: 'CMDB Config Items', icon: ServerCog },
    { to: '/asset/expiry', label: 'Expiry Alerts', icon: PackageSearch },
  ],
  ADMIN: [
    { to: '/admin/analytics', label: 'Global ITSM Analytics', icon: BarChart3 },
    { to: '/admin/users', label: 'User Management', icon: Users },
    { to: '/admin/catalog', label: 'Service Catalog Builder', icon: Wrench },
    { to: '/admin/audit-logs', label: 'Audit Logs', icon: ScrollText },
    { to: '/admin/notifications', label: 'Notifications', icon: Bell },
  ],
};

// ---------------------------------------------------------------------------
// Enum option lists (exact backend constant values)
// ---------------------------------------------------------------------------
export const PRIORITIES = ['P1', 'P2', 'P3', 'P4'];
export const INCIDENT_CATEGORIES = ['HARDWARE', 'SOFTWARE', 'NETWORK', 'ACCESS', 'APPLICATION', 'OTHER'];
export const INCIDENT_STATUSES = ['OPEN', 'IN_PROGRESS', 'PENDING', 'RESOLVED', 'CLOSED', 'REOPENED'];
export const NOTE_TYPES = ['WORK_NOTE', 'PUBLIC_UPDATE', 'ESCALATION'];
export const SERVICE_REQUEST_STATUSES = ['SUBMITTED', 'IN_PROGRESS', 'PENDING_APPROVAL', 'FULFILLED', 'REJECTED', 'CANCELLED'];
export const CATALOG_CATEGORIES = ['HARDWARE', 'SOFTWARE', 'ACCESS', 'NETWORK', 'OTHER'];
export const PROBLEM_STATUSES = ['OPEN', 'UNDER_INVESTIGATION', 'KNOWN_ERROR', 'RESOLVED', 'CLOSED'];
export const PROBLEM_PRIORITIES = ['HIGH', 'MEDIUM', 'LOW'];
export const KNOWN_ERROR_STATUSES = ['ACTIVE', 'FIX_APPLIED', 'CLOSED'];
export const CHANGE_TYPES = ['STANDARD', 'NORMAL', 'EMERGENCY'];
export const CHANGE_STATUSES = ['DRAFT', 'SUBMITTED', 'CAB_REVIEW', 'APPROVED', 'SCHEDULED', 'IMPLEMENTED', 'PIR_PENDING', 'CLOSED', 'REJECTED'];
export const RISK_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
export const CAB_DECISIONS = ['APPROVED', 'REJECTED', 'DEFERRED_PENDING_MORE_INFO'];
export const REVIEW_STATUSES = ['SCHEDULED', 'COMPLETED'];
export const IMPLEMENTATION_OUTCOMES = ['SUCCESSFUL', 'PARTIALLY_SUCCESSFUL', 'FAILED', 'ROLLED_BACK'];
export const ASSET_TYPES = ['LAPTOP', 'SERVER', 'NETWORK_DEVICE', 'PRINTER', 'MOBILE_DEVICE'];
export const ASSET_STATUSES = ['IN_USE', 'IN_STOCK', 'UNDER_REPAIR', 'RETIRED', 'DISPOSED'];
export const LICENSE_TYPES = ['PER_SEAT', 'CONCURRENT', 'ENTERPRISE'];
export const LICENSE_STATUSES = ['ACTIVE', 'EXPIRED', 'UNDER_RENEWAL'];
export const ENVIRONMENTS = ['PRODUCTION', 'UAT', 'DEV'];
export const CI_STATUSES = ['ACTIVE', 'INACTIVE', 'DECOMMISSIONED'];
export const USER_STATUSES = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];
export const ROLE_OPTIONS = Object.values(ROLES);
export const NOTIFICATION_CATEGORIES = ['INCIDENT', 'SERVICE_REQUEST', 'PROBLEM', 'CHANGE', 'ASSET', 'SLA'];
export const REPORT_SCOPES = ['TEAM', 'CATEGORY', 'PRIORITY', 'PERIOD'];

// Team id -> label convention (mirrors DataSeeder)
export const TEAMS = {
  1: 'Service Desk (L1)',
  2: 'Infrastructure & Systems (L2)',
  3: 'Software & Core Platform Engineering (L3)',
  4: 'Change Advisory Board (CAB)',
  5: 'IT Asset Management',
};
export const TEAM_OPTIONS = Object.entries(TEAMS).map(([id, label]) => ({ id: Number(id), label }));

export const LOCATIONS = [
  'Headquarters - Building A',
  'Remote / Work From Home',
  'Regional Office - West',
];
export const DEPARTMENTS = ['Engineering', 'Human Resources', 'Finance', 'Sales', 'IT Operations'];

// Human-friendly label for any SCREAMING_SNAKE constant
export const humanize = (v) =>
  !v ? '—' : String(v).toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

// ---------------------------------------------------------------------------
// Badge colour maps (Tailwind classes) — palette-aligned
// ---------------------------------------------------------------------------
const C = {
  cyan: 'bg-cyanaccent-100 text-cyanaccent-800',
  mint: 'bg-mint text-slateblue-800',
  slate: 'bg-slateblue-100 text-slateblue-700',
  plum: 'bg-plum-100 text-plum-700',
  green: 'bg-emerald-100 text-emerald-700',
  amber: 'bg-amber-100 text-amber-800',
  red: 'bg-red-100 text-red-700',
  gray: 'bg-gray-100 text-gray-600',
  blue: 'bg-sky-100 text-sky-700',
};

export const PRIORITY_BADGE = {
  P1: C.red, P2: C.amber, P3: C.blue, P4: C.slate,
};
export const INCIDENT_STATUS_BADGE = {
  OPEN: C.amber, IN_PROGRESS: C.blue, PENDING: C.slate,
  RESOLVED: C.green, CLOSED: C.gray, REOPENED: C.red,
};
export const REQUEST_STATUS_BADGE = {
  SUBMITTED: C.blue, IN_PROGRESS: C.cyan, PENDING_APPROVAL: C.amber,
  FULFILLED: C.green, REJECTED: C.red, CANCELLED: C.gray,
};
export const PROBLEM_STATUS_BADGE = {
  OPEN: C.amber, UNDER_INVESTIGATION: C.blue, KNOWN_ERROR: C.plum,
  RESOLVED: C.green, CLOSED: C.gray,
};
export const CHANGE_STATUS_BADGE = {
  DRAFT: C.gray, SUBMITTED: C.blue, CAB_REVIEW: C.amber, APPROVED: C.cyan,
  SCHEDULED: C.plum, IMPLEMENTED: C.green, PIR_PENDING: C.amber,
  CLOSED: C.gray, REJECTED: C.red,
};
export const RISK_BADGE = {
  LOW: C.green, MEDIUM: C.amber, HIGH: C.red, CRITICAL: 'bg-red-600 text-white',
};
export const ASSET_STATUS_BADGE = {
  IN_USE: C.green, IN_STOCK: C.blue, UNDER_REPAIR: C.amber,
  RETIRED: C.gray, DISPOSED: C.red,
};
export const LICENSE_STATUS_BADGE = {
  ACTIVE: C.green, EXPIRED: C.red, UNDER_RENEWAL: C.amber,
};
export const CI_STATUS_BADGE = {
  ACTIVE: C.green, INACTIVE: C.slate, DECOMMISSIONED: C.gray,
};
export const USER_STATUS_BADGE = {
  ACTIVE: C.green, INACTIVE: C.slate, SUSPENDED: C.red,
};
export const KE_STATUS_BADGE = {
  ACTIVE: C.amber, FIX_APPLIED: C.blue, CLOSED: C.green,
};
export const NOTIFICATION_STATUS_BADGE = {
  UNREAD: C.cyan, READ: C.slate, DISMISSED: C.gray,
};
export const GENERIC_BADGE = C.slate;
*/

import {
  LayoutDashboard, ShoppingCart, ClipboardList, AlertTriangle, Ticket, Bell,
  Gauge, Inbox, UserCheck, ClipboardCheck, ArrowUpRight, Layers, Boxes, Network,
  ShieldAlert, BookOpen, GitPullRequest, LineChart, CalendarDays, CheckCircle2,
  Users, Wrench, PackageSearch, KeyRound, ServerCog, ScrollText, BarChart3,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Roles
// ---------------------------------------------------------------------------
export const ROLES = {
  END_USER: 'END_USER',
  L1_SUPPORT: 'L1_SUPPORT',
  L2_SUPPORT: 'L2_SUPPORT',
  L3_SUPPORT: 'L3_SUPPORT',
  CHANGE_MANAGER: 'CHANGE_MANAGER',
  ASSET_MANAGER: 'ASSET_MANAGER',
  ADMIN: 'ADMIN',
};

export const ROLE_LABELS = {
  END_USER: 'End User',
  L1_SUPPORT: 'L1 Support',
  L2_SUPPORT: 'L2 Support',
  L3_SUPPORT: 'L3 Support',
  CHANGE_MANAGER: 'Change Manager',
  ASSET_MANAGER: 'Asset Manager',
  ADMIN: 'Administrator',
};

// Landing route per role (first sidebar item)
export const ROLE_HOME = {
  END_USER: '/enduser/dashboard',
  L1_SUPPORT: '/l1/overview',
  L2_SUPPORT: '/l2/hub',
  L3_SUPPORT: '/l3/major-incidents',
  CHANGE_MANAGER: '/change/overview',
  ASSET_MANAGER: '/asset/analytics',
  ADMIN: '/admin/analytics',
};

// Sidebar navigation per role
export const NAV = {
  END_USER: [
    { to: '/enduser/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/enduser/catalog', label: 'Service Catalog', icon: ShoppingCart },
    { to: '/enduser/my-requests', label: 'My Requests', icon: ClipboardList },
    { to: '/enduser/report-incident', label: 'Report Incident', icon: AlertTriangle },
    { to: '/enduser/my-tickets', label: 'My Tickets', icon: Ticket },
    { to: '/enduser/notifications', label: 'Notifications', icon: Bell },
  ],
  L1_SUPPORT: [
    { to: '/l1/overview', label: 'Support Overview', icon: Gauge },
    { to: '/l1/incident-queue', label: 'Incident Queue', icon: Inbox },
    { to: '/l1/my-tickets', label: 'My Assigned Tickets', icon: UserCheck },
    { to: '/l1/service-requests', label: 'Service Requests Queue', icon: ClipboardCheck },
    { to: '/l1/escalations', label: 'Escalations & Hand-Offs', icon: ArrowUpRight },
    { to: '/l1/notifications', label: 'Notifications', icon: Bell },
  ],
  L2_SUPPORT: [
    { to: '/l2/hub', label: 'L2 Operations Hub', icon: Gauge },
    { to: '/l2/escalated-queue', label: 'Escalated Queue', icon: Layers },
    { to: '/l2/problems', label: 'Problem Management', icon: ShieldAlert },
    { to: '/l2/ci-mapping', label: 'CI Asset Mapping', icon: Network },
    { to: '/l2/notifications', label: 'Notifications', icon: Bell },
  ],
  L3_SUPPORT: [
    { to: '/l3/major-incidents', label: 'Major Incident Workbench', icon: ShieldAlert },
    { to: '/l3/kedb', label: 'Known Error Database', icon: BookOpen },
    { to: '/l3/request-change', label: 'Request a Change', icon: GitPullRequest },
    { to: '/l3/reports', label: 'Technical Reports', icon: LineChart },
    { to: '/l3/notifications', label: 'Notifications', icon: Bell },
  ],
  CHANGE_MANAGER: [
    { to: '/change/overview', label: 'Change Overview', icon: Gauge },
    { to: '/change/queue', label: 'Change Requests Queue', icon: GitPullRequest },
    { to: '/change/cab', label: 'CAB Review Console', icon: ClipboardCheck },
    { to: '/change/calendar', label: 'Change Schedule', icon: CalendarDays },
    { to: '/change/pir', label: 'PIR & Implementation', icon: CheckCircle2 },
  ],
  ASSET_MANAGER: [
    { to: '/asset/analytics', label: 'Asset Analytics', icon: BarChart3 },
    { to: '/asset/pending-requests', label: 'Pending Requests', icon: Inbox },
    { to: '/asset/hardware', label: 'Hardware Inventory', icon: Boxes },
    { to: '/asset/licenses', label: 'Software Licenses', icon: KeyRound },
    { to: '/asset/cmdb', label: 'CMDB Config Items', icon: ServerCog },
    { to: '/asset/expiry', label: 'Expiry Alerts', icon: PackageSearch },
  ],
  ADMIN: [
    { to: '/admin/analytics', label: 'Global ITSM Analytics', icon: BarChart3 },
    { to: '/admin/users', label: 'User Management', icon: Users },
    { to: '/admin/catalog', label: 'Service Catalog Builder', icon: Wrench },
    { to: '/admin/audit-logs', label: 'Audit Logs', icon: ScrollText },
    { to: '/admin/notifications', label: 'Notifications', icon: Bell },
  ],
};

// ---------------------------------------------------------------------------
// Enum option lists (exact backend constant values)
// ---------------------------------------------------------------------------
export const PRIORITIES = ['P1', 'P2', 'P3', 'P4'];
export const INCIDENT_CATEGORIES = ['HARDWARE', 'SOFTWARE', 'NETWORK', 'ACCESS', 'APPLICATION', 'OTHER'];
export const INCIDENT_STATUSES = ['OPEN', 'IN_PROGRESS', 'PENDING', 'RESOLVED', 'CLOSED', 'REOPENED'];
export const NOTE_TYPES = ['WORK_NOTE', 'PUBLIC_UPDATE', 'ESCALATION'];
export const SERVICE_REQUEST_STATUSES = ['SUBMITTED', 'IN_PROGRESS', 'PENDING_APPROVAL', 'FULFILLED', 'REJECTED', 'CANCELLED'];
export const CATALOG_CATEGORIES = ['HARDWARE', 'SOFTWARE', 'ACCESS', 'NETWORK', 'OTHER'];
export const PROBLEM_STATUSES = ['OPEN', 'UNDER_INVESTIGATION', 'KNOWN_ERROR', 'RESOLVED', 'CLOSED'];
export const PROBLEM_PRIORITIES = ['HIGH', 'MEDIUM', 'LOW'];
export const KNOWN_ERROR_STATUSES = ['ACTIVE', 'FIX_APPLIED', 'CLOSED'];
export const CHANGE_TYPES = ['STANDARD', 'NORMAL', 'EMERGENCY'];
export const CHANGE_STATUSES = ['DRAFT', 'SUBMITTED', 'CAB_REVIEW', 'APPROVED', 'SCHEDULED', 'IMPLEMENTED', 'PIR_PENDING', 'CLOSED', 'REJECTED'];
export const RISK_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
export const CAB_DECISIONS = ['APPROVED', 'REJECTED', 'DEFERRED_PENDING_MORE_INFO'];
export const REVIEW_STATUSES = ['SCHEDULED', 'COMPLETED'];
export const IMPLEMENTATION_OUTCOMES = ['SUCCESSFUL', 'PARTIALLY_SUCCESSFUL', 'FAILED', 'ROLLED_BACK'];
export const ASSET_TYPES = ['LAPTOP', 'SERVER', 'NETWORK_DEVICE', 'PRINTER', 'MOBILE_DEVICE'];
export const ASSET_STATUSES = ['IN_USE', 'IN_STOCK', 'UNDER_REPAIR', 'RETIRED', 'DISPOSED'];
export const LICENSE_TYPES = ['PER_SEAT', 'CONCURRENT', 'ENTERPRISE'];
export const LICENSE_STATUSES = ['ACTIVE', 'EXPIRED', 'UNDER_RENEWAL'];
export const ENVIRONMENTS = ['PRODUCTION', 'UAT', 'DEV'];
export const CI_STATUSES = ['ACTIVE', 'INACTIVE', 'DECOMMISSIONED'];
export const USER_STATUSES = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];
export const ROLE_OPTIONS = Object.values(ROLES);
export const NOTIFICATION_CATEGORIES = ['INCIDENT', 'SERVICE_REQUEST', 'PROBLEM', 'CHANGE', 'ASSET', 'SLA'];
export const REPORT_SCOPES = ['TEAM', 'CATEGORY', 'PRIORITY', 'PERIOD'];

// Team id -> label convention (mirrors DataSeeder)
export const TEAMS = {
  1: 'Service Desk (L1)',
  2: 'Infrastructure & Systems (L2)',
  3: 'Software & Core Platform Engineering (L3)',
  4: 'Change Advisory Board (CAB)',
  5: 'IT Asset Management',
};
export const TEAM_OPTIONS = Object.entries(TEAMS).map(([id, label]) => ({ id: Number(id), label }));

export const LOCATIONS = [
  'Headquarters - Building A',
  'Remote / Work From Home',
  'Regional Office - West',
];
export const DEPARTMENTS = ['Engineering', 'Human Resources', 'Finance', 'Sales', 'IT Operations'];

// Human-friendly label for any SCREAMING_SNAKE constant
export const humanize = (v) =>
  !v ? '—' : String(v).toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

// ---------------------------------------------------------------------------
// Badge colour maps (Tailwind classes) — palette-aligned
// ---------------------------------------------------------------------------
const C = {
  cyan: 'bg-cyanaccent-100 text-cyanaccent-800',
  mint: 'bg-mint text-slateblue-800',
  slate: 'bg-slateblue-100 text-slateblue-700',
  plum: 'bg-plum-100 text-plum-700',
  green: 'bg-emerald-100 text-emerald-700',
  amber: 'bg-amber-100 text-amber-800',
  red: 'bg-red-100 text-red-700',
  gray: 'bg-gray-100 text-gray-600',
  blue: 'bg-sky-100 text-sky-700',
};

export const PRIORITY_BADGE = {
  P1: C.red, P2: C.amber, P3: C.blue, P4: C.slate,
};
export const INCIDENT_STATUS_BADGE = {
  OPEN: C.amber, IN_PROGRESS: C.blue, PENDING: C.slate,
  RESOLVED: C.green, CLOSED: C.gray, REOPENED: C.red,
};
export const REQUEST_STATUS_BADGE = {
  SUBMITTED: C.blue, IN_PROGRESS: C.cyan, PENDING_APPROVAL: C.amber,
  FULFILLED: C.green, REJECTED: C.red, CANCELLED: C.gray,
};
export const PROBLEM_STATUS_BADGE = {
  OPEN: C.amber, UNDER_INVESTIGATION: C.blue, KNOWN_ERROR: C.plum,
  RESOLVED: C.green, CLOSED: C.gray,
};
export const CHANGE_STATUS_BADGE = {
  DRAFT: C.gray, SUBMITTED: C.blue, CAB_REVIEW: C.amber, APPROVED: C.cyan,
  SCHEDULED: C.plum, IMPLEMENTED: C.green, PIR_PENDING: C.amber,
  CLOSED: C.gray, REJECTED: C.red,
};
export const RISK_BADGE = {
  LOW: C.green, MEDIUM: C.amber, HIGH: C.red, CRITICAL: 'bg-red-600 text-white',
};
export const ASSET_STATUS_BADGE = {
  IN_USE: C.green, IN_STOCK: C.blue, UNDER_REPAIR: C.amber,
  RETIRED: C.gray, DISPOSED: C.red,
};
export const LICENSE_STATUS_BADGE = {
  ACTIVE: C.green, EXPIRED: C.red, UNDER_RENEWAL: C.amber,
};
export const CI_STATUS_BADGE = {
  ACTIVE: C.green, INACTIVE: C.slate, DECOMMISSIONED: C.gray,
};
export const USER_STATUS_BADGE = {
  ACTIVE: C.green, INACTIVE: C.slate, SUSPENDED: C.red,
};
export const KE_STATUS_BADGE = {
  ACTIVE: C.amber, FIX_APPLIED: C.blue, CLOSED: C.green,
};
export const NOTIFICATION_STATUS_BADGE = {
  UNREAD: C.cyan, READ: C.slate, DISMISSED: C.gray,
};
export const GENERIC_BADGE = C.slate;