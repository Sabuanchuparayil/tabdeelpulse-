import React, { useState, useContext, useRef, useEffect } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { ThemeContext, Theme } from '../../contexts/ThemeContext';
import { Page, User, Notification } from '../../types';
import Icon from '../common/Icon';
import Avatar from '../common/Avatar';
import { useApi } from '../../hooks/useApi';

interface HeaderProps {
    onToggleSidebar: () => void;
    navigate: (page: Page) => void;
    isSidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, navigate, isSidebarOpen }) => {
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [isImpersonateOpen, setImpersonateOpen] = useState(false);
    const [isNotificationsOpen, setNotificationsOpen] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    
    const authContext = useContext(AuthContext);
    const themeContext = useContext(ThemeContext);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const api = useApi();

    const user = authContext?.user;
    const unreadCount = notifications.filter(n => !n.isRead).length;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
                setImpersonateOpen(false);
                setNotificationsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    useEffect(() => {
        if(isImpersonateOpen){
            api.getUsers().then(setUsers);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isImpersonateOpen]);

    useEffect(() => {
        if (user) {
            const fetchNotifs = async () => {
                const allNotifs = await api.getNotifications(user.id);
                setNotifications(allNotifs);
            };
            fetchNotifs();
            
            // SRE/PERFORMANCE NOTE: Polling with setInterval is simple for a mock environment
            // but is inefficient in production. It creates constant, unnecessary network
            // traffic. For a real-world app, this should be replaced with a real-time
            // connection like WebSockets or Server-Sent Events (SSE) to push updates
            // from the server to the client when they occur.
            const interval = setInterval(fetchNotifs, 5000); // Poll for new notifications
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    if (!user || !themeContext) return null;

    const handleImpersonate = (userId: string) => {
        authContext?.impersonate(userId);
        setImpersonateOpen(false);
        setDropdownOpen(false);
    };

    const handleMarkAllRead = async () => {
        if (user) {
            const updated = await api.markAllAsRead(user.id);
            setNotifications(updated);
        }
    };
    
    return (
        <header className="bg-white dark:bg-dark-bg-card shadow-sm h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-30 flex-shrink-0">
            <div className="flex items-center">
                <button onClick={onToggleSidebar} className="text-gray-500 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-light">
                    <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isSidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                    </svg>
                </button>
            </div>
            <div className="flex items-center space-x-4">
                <button onClick={themeContext.toggleTheme} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Icon name={themeContext.theme === Theme.LIGHT ? 'moon' : 'sun'} className="w-6 h-6" />
                </button>

                {/* Notifications Bell */}
                <div className="relative">
                    <button onClick={() => setNotificationsOpen(p => !p)} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 relative">
                        <Icon name="bell" className="w-6 h-6" />
                        {unreadCount > 0 && <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-dark-bg-card" />}
                    </button>
                    {isNotificationsOpen && (
                        <div ref={dropdownRef} className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-40">
                            <div className="flex justify-between items-center p-3 border-b dark:border-gray-700">
                                <h4 className="font-semibold text-sm">Notifications</h4>
                                {unreadCount > 0 && <button onClick={handleMarkAllRead} className="text-xs text-primary-light dark:text-primary-dark hover:underline">Mark all as read</button>}
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                {notifications.length > 0 ? notifications.map(n => (
                                    <div key={n.id} className={`p-3 border-b dark:border-gray-700/50 flex items-start space-x-2 ${!n.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                                        {!n.isRead && <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>}
                                        <div className={n.isRead ? 'pl-4' : ''}>
                                            <p className="text-sm">{n.message}</p>
                                            <p className="text-xs text-gray-500 mt-1">{new Date(n.timestamp).toLocaleString()}</p>
                                        </div>
                                    </div>
                                )) : <p className="p-4 text-center text-sm text-gray-500">No notifications yet.</p>}
                            </div>
                        </div>
                    )}
                </div>

                {/* User Profile Dropdown */}
                <div className="relative">
                    <button onClick={() => setDropdownOpen(!isDropdownOpen)} className="flex items-center space-x-2">
                        <Avatar name={user.name} size="sm" />
                        <span className="hidden md:inline font-medium text-sm">{user.name}</span>
                    </button>
                    {isDropdownOpen && (
                        <div ref={dropdownRef} className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-40">
                            <div className="px-4 py-2 border-b dark:border-gray-700">
                                <p className="text-sm font-medium truncate">{user.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                            </div>
                            <a href="#" onClick={() => { navigate('profile'); setDropdownOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">My Profile</a>
                            
                            {authContext.hasPermission('users:impersonate') && !authContext.isImpersonating && (
                                <button onClick={() => setImpersonateOpen(!isImpersonateOpen)} className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                                    Impersonate User
                                </button>
                            )}

                            <a href="#" onClick={authContext.logout} className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                                <Icon name="arrow-left-on-rectangle" className="w-5 h-5 mr-2" />
                                Logout
                            </a>
                        </div>
                    )}
                     {isImpersonateOpen && (
                        <div ref={dropdownRef} className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-40">
                             <div className="p-2 border-b dark:border-gray-700 font-bold">Select User to Impersonate</div>
                             <div className="max-h-60 overflow-y-auto">
                                {users.filter(u => u.id !== user.id).map(u => (
                                    <button key={u.id} onClick={() => handleImpersonate(u.id)} className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                                        {u.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;