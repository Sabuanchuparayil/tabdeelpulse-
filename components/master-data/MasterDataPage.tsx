import React, { useState, useEffect, useContext } from 'react';
import { useApi } from '../../hooks/useApi';
import { Project, AccountHead, ProjectStatus, ApprovalStatus, Page } from '../../types';
import { AuthContext } from '../../contexts/AuthContext';
import AccessDenied from '../common/AccessDenied';
import TabButton from '../common/TabButton';
import AccountReviewModal from './AccountReviewModal';
import Icon from '../common/Icon';

type MasterDataTab = 'projects' | 'accounts';

interface MasterDataPageProps {
    initialTab?: MasterDataTab;
    navigate: (page: Page, props?: Record<string, any>) => void;
}

const MasterDataPage: React.FC<MasterDataPageProps> = ({ initialTab = 'projects', navigate }) => {
    const [activeTab, setActiveTab] = useState<MasterDataTab>(initialTab);
    const { hasPermission } = useContext(AuthContext)!;

    const canViewProjects = hasPermission('projects:manage');
    const canViewAccounts = hasPermission('accounts:manage');

    useEffect(() => {
        // If the initial tab is not accessible, switch to one that is.
        if (initialTab === 'projects' && !canViewProjects && canViewAccounts) {
            setActiveTab('accounts');
        } else if (initialTab === 'accounts' && !canViewAccounts && canViewProjects) {
            setActiveTab('projects');
        }
    }, [initialTab, canViewProjects, canViewAccounts]);

    if (!canViewProjects && !canViewAccounts) {
        return <AccessDenied />;
    }

    return (
        <div>
            <h1 className="text-3xl font-serif font-bold mb-6">Master Data</h1>
            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <nav className="-mb-px flex space-x-6">
                    {/* Fix: Explicitly provide generic type to TabButton to ensure correct type inference. */}
                    {canViewProjects && <TabButton<MasterDataTab> name="Projects" tab="projects" activeTab={activeTab} setActiveTab={setActiveTab} />}
                    {/* Fix: Explicitly provide generic type to TabButton to ensure correct type inference. */}
                    {canViewAccounts && <TabButton<MasterDataTab> name="Account Heads" tab="accounts" activeTab={activeTab} setActiveTab={setActiveTab} />}
                </nav>
            </div>
            <div>
                {activeTab === 'projects' && canViewProjects && <Projects />}
                {activeTab === 'accounts' && canViewAccounts && <AccountHeads />}
            </div>
        </div>
    );
};


// --- Projects Component ---
const Projects: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const api = useApi();

    useEffect(() => {
        api.getProjects().then(setProjects);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getStatusClass = (status: ProjectStatus) => {
        switch (status) {
            case ProjectStatus.ACTIVE: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case ProjectStatus.ON_HOLD: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case ProjectStatus.COMPLETED: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
        }
    };

    return (
        <div className="bg-white dark:bg-dark-bg-card rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th className="px-6 py-3">Project Name</th>
                            <th className="px-6 py-3">Client</th>
                            <th className="px-6 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projects.map(p => (
                            <tr key={p.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{p.name}</td>
                                <td className="px-6 py-4">{p.client}</td>
                                <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(p.status)}`}>{p.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- Account Heads Component ---
const AccountHeads: React.FC = () => {
    const [accounts, setAccounts] = useState<AccountHead[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<AccountHead | null>(null);
    const api = useApi();
    const { hasPermission } = useContext(AuthContext)!;

    useEffect(() => {
        fetchAccounts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchAccounts = () => {
        api.getAccounts().then(setAccounts);
    };

    const handleUpdate = (updatedAccount: AccountHead) => {
        setAccounts(prev => prev.map(a => a.id === updatedAccount.id ? updatedAccount : a));
        setSelectedAccount(null);
    };
    
    const getStatusClass = (status: ApprovalStatus) => ({
        [ApprovalStatus.APPROVED]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        [ApprovalStatus.PENDING]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        [ApprovalStatus.REJECTED]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    }[status]);

    return (
        <>
            <div className="bg-white dark:bg-dark-bg-card rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th className="px-6 py-3">Account Name</th>
                                <th className="px-6 py-3">Bank</th>
                                <th className="px-6 py-3">Account Number</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {accounts.map(a => (
                                <tr key={a.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{a.name}</td>
                                    <td className="px-6 py-4">{a.bankName}</td>
                                    <td className="px-6 py-4">{a.accountNumber}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(a.approvalStatus)}`}>
                                                {a.approvalStatus}
                                            </span>
                                            {a.approvalStatus === ApprovalStatus.REJECTED && a.rejectionReason && (
                                                <div className="relative group">
                                                    <Icon name="chat-bubble-left-ellipsis" className="w-4 h-4 text-gray-500" />
                                                    <div className="absolute bottom-full mb-2 w-48 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
                                                        {a.rejectionReason}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {a.approvalStatus === ApprovalStatus.PENDING && hasPermission('accounts:approve') && (
                                            <button onClick={() => setSelectedAccount(a)} className="text-blue-600 hover:underline">Review</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {selectedAccount && (
                <AccountReviewModal
                    isOpen={!!selectedAccount}
                    onClose={() => setSelectedAccount(null)}
                    onUpdate={handleUpdate}
                    account={selectedAccount}
                />
            )}
        </>
    );
};

export default MasterDataPage;