import React, { useState, useEffect, useContext } from 'react';
import { useApi } from '../../hooks/useApi';
import { User, Role, UserStatus, Page } from '../../types';
import { AuthContext } from '../../contexts/AuthContext';
import Modal from '../common/Modal';
import Icon from '../common/Icon';
import Avatar from '../common/Avatar';
import AccessDenied from '../common/AccessDenied';
import PageHeader from '../common/PageHeader';

interface UserManagementPageProps {
    navigate: (page: Page, props?: Record<string, any>) => void;
}

const UserManagementPage: React.FC<UserManagementPageProps> = ({ navigate }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<Partial<User> | null>(null);
    const api = useApi();
    const { hasPermission } = useContext(AuthContext)!;
    const roleMap = new Map(roles.map(r => [r.id, r.name]));

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [userData, roleData] = await Promise.all([api.getUsers(), api.getRoles()]);
            setUsers(userData);
            setRoles(roleData);
            setLoading(false);
        };
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const openModal = (user: Partial<User> | null = null) => {
        setCurrentUser(user ? { ...user } : { name: '', email: '', roleId: roles.find(r=>r.name === 'Technician')?.id || '', status: UserStatus.ACTIVE });
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!currentUser) return;
        
        try {
            if (currentUser.id) { // Editing
                 await api.updateUser(currentUser as User);
            } else { // Adding
                await api.addUser(currentUser as Omit<User, 'id'>);
            }

            const userData = await api.getUsers();
            setUsers(userData);
            setIsModalOpen(false);
            setCurrentUser(null);
        } catch (error) {
            console.error("Failed to save user:", error);
            // Here you could set an error state to show a message to the user
        }
    };

    const handleFieldChange = (field: keyof User, value: any) => {
        if (currentUser) {
            const updatedUser = { ...currentUser, [field]: value };
            // Clear disable reason if status is changed back to Active
            if (field === 'status' && value === UserStatus.ACTIVE) {
                delete updatedUser.disableReason;
            }
            setCurrentUser(updatedUser);
        }
    };

    if (!hasPermission('users:view')) {
        return <AccessDenied />;
    }

    return (
        <div>
            <PageHeader title="User Management">
                {hasPermission('users:create') && (
                    <button onClick={() => openModal()} className="bg-primary-light dark:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:opacity-90">
                        <Icon name="plus" className="w-5 h-5" />
                        <span>Add User</span>
                    </button>
                )}
            </PageHeader>
            
            <div className="bg-white dark:bg-dark-bg-card rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Name</th>
                                <th scope="col" className="px-6 py-3">Role</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={4} className="text-center p-4">Loading...</td></tr>
                            ) : (
                                users.map(user => (
                                    <tr key={user.id} className="bg-white dark:bg-dark-bg-card border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap flex items-center space-x-3">
                                            <Avatar name={user.name} size="sm" />
                                            <div>
                                                <div>{user.name}</div>
                                                <div className="text-xs text-gray-500">{user.email}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{roleMap.get(user.roleId) || 'Unknown'}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.status === UserStatus.ACTIVE ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
                                                    {user.status}
                                                </span>
                                                {user.status === UserStatus.DISABLED && user.disableReason && (
                                                    <div className="relative group">
                                                        <Icon name="chat-bubble-left-ellipsis" className="w-4 h-4 text-gray-500" />
                                                        <div className="absolute bottom-full mb-2 w-48 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
                                                            {user.disableReason}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {hasPermission('users:edit') && (
                                                <button onClick={() => openModal(user)} className="text-primary-light dark:text-primary-dark hover:underline">Edit</button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentUser?.id ? 'Edit User' : 'Add User'}>
                {currentUser && (
                    <div className="space-y-4">
                         <div>
                            <label className="block text-sm font-medium mb-1">Name</label>
                            <input type="text" value={currentUser.name} onChange={e => handleFieldChange('name', e.target.value)} className="w-full p-2 border rounded-md bg-transparent dark:border-gray-600" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input type="email" value={currentUser.email} onChange={e => handleFieldChange('email', e.target.value)} className="w-full p-2 border rounded-md bg-transparent dark:border-gray-600" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Role</label>
                            <select value={currentUser.roleId} onChange={e => handleFieldChange('roleId', e.target.value)} className="w-full p-2 border rounded-md bg-transparent dark:border-gray-600 dark:bg-dark-bg-card">
                                {roles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Status</label>
                            <select value={currentUser.status} onChange={e => handleFieldChange('status', e.target.value)} className="w-full p-2 border rounded-md bg-transparent dark:border-gray-600 dark:bg-dark-bg-card">
                                <option value={UserStatus.ACTIVE}>Active</option>
                                <option value={UserStatus.DISABLED}>Disabled</option>
                            </select>
                        </div>
                        {currentUser.status === UserStatus.DISABLED && (
                            <div>
                                <label className="block text-sm font-medium mb-1">Reason for Disabling</label>
                                <textarea
                                    value={currentUser.disableReason || ''}
                                    onChange={e => handleFieldChange('disableReason', e.target.value)}
                                    rows={2}
                                    className="w-full p-2 border rounded-md bg-transparent dark:border-gray-600"
                                    placeholder="Optional: Provide a reason..."
                                />
                            </div>
                        )}
                        <div className="flex justify-end space-x-2 pt-4">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
                            <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-primary-light dark:bg-primary-dark text-white hover:opacity-90">Save</button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default UserManagementPage;