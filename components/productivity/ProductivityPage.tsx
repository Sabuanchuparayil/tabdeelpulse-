import React, { useState, useEffect, useContext } from 'react';
import { useApi } from '../../hooks/useApi';
import { AuthContext } from '../../contexts/AuthContext';
import { User, Page } from '../../types';
import AccessDenied from '../common/AccessDenied';
import TabButton from '../common/TabButton';
import TaskView from './TaskView';
import AnnouncementView from './AnnouncementView';

type ProductivityTab = 'tasks' | 'announcements';

interface ProductivityPageProps {
    initialTab?: ProductivityTab;
    navigate: (page: Page, props?: Record<string, any>) => void;
}

const ProductivityPage: React.FC<ProductivityPageProps> = ({ initialTab = 'tasks', navigate }) => {
    const [activeTab, setActiveTab] = useState<ProductivityTab>(initialTab);
    const [users, setUsers] = useState<User[]>([]);
    const api = useApi();
    const { hasPermission } = useContext(AuthContext)!;
    
    const canManageTasks = hasPermission('tasks:manage');
    const canManageAnnouncements = hasPermission('announcements:manage');

    useEffect(() => {
        api.getUsers().then(setUsers);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (initialTab === 'tasks' && !canManageTasks && canManageAnnouncements) {
            setActiveTab('announcements');
        } else if (initialTab === 'announcements' && !canManageAnnouncements && canManageTasks) {
            setActiveTab('tasks');
        }
    }, [initialTab, canManageTasks, canManageAnnouncements]);


    if (!canManageTasks && !canManageAnnouncements) {
        return <AccessDenied />;
    }

    return (
        <div>
            <h1 className="text-3xl font-serif font-bold mb-6">Productivity Suite</h1>
            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <nav className="-mb-px flex space-x-6">
                    {/* Fix: Explicitly provide generic type to TabButton to ensure correct type inference. */}
                    {canManageTasks && <TabButton<ProductivityTab> name="My Tasks" tab="tasks" activeTab={activeTab} setActiveTab={setActiveTab} />}
                    {/* Fix: Explicitly provide generic type to TabButton to ensure correct type inference. */}
                    {canManageAnnouncements && <TabButton<ProductivityTab> name="Announcements" tab="announcements" activeTab={activeTab} setActiveTab={setActiveTab} />}
                </nav>
            </div>
            <div>
                {activeTab === 'tasks' && canManageTasks && <TaskView users={users} />}
                {activeTab === 'announcements' && canManageAnnouncements && <AnnouncementView users={users} />}
            </div>
        </div>
    );
};

export default ProductivityPage;