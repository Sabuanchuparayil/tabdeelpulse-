import React, { useState, useEffect, useContext } from 'react';
import { Asset, User, Project, AssetCategory, AssetStatus } from '../../types';
import { useApi } from '../../hooks/useApi';
import { AuthContext } from '../../contexts/AuthContext';
import Modal from '../common/Modal';

interface AssetFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    asset: Asset | null;
    users: User[];
    projects: Project[];
}

const AssetFormModal: React.FC<AssetFormModalProps> = ({ isOpen, onClose, onSave, asset, users, projects }) => {
    const [formData, setFormData] = useState<Partial<Asset>>({});
    const [isLoading, setIsLoading] = useState(false);
    const api = useApi();
    const { user } = useContext(AuthContext)!;

    useEffect(() => {
        if (asset) {
            setFormData({ ...asset });
        } else {
            // Default values for a new asset
            setFormData({
                name: '',
                description: '',
                purchaseDate: new Date().toISOString().split('T')[0],
                purchaseCost: 0,
                category: AssetCategory.OFFICE,
                assignedToId: users[0]?.id || '',
                status: AssetStatus.ACTIVE,
                depreciationRate: 0.20
            });
        }
    }, [asset, users]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCategory = e.target.value as AssetCategory;
        const updates: Partial<Asset> = { category: newCategory };
        // Reset assignedToId when category changes
        if (newCategory === AssetCategory.OFFICE) updates.assignedToId = users[0]?.id || '';
        else if (newCategory === AssetCategory.PROJECT) updates.assignedToId = projects[0]?.id || '';
        else updates.assignedToId = '';
        
        setFormData(prev => ({ ...prev, ...updates }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsLoading(true);
        try {
            if (formData.id) { // Editing
                await api.updateAsset(formData as Asset, user.id);
            } else { // Creating
                await api.addAsset(formData as Omit<Asset, 'id' | 'movements' | 'createdTimestamp' | 'updatedTimestamp'>, user.id);
            }
            onSave();
        } catch (error) {
            console.error("Failed to save asset:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const renderAssigneeField = () => {
        switch (formData.category) {
            case AssetCategory.OFFICE:
                return (
                    <select name="assignedToId" value={formData.assignedToId} onChange={handleChange} className="w-full p-2 border rounded-md bg-transparent dark:border-gray-600 dark:bg-dark-bg-card">
                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                );
            case AssetCategory.PROJECT:
                return (
                    <select name="assignedToId" value={formData.assignedToId} onChange={handleChange} className="w-full p-2 border rounded-md bg-transparent dark:border-gray-600 dark:bg-dark-bg-card">
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                );
            case AssetCategory.COMMON:
                return <input type="text" name="assignedToId" value={formData.assignedToId} onChange={handleChange} placeholder="e.g., Conference Room" className="w-full p-2 border rounded-md bg-transparent dark:border-gray-600" />;
            default:
                return null;
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={asset ? 'Edit Asset' : 'Add New Asset'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Asset Name</label>
                    <input type="text" name="name" value={formData.name || ''} onChange={handleChange} required className="w-full p-2 border rounded-md bg-transparent dark:border-gray-600" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea name="description" value={formData.description || ''} onChange={handleChange} rows={2} className="w-full p-2 border rounded-md bg-transparent dark:border-gray-600" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Purchase Date</label>
                        <input type="date" name="purchaseDate" value={formData.purchaseDate || ''} onChange={handleChange} required className="w-full p-2 border rounded-md bg-transparent dark:border-gray-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Purchase Cost (AED)</label>
                        <input type="number" name="purchaseCost" value={formData.purchaseCost || 0} onChange={e => setFormData(p => ({...p, purchaseCost: parseFloat(e.target.value)}))} required className="w-full p-2 border rounded-md bg-transparent dark:border-gray-600" />
                    </div>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Category</label>
                        <select name="category" value={formData.category} onChange={handleCategoryChange} className="w-full p-2 border rounded-md bg-transparent dark:border-gray-600 dark:bg-dark-bg-card">
                            {Object.values(AssetCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Assigned To</label>
                        {renderAssigneeField()}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium mb-1">Status</label>
                        <select name="status" value={formData.status} onChange={handleChange} className="w-full p-2 border rounded-md bg-transparent dark:border-gray-600 dark:bg-dark-bg-card">
                            {Object.values(AssetStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Depreciation Rate (%)</label>
                        <input type="number" name="depreciationRate" value={(formData.depreciationRate || 0) * 100} onChange={e => setFormData(p => ({...p, depreciationRate: parseFloat(e.target.value) / 100}))} required className="w-full p-2 border rounded-md bg-transparent dark:border-gray-600" />
                    </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
                    <button type="submit" disabled={isLoading} className="px-4 py-2 rounded-lg bg-primary-light dark:bg-primary-dark text-white hover:opacity-90 disabled:opacity-50">
                        {isLoading ? 'Saving...' : 'Save Asset'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default AssetFormModal;