import React, { useState, useContext, useEffect } from 'react';
import { Asset, AssetMovement, AssetMovementType, User, Project, AssetStatus, AssetCategory } from '../../types';
import { AuthContext } from '../../contexts/AuthContext';
import { useApi } from '../../hooks/useApi';
import Modal from '../common/Modal';

interface AssetMovementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedAsset: Asset) => void;
    asset: Asset;
    assigneeMap: Map<string, string>;
}

const AssetMovementModal: React.FC<AssetMovementModalProps> = ({ isOpen, onClose, onSave, asset, assigneeMap }) => {
    const [movement, setMovement] = useState<Partial<AssetMovement>>({
        movementDate: new Date().toISOString().split('T')[0],
        movementType: AssetMovementType.INTERNAL,
        reason: '',
        from: assigneeMap.get(asset.assignedToId) || 'Unknown',
        to: '',
    });
    const [newAssignedToId, setNewAssignedToId] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const api = useApi();
    const { user } = useContext(AuthContext)!;
    
    useEffect(() => {
        if(isOpen) {
            Promise.all([api.getUsers(), api.getProjects()]).then(([u,p]) => {
                setUsers(u);
                setProjects(p);
                // Pre-fill based on asset category
                if (asset.category === AssetCategory.OFFICE) {
                    setNewAssignedToId(u[0]?.id || '');
                } else if (asset.category === AssetCategory.PROJECT) {
                    setNewAssignedToId(p[0]?.id || '');
                }
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, asset.category]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setMovement(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            // Mock handling of file upload
            console.log("File selected:", e.target.files[0].name);
            setMovement(prev => ({ ...prev, documentUrl: `docs/${e.target.files![0].name}` }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsLoading(true);

        const toValue = movement.movementType === AssetMovementType.INTERNAL 
            ? assigneeMap.get(newAssignedToId) || 'Unknown'
            : movement.to;

        const finalMovement = { ...movement, to: toValue } as Omit<AssetMovement, 'id'>;
        
        const newStatus = movement.to === 'Disposal' ? AssetStatus.DISPOSED : undefined;

        try {
            const updatedAsset = await api.addAssetMovement(asset.id, finalMovement, newAssignedToId, user.id, newStatus);
            if (updatedAsset) {
                onSave(updatedAsset);
            }
        } catch (error) {
            console.error("Failed to log movement:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const renderToField = () => {
        if (movement.movementType === AssetMovementType.EXTERNAL) {
            return (
                <select name="to" value={movement.to} onChange={handleChange} className="w-full p-2 border rounded-md bg-transparent dark:border-gray-600 dark:bg-dark-bg-card" required>
                    <option value="">Select Destination</option>
                    <option value="Disposal">Disposal</option>
                    <option value="Lending">Lending</option>
                    <option value="Transfer">Transfer</option>
                </select>
            );
        }
        
        switch (asset.category) {
            case AssetCategory.OFFICE:
                return (
                     <select value={newAssignedToId} onChange={(e) => setNewAssignedToId(e.target.value)} className="w-full p-2 border rounded-md bg-transparent dark:border-gray-600 dark:bg-dark-bg-card" required>
                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                );
            case AssetCategory.PROJECT:
                 return (
                     <select value={newAssignedToId} onChange={(e) => setNewAssignedToId(e.target.value)} className="w-full p-2 border rounded-md bg-transparent dark:border-gray-600 dark:bg-dark-bg-card" required>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                );
            case AssetCategory.COMMON:
                return <input type="text" value={newAssignedToId} onChange={(e) => setNewAssignedToId(e.target.value)} placeholder="e.g., Main Office" className="w-full p-2 border rounded-md bg-transparent dark:border-gray-600" required />;
            default:
                return null;
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Log Movement for ${asset.name}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Movement Date</label>
                        <input type="date" name="movementDate" value={movement.movementDate} onChange={handleChange} required className="w-full p-2 border rounded-md bg-transparent dark:border-gray-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Movement Type</label>
                        <select name="movementType" value={movement.movementType} onChange={handleChange} className="w-full p-2 border rounded-md bg-transparent dark:border-gray-600 dark:bg-dark-bg-card">
                            {Object.values(AssetMovementType).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">From</label>
                        <input type="text" value={movement.from} disabled className="w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium mb-1">To</label>
                        {renderToField()}
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium mb-1">Reason for Movement</label>
                    <textarea name="reason" value={movement.reason} onChange={handleChange} rows={2} required className="w-full p-2 border rounded-md bg-transparent dark:border-gray-600" />
                </div>
                <div>
                     <label className="block text-sm font-medium mb-1">Approval/Signature Document</label>
                     <input type="file" onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/50 dark:file:text-blue-300 dark:hover:file:bg-blue-900"/>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
                    <button type="submit" disabled={isLoading} className="px-4 py-2 rounded-lg bg-primary-light dark:bg-primary-dark text-white hover:opacity-90 disabled:opacity-50">
                        {isLoading ? 'Saving...' : 'Log Movement'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default AssetMovementModal;