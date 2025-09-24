

import React, { useState, useEffect, useContext } from 'react';
import { useApi } from '../../hooks/useApi';
import { AuthContext } from '../../contexts/AuthContext';
import { ActivityLog, Announcement, User, Page, Task, PaymentStatus, JobStatus } from '../../types';
import Icon from '../common/Icon';
import Avatar from '../common/Avatar';
import AccessDenied from '../common/AccessDenied';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- Helper Components defined within the same file ---

// KPI Card Component
interface KpiCardProps {
    title: string;
    value: string | number;
    icon: string;
    color: string;
    onClick?: () => void;
}
const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon, color, onClick }) => (
    <button onClick={onClick} className="bg-white dark:bg-dark-bg-card p-6 rounded-xl shadow-md flex items-center justify-between text-left w-full hover:shadow-lg transition-shadow disabled:opacity-70 disabled:cursor-default" disabled={!onClick}>
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-3xl font-bold text-light-text dark:text-dark-text">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ml-2 ${color}`}>
            <Icon name={icon} className="w-6 h-6 text-white" />
        </div>
    </button>
);

// Financial Chart Component (using recharts)
const financialData = [
    { name: 'Jan', income: 4000, expenses: 2400 },
    { name: 'Feb', income: 3000, expenses: 1398 },
    { name: 'Mar', income: 5000, expenses: 9800 },
    { name: 'Apr', income: 4780, expenses: 3908 },
    { name: 'May', income: 3890, expenses: 4800 },
    { name: 'Jun', income: 6390, expenses: 3800 },
];
const FinancialChart: React.FC = () => (
    <div className="bg-white dark:bg-dark-bg-card p-6 rounded-xl shadow-md h-80">
        <h3 className="font-serif font-bold text-lg mb-4">Financial Overview</h3>
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={financialData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(30, 41, 59, 0.9)', 
                    borderColor: '#334155',
                    borderRadius: '0.5rem'
                  }} 
                  cursor={{fill: 'rgba(100, 116, 139, 0.1)'}}
                />
                <Legend />
                <Bar dataKey="income" fill="#2563eb" name="Income" />
                <Bar dataKey="expenses" fill="#10b981" name="Expenses" />
            </BarChart>
        </ResponsiveContainer>
    </div>
);

