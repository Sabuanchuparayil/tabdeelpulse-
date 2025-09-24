import React, { useState, useContext, useCallback, useEffect } from 'react';
import { Page, PaymentStatus, JobStatus } from '../../types';
import { AuthContext } from '../../contexts/AuthContext';
import Header from './Header';
import Sidebar from './Sidebar';

import DashboardPage from '../dashboard/DashboardPage';
import FinancePage from '../finance/FinancePage';
import ServiceJobsPage from '../jobs/ServiceJobsPage';
import MessagingPage from '../messages/MessagingPage';
import UserManagementPage from '../users/UserManagementPage';
import RoleManagementPage from '../roles/RoleManagementPage';
import UserProfilePage from '../users/UserProfilePage';
import MasterDataPage from '../master-data/MasterDataPage';
import ProductivityPage from '../productivity/ProductivityPage';
import AssetManagementPage from '../assets/AssetManagementPage';

type PageProps = {
    navigate: (page: Page, props?: Record<string, any>) => void;
    initialTab?: string;
    initialFilter?: PaymentStatus | JobStatus;
}

const pageComponents: Record<Page, React.ComponentType<PageProps>> = {
    dashboard: DashboardPage,
    finance: FinancePage,
    jobs: ServiceJobsPage,
    messages: MessagingPage,
    tasks: (props) => <ProductivityPage {...props} initialTab="tasks" />,
    announcements: (props) => <ProductivityPage {...props} initialTab="announcements" />,
    users: UserManagementPage,
    roles: RoleManagementPage,
    projects: (props) => <MasterDataPage {...props} initialTab="projects" />,
    accounts: (props) => <MasterDataPage {...props} initialTab="accounts" />,
    assets: AssetManagementPage,
    profile: UserProfilePage,
};

const MainLayout: React.FC = () => {
    const [activePage, setActivePage] = useState<Page>('dashboard');
    const [pageProps, setPageProps] = useState<Record<string, any> | undefined>();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isSidebarOpen, setSidebarOpen] = useState(!isMobile);
    const authContext = useContext(AuthContext);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) {
                setSidebarOpen(true);
            } else {
                setSidebarOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const navigate = useCallback((page: Page, props: Record<string, any> = {}) => {
        setActivePage(page);
        setPageProps(props);
        if (isMobile) {
            setSidebarOpen(false);
        }
    }, [isMobile]);

    const PageComponent = pageComponents[activePage];

    if (!authContext?.user) {
        return null;
    }

    return (
        <div className="flex h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text">
            {authContext.isImpersonating && authContext.originalUser && (
                <div className="fixed top-0 left-0 right-0 bg-yellow-400 dark:bg-yellow-600 text-black dark:text-white text-center p-2 text-sm z-[100]">
                    You are viewing as <strong>{authContext.user.name}</strong>. 
                    <button onClick={authContext.stopImpersonating} className="ml-4 font-bold underline">Return to your account</button>
                </div>
            )}

            {isMobile && isSidebarOpen && (
                 <div className="fixed inset-0 bg-black/50 z-30" onClick={() => setSidebarOpen(false)} />
            )}
            
            <Sidebar 
                isOpen={isSidebarOpen} 
                activePage={activePage} 
                navigate={navigate} 
                className={authContext.isImpersonating ? "pt-10" : ""}
            />
            
            <div className={`flex-1 flex flex-col transition-all duration-300 min-w-0 ${isSidebarOpen ? 'md:ml-64' : ''}`}>
                <Header 
                    onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)} 
                    navigate={navigate}
                    isSidebarOpen={isSidebarOpen}
                />
                
                <main className={`flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto ${authContext.isImpersonating ? "pt-14" : ""}`}>
                    {PageComponent && <PageComponent {...pageProps} navigate={navigate} />}
                </main>
            </div>
        </div>
    );
};

// Re-export Header and Sidebar to avoid circular dependencies if they need MainLayout types.
export { Header, Sidebar };
export default MainLayout;