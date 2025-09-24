

export type Page =
    | 'dashboard'
    | 'finance'
    | 'jobs'
    | 'messages'
    | 'tasks'
    | 'announcements'
    | 'users'
    | 'roles'
    | 'projects'
    | 'accounts'
    | 'assets'
    | 'profile';

export enum UserStatus {
    ACTIVE = 'Active',
    DISABLED = 'Disabled',
}

export interface User {
    id: string;
    name: string;
    email: string;
    roleId: string;
    status: UserStatus;
    disableReason?: string;
}

export interface Role {
    id: string;
    name: string;
    permissions: string[];
    isDefault?: boolean;
}

export interface Message {
    id: string;
    senderId: string;
    content: string;
    timestamp: string;
}

export interface ChatThread {
    id: string;
    title: string;
    participants: string[];
    messages: Message[];
    lastMessageTimestamp: string;
}

export interface ActivityLog {
    id: string;
    userId: string;
    action: string;
    timestamp: string;
}

export interface Announcement {
    id: string;
    title: string;
    content: string;
    authorId: string;
    timestamp: string;
}

export interface Task {
    id: string;
    title: string;
    assignedTo: string;
    dueDate: string;
    isCompleted: boolean;
    creatorId: string;
    createdDate: string;
}

export enum PaymentStatus {
    PENDING = 'Pending',
    APPROVED = 'Approved',
    PAID = 'Paid',
    REJECTED = 'Rejected',
}

export interface PaymentInstruction {
    id: string;
    payee: string;
    amount: number;
    currency: string;
    date: string;
    status: PaymentStatus;
    isRecurring: boolean;
    createdTimestamp: string;
    rejectionReason?: string;
    approverId?: string;
    approvalTimestamp?: string;
}

export interface Collection {
    id: string;
    projectId: string;
    amount: number;
    outstandingAmount: number;
    receivedDate: string;
    paymentMethod: 'Cash' | 'Cheque' | 'Bank Transfer';
    createdTimestamp: string;
}

export interface Deposit {
    id: string;
    accountId: string;
    amount: number;
    depositDate: string;
    slipUrl?: string;
    createdTimestamp: string;
}

export enum ProjectStatus {
    ACTIVE = 'Active',
    ON_HOLD = 'On Hold',
    COMPLETED = 'Completed',
}

export interface Project {
    id: string;
    name: string;
    client: string;
    status: ProjectStatus;
    createdTimestamp: string;
}

export enum ApprovalStatus {
    PENDING = 'Pending',
    APPROVED = 'Approved',
    REJECTED = 'Rejected',
}

export interface AccountHead {
    id: string;
    name: string;
    bankName: string;
    accountNumber: string;
    approvalStatus: ApprovalStatus;
    rejectionReason?: string;
    createdTimestamp: string;
}

export enum AssetStatus {
    ACTIVE = 'Active',
    IN_REPAIR = 'In Repair',
    DISPOSED = 'Disposed',
}

export enum AssetCategory {
    OFFICE = 'Office Equipment',
    PROJECT = 'Project Machinery',
    COMMON = 'Common Area',
    IT = 'IT Hardware',
}

export enum AssetMovementType {
    INTERNAL = 'Internal Transfer',
    EXTERNAL = 'External Movement',
}

export interface AssetMovement {
    id: string;
    movementDate: string;
    movementType: AssetMovementType;
    from: string;
    to: string;
    reason: string;
    documentUrl?: string;
}

export interface Asset {
    id: string;
    name: string;
    description: string;
    category: AssetCategory;
    status: AssetStatus;
    purchaseDate: string;
    purchaseCost: number;
    depreciationRate: number; // e.g., 0.20 for 20%
    assignedToId: string; // Can be userId, projectId, or a location string
    movements: AssetMovement[];
    createdTimestamp: string;
    updatedTimestamp: string;
}

export enum JobStatus {
    OPEN = 'Open',
    IN_PROGRESS = 'In Progress',
    COMPLETED = 'Completed',
    CANCELLED = 'Cancelled',
}

export enum JobPriority {
    LOW = 'Low',
    MEDIUM = 'Medium',
    HIGH = 'High',
    URGENT = 'Urgent',
}

export interface JobComment {
    id: string;
    authorId: string;
    content: string;
    timestamp: string;
}

export interface ServiceJob {
    id: string;
    title: string;
    projectId: string;
    assignedToId: string;
    status: JobStatus;
    priority: JobPriority;
    createdDate: string;
    updatedDate: string;
    dueDate: string;
    escalationLevel: number; // 0: None, 1: Manager, 2: Admin
    description: string;
    comments: JobComment[];
}

export interface Notification {
    id: string;
    message: string;
    timestamp: string;
    isRead: boolean;
    userIds: string[];
}