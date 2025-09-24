import React, { useContext } from 'react';
import { Logo, NAV_ITEMS, ADMIN_NAV_ITEMS } from '../../constants';
import { Page } from '../../types';
import { AuthContext } from '../../contexts/AuthContext';
import Icon from '../common/Icon';

interface SidebarProps {
    isOpen: boolean;
    activePage: Page;
    navigate: (page: Page) => void;
    className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, activePage, navigate, className }) => {
    const authContext = useContext(AuthContext);
    
    const hasAdminLinks = ADMIN_NAV_ITEMS.some(item => authContext?.hasPermission(item.permission));

    const NavLink: React.FC<{ item: { label: string; page: Page; icon: string; permission: string } }> = ({ item }) => {
        if (!authContext?.hasPermission(item.permission)) {
            return null;
        }

        const isActive = activePage === item.page;
        return (
            <li>
                <a
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        navigate(item.page);
                    }}
                    className={`flex items-center p-2 text-base font-normal rounded-lg transition-all duration-200 ${
                        isActive
                            ? 'bg-primary-light/10 text-primary-light dark:text-white dark:bg-primary-dark/20'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                    <Icon name={item.icon} className={`w-6 h-6 transition duration-75 ${isActive ? 'text-primary-light dark:text-primary-dark' : 'text-gray-500 dark:text-gray-400'}`} />
                    <span className="ml-3">{item.label}</span>
                </a>
            </li>
        );
    };

    return (
        <aside className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} ${className}`}>
            <div className="h-full px-3 py-4 overflow-y-auto bg-white dark:bg-dark-bg-card border-r border-gray-200 dark:border-gray-700 flex flex-col">
                <div className="p-2 mb-5">
                    <Logo />
                </div>
                <ul className="space-y-2 flex-1">
                    {NAV_ITEMS.map((item) => <NavLink key={item.page} item={item} />)}
                    
                    {hasAdminLinks && (
                        <>
                            <li className="pt-4 pb-2">
                                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Administration</span>
                            </li>
                            {ADMIN_NAV_ITEMS.map((item) => <NavLink key={item.page} item={item} />)}
                        </>
                    )}
                </ul>
                <div className="mt-auto p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                    <p className="text-sm text-blue-800 dark:text-blue-300">© {new Date().getFullYear()} {`Tabdeel Pulse+`}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Version 1.0.0</p>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;