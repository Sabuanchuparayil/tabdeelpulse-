import React from 'react';

const AccessDenied: React.FC = () => (
    <div className="p-8 text-center bg-white dark:bg-dark-bg-card rounded-xl shadow-md">
        <h1 className="text-3xl font-serif font-bold text-red-600 dark:text-red-400">Access Denied</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">You do not have the required permissions to view this page.</p>
    </div>
);

export default AccessDenied;
