import React, { useState, useMemo, useContext } from 'react';
import { Asset, User, Project, AssetStatus } from '../../types';
import { calculateDepreciation } from '../../utils/finance';
import AssetDetailsModal from './AssetDetailsModal';
import { AuthContext } from '../../contexts/AuthContext';

interface AssetListViewProps {
    assets: Asset[];
    users: User[];
    projects: Project[];
    onEdit: (asset: Asset) => void;
    onAssetUpdate: (asset: Asset) => void;
    onOpenDisposal: (asset: Asset) => void;
}

const AssetListView: React.FC<AssetListViewProps> = ({ assets, users, projects, onEdit, onAssetUpdate, onOpenDisposal }) => {
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [filterText, setFilterText] = useState('');
    const [assignmentFilter, setAssignmentFilter] = useState('all');
    const { hasPermission } = useContext(AuthContext)!;

    const assigneeMap = useMemo(() => {
        const map = new Map<string, string>();
        users.forEach(u => map.set(u.id, u.name));
        projects.forEach(p => map.set(p.id, p.name));
        // Add mock locations
        map.set('loc-1', 'Main Conference Room');
        map.set('loc-2', 'Office Floor');
        map.set('disposed', 'Disposed');
        return map;
    }, [users, projects]);

    const getStatusClass = (status: AssetStatus) => ({
        [AssetStatus.ACTIVE]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        [AssetStatus.IN_REPAIR]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        [AssetStatus.DISPOSED]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    }[status]);

    const filteredAssets = assets.filter(asset => {
        const textMatch = asset.name.toLowerCase().includes(filterText.toLowerCase()) ||
            asset.description.toLowerCase().includes(filterText.toLowerCase()) ||
            (assigneeMap.get(asset.assignedToId) || '').toLowerCase().includes(filterText.toLowerCase());

        const assignmentMatch = assignmentFilter === 'all' || asset.assignedToId === assignmentFilter;

        return textMatch && assignmentMatch;
    });

    return (
        <>
            <div className="flex flex-wrap items-center gap-4 mb-4">
                <input
                    type="text"
                    placeholder="Search by name, description..."
                    value={filterText}
                    onChange={e => setFilterText(e.target.value)}
                    className="w-full max-w-xs p-2 border rounded-md bg-transparent dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-primary-light"
                />
                 <div>
                    <select
                        id="assignment-filter"
                        value={assignmentFilter}
                        onChange={e => setAssignmentFilter(e.target.value)}
                        className="p-2 border rounded-md bg-transparent dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-primary-light h-full"
                    >
                        <option value="all">All Assignments</option>
                        <optgroup label="Employees">
                            {users.map(user => (
                                <option key={user.id} value={user.id}>{user.name}</option>
                            ))}
                        </optgroup>
                        <optgroup label="Projects">
                            {projects.map(project => (
                                <option key={project.id} value={project.id}>{project.name}</option>
                            ))}
                        </optgroup>
                    </select>
                </div>
            </div>
            <div className="bg-white dark:bg-dark-bg-card rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th className="px-6 py-3 text-left">Asset Name</th>
                                <th className="px-6 py-3 text-left">Category</th>
                                <th className="px-6 py-3 text-left">Assigned To</th>
                                <th className="px-6 py-3 text-left">Status</th>
                                <th className="px-6 py-3 text-right">Book Value (AED)</th>
                                <th className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAssets.map(asset => {
                                const { currentBookValue } = calculateDepreciation(asset);
                                return (
                                    <tr key={asset.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                            <div>{asset.name}</div>
                                            <div className="text-xs text-gray-500">{asset.description}</div>
                                        </td>
                                        <td className="px-6 py-4">{asset.category}</td>
                                        <td className="px-6 py-4">{assigneeMap.get(asset.assignedToId) || 'Unassigned'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(asset.status)}`}>{asset.status}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono">{currentBookValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        <td className="px-6 py-4 text-center space-x-2 whitespace-nowrap">
                                            <button onClick={() => setSelectedAsset(asset)} className="text-blue-600 dark:text-blue-400 hover:underline">Details</button>
                                            {asset.status !== AssetStatus.DISPOSED && hasPermission('assets:manage') && (
                                                <button onClick={() => onEdit(asset)} className="text-primary-light dark:text-primary-dark hover:underline">Edit</button>
                                            )}
                                             {asset.status !== AssetStatus.DISPOSED && hasPermission('assets:manage') && (
                                                <button onClick={() => onOpenDisposal(asset)} className="text-red-600 dark:text-red-400 hover:underline">Dispose</button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedAsset && (
                <AssetDetailsModal 
                    isOpen={!!selectedAsset} 
                    onClose={() => setSelectedAsset(null)} 
                    asset={selectedAsset}
                    assigneeMap={assigneeMap}
                    onAssetUpdate={(updatedAsset) => {
                        onAssetUpdate(updatedAsset);
                        setSelectedAsset(updatedAsset);
                    }}
                    onEdit={() => {
                        onEdit(selectedAsset);
                        setSelectedAsset(null);
                    }}
                    onDispose={() => {
                        onOpenDisposal(selectedAsset);
                        setSelectedAsset(null);
                    }}
                />
            )}
        </>
    );
};

export default AssetListView;