// Activity Feed Component
const ActivityFeed: React.FC<{ activities: ActivityLog[], users: User[] }> = ({ activities, users }) => {
    // FIX: Use a plain object for the user map for better type inference.
    const userMap: Record<string, User> = Object.fromEntries(users.map(u => [u.id, u]));
    return (
        <div className="bg-white dark:bg-dark-bg-card p-6 rounded-xl shadow-md">
            <h3 className="font-serif font-bold text-lg mb-4">Recent Activity</h3>
            <ul className="space-y-4">
                {activities.slice(0, 5).map(activity => {
                    // FIX: Access user from the object map.
                    const user = userMap[activity.userId];
                    return (
                        <li key={activity.id} className="flex items-start space-x-3">
                            {user ? <Avatar name={user.name} size="sm" /> : <div className="w-8 h-8 rounded-full bg-gray-300" />}
                            <div>
                                <p className="text-sm">
                                    <span className="font-bold">{user?.name || 'Unknown User'}</span> {activity.action}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(activity.timestamp).toLocaleString()}</p>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

// Announcements Component
const Announcements: React.FC<{ announcements: Announcement[], users: User[] }> = ({ announcements, users }) => {
    const userMap = new Map(users.map(u => [u.id, u.name]));
    return (
        <div className="bg-white dark:bg-dark-bg-card p-6 rounded-xl shadow-md">
            <h3 className="font-serif font-bold text-lg mb-4">Announcements</h3>
            <ul className="space-y-4">
                {announcements.slice(0, 3).map(ann => (
                    <li key={ann.id} className="border-l-4 border-secondary-light dark:border-secondary-dark pl-4">
                        <p className="font-bold">{ann.title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{ann.content}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            By {userMap.get(ann.authorId) || 'Admin'} on {new Date(ann.timestamp).toLocaleDateString()}
                        </p>
                    </li>
                ))}
            </ul>
        </div>
    );
};


// --- Main Dashboard Page Component ---

interface DashboardPageProps {
    navigate: (page: Page, props?: Record<string, any>) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ navigate }) => {
    const { user, hasPermission } = useContext(AuthContext)!;
    const api = useApi();
    const [kpis, setKpis] = useState({ totalCollections: 0, pendingApprovals: 0, activeJobs: 0, unreadMessages: 0 });
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [dueTasksCount, setDueTasksCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fetchData = async () => {
            setLoading(true);
            try {
                const [kpiData, activityData, announcementData, userData, taskData] = await Promise.all([
                    api.getDashboardKPIs(),
                    api.getActivity(),
                    api.getAnnouncements(),
                    api.getUsers(),
                    api.getTasks(user.id)
                ]);
                setKpis(kpiData);
                setActivities(activityData);
                setAnnouncements(announcementData.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
                setUsers(userData);

                const now = new Date();
                now.setHours(0, 0, 0, 0);
                const urgentTasks = taskData.filter(task => {
                    if (task.isCompleted) return false;
                    const dueDate = new Date(task.dueDate);
                    const diffTime = dueDate.getTime() - now.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return diffDays <= 3;
                });
                setDueTasksCount(urgentTasks.length);

            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    if (!hasPermission('dashboard:view')) {
        return <AccessDenied />;
    }

    if (loading) {
        return <div className="text-center p-8">Loading Dashboard...</div>;
    }

    const canViewFinance = hasPermission('finance:view');

    const kpiCards = [];
    if (canViewFinance) {
        kpiCards.push(
            <KpiCard 
                key="collections"
                title="Total Collections (AED)" 
                value={kpis.totalCollections.toLocaleString()} 
                icon="currency-dollar" 
                color="bg-blue-500"
                onClick={() => navigate('finance', { initialTab: 'collections' })}
            />
        );
    }
    if (hasPermission('finance:approve')) {
        kpiCards.push(
            <KpiCard 
                key="approvals"
                title="Pending Approvals" 
                value={kpis.pendingApprovals} 
                icon="check-circle" 
                color="bg-yellow-500" 
                onClick={() => navigate('finance', { initialTab: 'payments', initialFilter: PaymentStatus.PENDING })}
            />
        );
    }
    if (hasPermission('jobs:view')) {
        kpiCards.push(
            <KpiCard 
                key="jobs"
                title="Active Service Jobs" 
                value={kpis.activeJobs} 
                icon="wrench-screwdriver" 
                color="bg-green-500" 
                onClick={() => navigate('jobs', { initialFilter: JobStatus.IN_PROGRESS })}
            />
        );
    }
    if (hasPermission('messages:view')) {
         kpiCards.push(
            <KpiCard 
                key="messages"
                title="Unread Messages" 
                value={kpis.unreadMessages} 
                icon="chat-bubble-left-right" 
                color="bg-purple-500" 
                onClick={() => navigate('messages')}
            />
        );
    }


    return (
        <div className="space-y-6">
            {dueTasksCount > 0 && (
                <div className="bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-200 p-4 rounded-md mb-6 flex justify-between items-center shadow-sm" role="alert">
                    <div>
                        <p className="font-bold">Heads up!</p>
                        <p>You have {dueTasksCount} task{dueTasksCount > 1 ? 's' : ''} that require your attention (overdue or due within 3 days).</p>
                    </div>
                    <button onClick={() => navigate('tasks')} className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-600 transition-colors flex-shrink-0 ml-4">
                        View Tasks
                    </button>
                </div>
            )}

            <h1 className="text-3xl font-serif font-bold text-light-text dark:text-dark-text">
                Welcome back, {user?.name.split(' ')[0]}!
            </h1>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpiCards}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {canViewFinance ? (
                    <>
                        <div className="lg:col-span-2">
                            <FinancialChart />
                        </div>
                        <div>
                            <ActivityFeed activities={activities} users={users} />
                        </div>
                    </>
                ) : (
                    <div className="lg:col-span-3">
                        <ActivityFeed activities={activities} users={users} />
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                 <div>
                    <Announcements announcements={announcements} users={users} />
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
