import React, { useState, useEffect, useContext } from 'react';
import { useApi } from '../../hooks/useApi';
import { Role, Page } from '../../types';
import { AuthContext } from '../../contexts/AuthContext';
import { ALL_PERMISSIONS } from '../../constants';
import Modal from '../common/Modal';
import AccessDenied from '../common/AccessDenied';

interface RoleManagementPageProps {
    navigate: (page: Page, props?: Record<string, any>) => void;
}

const RoleManagementPage: React.FC<RoleManagementPageProps> = ({ navigate }) => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentRole, setCurrentRole] = useState<Role | null>(null);
    const api = useApi();
    const { hasPermission } = useContext(AuthContext)!;

    useEffect(() => {
        const fetchRoles = async () => {
            setLoading(true);
            const roleData = await api.getRoles();
            setRoles(roleData);
            setLoading(false);
        };
        fetchRoles();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const openModal = (role: Role) => {
        setCurrentRole({ ...role });
        setIsModalOpen(true);
    };

    const handlePermissionChange = (permission: string, isChecked: boolean) => {
        if (currentRole) {
            const newPermissions = isChecked
                ? [...currentRole.permissions, permission]
                : currentRole.permissions.filter(p => p !== permission);
            setCurrentRole({ ...currentRole, permissions: newPermissions });
        }
    };

    const handleSave = async () => {
        if (!currentRole) return;
        await api.updateRole(currentRole);
        const roleData = await api.getRoles();
        setRoles(roleData);
        setIsModalOpen(false);
        setCurrentRole(null);
    };
    
    if (!hasPermission('roles:manage')) {
        return <AccessDenied />;
    }

    return (
        <div>
            <h1 className="text-3xl font-serif font-bold mb-6">Roles & Permissions</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <p>Loading roles...</p>
                ) : (
                    roles.map(role => (
                        <div key={role.id} className="bg-white dark:bg-dark-bg-card p-6 rounded-xl shadow-md">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-bold font-serif">{role.name}</h2>
                                    <p className="text-sm text-gray-500">{role.permissions.length} permissions</p>
                                </div>
                                {hasPermission('roles:manage') && !role.isDefault && (
                                    <button onClick={() => openModal(role)} className="text-primary-light dark:text-primary-dark text-sm font-medium hover:underline">Edit</button>
                                )}
                            </div>
                            <div className="mt-4 pt-4 border-t dark:border-gray-700">
                                <h4 className="text-sm font-semibold mb-2">Key Permissions:</h4>
                                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                                    {role.permissions.slice(0, 5).map(p => <li key={p}>- {p}</li>)}
                                    {role.permissions.length > 5 && <li>... and {role.permissions.length - 5} more</li>}
                                </ul>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Edit Permissions for ${currentRole?.name}`} size="lg">
                {currentRole && (
                    <div>
                        <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto p-1">
                            {ALL_PERMISSIONS.map(permission => (
                                <label key={permission} className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={currentRole.permissions.includes(permission)}
                                        onChange={(e) => handlePermissionChange(permission, e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-primary-light focus:ring-primary-light"
                                    />
                                    <span>{permission}</span>
                                </label>
                            ))}
                        </div>
                        <div className="flex justify-end space-x-2 pt-6">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
                            <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-primary-light dark:bg-primary-dark text-white hover:opacity-90">Save Changes</button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default RoleManagementPage;