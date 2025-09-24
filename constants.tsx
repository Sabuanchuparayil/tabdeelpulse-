
import React from 'react';
import { Page } from './types';

export const APP_NAME = "Tabdeel Pulse+";

export const Logo: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`flex items-center space-x-3 ${className}`}>
        <svg width="40" height="40" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="64" height="64" rx="12" fill="currentColor" className="text-primary-light dark:text-primary-dark" />
            <path d="M10 32 H18 L24 16 L32 48 L40 24 L46 32 H54" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="font-serif text-2xl font-bold text-light-text dark:text-dark-text">{APP_NAME}</span>
    </div>
);

export const ALL_PERMISSIONS = [
    'dashboard:view',
    'finance:view', 'finance:create', 'finance:approve', 'finance:delete',
    'jobs:view', 'jobs:create', 'jobs:assign', 'jobs:update',
    'messages:view', 'messages:create', 'messages:manage_participants',
    'users:view', 'users:create', 'users:edit', 'users:disable', 'users:impersonate',
    'roles:view', 'roles:manage',
    'projects:manage',
    'accounts:manage', 'accounts:approve',
    'tasks:manage',
    'announcements:manage',
    'assets:view', 'assets:manage', 'assets:move',
];

export const NAV_ITEMS: { label: string; page: Page; icon: string; permission: string }[] = [
    { label: 'Dashboard', page: 'dashboard', icon: 'home', permission: 'dashboard:view' },
    { label: 'Finance', page: 'finance', icon: 'currency-dollar', permission: 'finance:view' },
    { label: 'Service Jobs', page: 'jobs', icon: 'wrench-screwdriver', permission: 'jobs:view' },
    { label: 'Messages', page: 'messages', icon: 'chat-bubble-left-right', permission: 'messages:view' },
    { label: 'Tasks', page: 'tasks', icon: 'check-circle', permission: 'tasks:manage' },
    { label: 'Announcements', page: 'announcements', icon: 'megaphone', permission: 'announcements:manage' },
];

export const ADMIN_NAV_ITEMS: { label: string; page: Page; icon: string; permission: string }[] = [
    { label: 'User Management', page: 'users', icon: 'users', permission: 'users:view' },
    { label: 'Roles & Permissions', page: 'roles', icon: 'shield-check', permission: 'roles:manage' },
    { label: 'Projects', page: 'projects', icon: 'briefcase', permission: 'projects:manage' },
    { label: 'Account Heads', page: 'accounts', icon: 'building-library', permission: 'accounts:manage' },
    { label: 'Assets', page: 'assets', icon: 'archive-box', permission: 'assets:view' },
];