// --- DEVELOPER RULE ---
// This file contains the complete set of mock users for the application.
// Do NOT add or generate any other user names.
// All user-related data (tasks, jobs, messages, etc.) MUST reference one of the users defined in the `USERS` array below.
// --------------------

import { Role, User, UserStatus, Project, ProjectStatus, AccountHead, PaymentInstruction, PaymentStatus, Collection, Deposit, Asset, AssetCategory, AssetStatus, ServiceJob, JobStatus, JobPriority, Task, Announcement, ActivityLog, ChatThread, Message, Notification, AssetMovement, AssetMovementType, ApprovalStatus, JobComment } from '../types';

const d = new Date();
const today = new Date(d.getFullYear(), d.getMonth(), d.getDate());
const getDate = (days: number) => new Date(today.getTime() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
const getTimestamp = (days: number) => new Date(today.getTime() + days * 24 * 60 * 60 * 1000).toISOString();


const ROLES: Role[] = [
    { id: 'role-1', name: 'Administrator', permissions: ['dashboard:view', 'finance:view', 'finance:create', 'finance:approve', 'finance:delete', 'jobs:view', 'jobs:create', 'jobs:assign', 'jobs:update', 'messages:view', 'messages:create', 'messages:manage_participants', 'users:view', 'users:create', 'users:edit', 'users:disable', 'users:impersonate', 'roles:view', 'roles:manage', 'projects:manage', 'accounts:manage', 'accounts:approve', 'tasks:manage', 'announcements:manage', 'assets:view', 'assets:manage', 'assets:move'], isDefault: true },
    { id: 'role-2', name: 'Manager', permissions: ['dashboard:view', 'finance:view', 'finance:create', 'jobs:view', 'jobs:create', 'jobs:assign', 'jobs:update', 'messages:view', 'messages:create', 'users:view', 'projects:manage', 'tasks:manage', 'announcements:manage', 'assets:view', 'assets:move'] },
    { id: 'role-3', name: 'Technician', permissions: ['dashboard:view', 'jobs:view', 'jobs:update', 'messages:view', 'tasks:manage', 'assets:view'] },
    { id: 'role-4', name: 'Accountant', permissions: ['dashboard:view', 'finance:view', 'finance:create', 'messages:view', 'accounts:manage', 'tasks:manage'] },
];

const USERS: User[] = [
    { id: 'user-1', name: 'Shameem', email: 'shameem@tabdeel.ae', roleId: 'role-1', status: UserStatus.ACTIVE },
    { id: 'user-2', name: 'Suhair', email: 'suhair@tabdeel.ae', roleId: 'role-2', status: UserStatus.ACTIVE },
    { id: 'user-3', name: 'Nouman', email: 'nouman@tabdeel.ae', roleId: 'role-3', status: UserStatus.DISABLED, disableReason: 'Left the company.' },
    { id: 'user-4', name: 'Elwin', email: 'elwin@tabdeel.ae', roleId: 'role-4', status: UserStatus.ACTIVE },
];

const PROJECTS: Project[] = [
    { id: 'proj-1', name: 'Marina Tower HVAC Overhaul', client: 'Emaar Properties', status: ProjectStatus.ACTIVE, createdTimestamp: getTimestamp(-365) },
    { id: 'proj-2', name: 'City Walk Fountain Pumps', client: 'Meraas', status: ProjectStatus.ACTIVE, createdTimestamp: getTimestamp(-200) },
    { id: 'proj-3', name: 'JBR Chiller Plant Upgrade', client: 'Dubai Properties', status: ProjectStatus.ON_HOLD, createdTimestamp: getTimestamp(-150) },
    { id: 'proj-4', name: 'Downtown MEP Contract 2023', client: 'Emaar Properties', status: ProjectStatus.COMPLETED, createdTimestamp: getTimestamp(-400) },
];

const ACCOUNTS: AccountHead[] = [
    { id: 'acc-1', name: 'Main Operations ENBD', bankName: 'Emirates NBD', accountNumber: '101-xxxxxx-01', approvalStatus: ApprovalStatus.APPROVED, createdTimestamp: getTimestamp(-500) },
    { id: 'acc-2', name: 'Project Payments ADCB', bankName: 'ADCB', accountNumber: '056-xxxxxx-01', approvalStatus: ApprovalStatus.APPROVED, createdTimestamp: getTimestamp(-450) },
    { id: 'acc-3', name: 'Petty Cash DIB', bankName: 'Dubai Islamic Bank', accountNumber: '003-xxxxxx-01', approvalStatus: ApprovalStatus.PENDING, createdTimestamp: getTimestamp(-30) },
    { id: 'acc-4', name: 'New Project FAB', bankName: 'First Abu Dhabi Bank', accountNumber: '221-xxxxxx-01', approvalStatus: ApprovalStatus.REJECTED, rejectionReason: "Duplicate account purpose. Use ADCB for project payments.", createdTimestamp: getTimestamp(-15) },
];

const PAYMENTS: PaymentInstruction[] = [
    { id: 'pay-1', payee: 'Carrier Middle East', amount: 45000, currency: 'AED', date: '2023-10-25', status: PaymentStatus.PAID, isRecurring: false, createdTimestamp: getTimestamp(-32) },
    { id: 'pay-2', payee: 'DEWA', amount: 12500, currency: 'AED', date: '2023-10-28', status: PaymentStatus.APPROVED, isRecurring: true, createdTimestamp: getTimestamp(-31) },
    { id: 'pay-3', payee: 'SKM Air Conditioning', amount: 82000, currency: 'AED', date: '2023-11-05', status: PaymentStatus.PENDING, isRecurring: false, createdTimestamp: getTimestamp(-22) },
    { id: 'pay-4', payee: 'Fleet Management Co.', amount: 7300, currency: 'AED', date: '2023-11-01', status: PaymentStatus.PENDING, isRecurring: true, createdTimestamp: getTimestamp(-28) },
    { id: 'pay-5', payee: 'Office Supplies Inc.', amount: 1200, currency: 'AED', date: '2023-10-20', status: PaymentStatus.REJECTED, isRecurring: false, createdTimestamp: getTimestamp(-38), rejectionReason: "Invoice does not match PO. Please revise and resubmit." },
];

const COLLECTIONS: Collection[] = [
    { id: 'coll-1', projectId: 'proj-1', amount: 75000, outstandingAmount: 25000, receivedDate: '2023-10-22', paymentMethod: 'Bank Transfer', createdTimestamp: getTimestamp(-35) },
    { id: 'coll-2', projectId: 'proj-2', amount: 50000, outstandingAmount: 0, receivedDate: '2023-10-18', paymentMethod: 'Cheque', createdTimestamp: getTimestamp(-40) },
];

const DEPOSITS: Deposit[] = [
    { id: 'dep-1', accountId: 'acc-1', amount: 75000, depositDate: '2023-10-23', createdTimestamp: getTimestamp(-34) },
    { id: 'dep-2', accountId: 'acc-2', amount: 50000, depositDate: '2023-10-19', createdTimestamp: getTimestamp(-39) },
];

const ASSETS: Asset[] = [
    { id: 'asset-1', name: 'Chiller Unit A-500', description: 'Heavy duty chiller for large buildings', category: AssetCategory.PROJECT, status: AssetStatus.ACTIVE, purchaseDate: '2022-01-15', purchaseCost: 150000, depreciationRate: 0.10, assignedToId: 'proj-1', movements: [], createdTimestamp: getTimestamp(-600), updatedTimestamp: getTimestamp(-30) },
    { id: 'asset-2', name: 'Welding Machine TIG-200', description: 'Portable TIG welder', category: AssetCategory.OFFICE, status: AssetStatus.ACTIVE, purchaseDate: '2021-05-20', purchaseCost: 8000, depreciationRate: 0.20, assignedToId: 'user-3', movements: [], createdTimestamp: getTimestamp(-800), updatedTimestamp: getTimestamp(-45) },
    { id: 'asset-3', name: 'Dell Latitude 7420', description: 'Laptop for site manager', category: AssetCategory.IT, status: AssetStatus.ACTIVE, purchaseDate: '2023-02-10', purchaseCost: 6500, depreciationRate: 0.33, assignedToId: 'user-2', movements: [], createdTimestamp: getTimestamp(-250), updatedTimestamp: getTimestamp(-10) },
    { id: 'asset-4', name: 'Conference Room Projector', description: 'Epson 1080p Projector', category: AssetCategory.COMMON, status: AssetStatus.IN_REPAIR, purchaseDate: '2020-11-01', purchaseCost: 4000, depreciationRate: 0.25, assignedToId: 'loc-1', movements: [], createdTimestamp: getTimestamp(-900), updatedTimestamp: getTimestamp(-5) },
    { id: 'asset-5', name: 'Ford Transit Van', description: 'Maintenance Vehicle', category: AssetCategory.OFFICE, status: AssetStatus.DISPOSED, purchaseDate: '2019-03-01', purchaseCost: 120000, depreciationRate: 0.15, assignedToId: 'disposed', movements: [], createdTimestamp: getTimestamp(-1200), updatedTimestamp: getTimestamp(-100) },
];

const JOB_COMMENTS_1: JobComment[] = [
    {id: 'jc-1', authorId: 'user-2', content: 'What is the status? This is urgent.', timestamp: getTimestamp(-5)},
    {id: 'jc-2', authorId: 'user-3', content: 'Part is on order, ETA tomorrow morning.', timestamp: getTimestamp(-4)},
];


const JOBS: ServiceJob[] = [
    // Severely overdue job -> Level 2 escalation
    { id: 'job-1', title: 'Replace Compressor on Chiller 3', projectId: 'proj-1', assignedToId: 'user-3', status: JobStatus.IN_PROGRESS, priority: JobPriority.URGENT, createdDate: getDate(-10), updatedDate: getDate(-3), dueDate: getDate(-5), escalationLevel: 0, description: 'Compressor failed, need immediate replacement to restore cooling.', comments: JOB_COMMENTS_1 },
    // Slightly overdue job -> Level 1 escalation
    { id: 'job-2', title: 'Quarterly Pump Maintenance', projectId: 'proj-2', assignedToId: 'user-3', status: JobStatus.OPEN, priority: JobPriority.MEDIUM, createdDate: getDate(-7), updatedDate: getDate(-7), dueDate: getDate(-2), escalationLevel: 0, description: 'Standard quarterly checkup and lubrication for all fountain pumps.', comments: [] },
    // Completed job that was overdue (should not be escalated)
    { id: 'job-3', title: 'Investigate Leak in Unit 7B', projectId: 'proj-1', assignedToId: 'user-3', status: JobStatus.COMPLETED, priority: JobPriority.HIGH, createdDate: getDate(-8), updatedDate: getDate(-4), dueDate: getDate(-4), escalationLevel: 0, description: 'Tenant reported water dripping from AC unit. Found and fixed a clogged drain pipe.', comments: [] },
    // Job due today (not overdue)
    { id: 'job-4', title: 'Calibrate pressure sensors', projectId: 'proj-2', assignedToId: 'user-3', status: JobStatus.OPEN, priority: JobPriority.LOW, createdDate: getDate(-1), updatedDate: getDate(-1), dueDate: getDate(0), escalationLevel: 0, description: 'Routine calibration of all pressure sensors at the City Walk site.', comments: [] },
    // Job due in the future
    { id: 'job-5', title: 'Annual Fire Suppression System Test', projectId: 'proj-1', assignedToId: 'user-3', status: JobStatus.OPEN, priority: JobPriority.HIGH, createdDate: getDate(0), updatedDate: getDate(0), dueDate: getDate(7), escalationLevel: 0, description: 'Full system test for the fire suppression network in Marina Tower.', comments: [] },
];


const TASKS: Task[] = [
    { id: 'task-1', title: 'Submit Q3 Expense Report', assignedTo: 'user-4', dueDate: '2023-10-29', isCompleted: false, creatorId: 'user-2', createdDate: getDate(-12) },
    { id: 'task-2', title: 'Order new filters for Marina Tower', assignedTo: 'user-2', dueDate: '2023-11-05', isCompleted: false, creatorId: 'user-2', createdDate: getDate(-5) },
    { id: 'task-3', title: 'Renew vehicle registration', assignedTo: 'user-1', dueDate: '2023-10-20', isCompleted: true, creatorId: 'user-1', createdDate: getDate(-30) },
];

const ANNOUNCEMENTS: Announcement[] = [
    { id: 'ann-1', title: 'New Health Insurance Policy', content: 'Please review the updated health insurance policy attached to the company-wide email. Enrollment for the new plan is open until Nov 15th.', authorId: 'user-1', timestamp: '2023-10-20T10:00:00Z' },
    { id: 'ann-2', title: 'Office Closure for National Day', content: 'The office will be closed on December 2nd and 3rd for the UAE National Day holidays. Please plan your work accordingly.', authorId: 'user-1', timestamp: '2023-10-25T14:30:00Z' },
];

const ACTIVITY: ActivityLog[] = [
    { id: 'act-1', userId: 'user-2', action: 'approved a payment of 12,500 AED to DEWA.', timestamp: '2023-10-28T11:00:00Z' },
    { id: 'act-2', userId: 'user-3', action: 'updated the status of a job to "Completed".', timestamp: '2023-10-27T16:45:00Z' },
    { id: 'act-3', userId: 'user-1', action: 'posted a new announcement.', timestamp: '2023-10-25T14:30:00Z' },
    { id: 'act-4', userId: 'user-4', action: 'created a new payment instruction for SKM.', timestamp: '2023-10-25T09:15:00Z' },
    { id: 'act-5', userId: 'user-3', action: 'logged a new service call for City Walk.', timestamp: '2023-10-25T08:30:00Z' },
];

const MESSAGES: Message[] = [
    { id: 'msg-1', senderId: 'user-2', content: 'Nouman, what\'s the status on the compressor for Marina Tower?', timestamp: '2023-10-26T09:00:00Z' },
    { id: 'msg-2', senderId: 'user-3', content: 'The part is arriving this afternoon. We should have it installed by EOD.', timestamp: '2023-10-26T09:02:00Z' },
    { id: 'msg-3', senderId: 'user-2', content: 'Great, keep me posted.', timestamp: '2023-10-26T09:03:00Z' },
    { id: 'msg-4', senderId: 'user-1', content: 'Suhair, Elwin, can you sync up on the Q3 financials for my review tomorrow?', timestamp: '2023-10-26T10:00:00Z' },
    { id: 'msg-5', senderId: 'user-4', content: 'Yes, Shameem. I am preparing the final draft now.', timestamp: '2023-10-26T10:01:00Z' },
];

const CHAT_THREADS: ChatThread[] = [
    { id: 'thread-1', title: 'Marina Tower Urgent Repair', participants: ['user-1', 'user-2', 'user-3'], messages: [MESSAGES[0], MESSAGES[1], MESSAGES[2]], lastMessageTimestamp: '2023-10-26T09:03:00Z' },
    { id: 'thread-2', title: 'Finance Team Sync', participants: ['user-1', 'user-2', 'user-4'], messages: [MESSAGES[3], MESSAGES[4]], lastMessageTimestamp: '2023-10-26T10:01:00Z' },
];

const NOTIFICATIONS: Notification[] = [
    { id: 'notif-1', userIds: ['user-2'], message: 'Nouman updated job "Replace Compressor"', timestamp: '2023-10-26T16:00:00Z', isRead: false },
    { id: 'notif-2', userIds: ['user-2'], message: 'You have a new task assigned: "Order new filters"', timestamp: '2023-10-26T11:30:00Z', isRead: false },
    { id: 'notif-3', userIds: ['user-2'], message: 'Elwin requested approval for a payment', timestamp: '2023-10-25T09:15:00Z', isRead: true },
];

// Populate asset movements
const asset2 = ASSETS.find(a => a.id === 'asset-2');
if (asset2) {
    asset2.movements.push({ id: 'mov-1', movementDate: '2023-09-15', movementType: AssetMovementType.INTERNAL, from: 'Main Workshop', to: 'Nouman', reason: 'New assignment' });
}

export const MOCK_DATA = {
    roles: ROLES,
    users: USERS,
    projects: PROJECTS,
    accounts: ACCOUNTS,
    payments: PAYMENTS,
    collections: COLLECTIONS,
    deposits: DEPOSITS,
    assets: ASSETS,
    serviceJobs: JOBS,
    tasks: TASKS,
    announcements: ANNOUNCEMENTS,
    activity: ACTIVITY,
    chatThreads: CHAT_THREADS,
    notifications: NOTIFICATIONS,
};