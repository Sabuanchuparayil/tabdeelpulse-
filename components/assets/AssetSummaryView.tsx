import React, { useState, useMemo } from 'react';
import { Asset, Project, User, AssetCategory } from '../../types';

interface AssetSummaryViewProps {
    assets: Asset[];
    projects: Project[];
    users: User[];
}

type SummaryTab = 'project' | 'item';

const AssetSummaryView: React.FC<AssetSummaryViewProps> = ({ assets, projects, users }) => {
    const [activeTab, setActiveTab] = useState<SummaryTab>('project');
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [selectedItemName, setSelectedItemName] = useState<string>('');
    
    const assigneeMap = useMemo(() => {
        const map = new Map<string, string>();
        users.forEach(u => map.set(u.id, u.name));
        projects.forEach(p => map.set(p.id, p.name));
        map.set('loc-1', 'Main Conference Room');
        map.set('loc-2', 'Office Floor');
        return map;
    }, [users, projects]);

    const itemNames = useMemo(() => [...new Set(assets.map(a => a.name))].sort(), [assets]);

    const projectAssets = useMemo(() => {
        if (!selectedProjectId) return [];
        return assets.filter(a => a.category === AssetCategory.PROJECT && a.assignedToId === selectedProjectId);
    }, [assets, selectedProjectId]);
    
    const itemAssets = useMemo(() => {
        if (!selectedItemName) return [];
        return assets.filter(a => a.name === selectedItemName);
    }, [assets, selectedItemName]);

    return (
        <div className="bg-white dark:bg-dark-bg-card rounded-xl shadow-md p-6">
            <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
                <nav className="-mb-px flex space-x-4">
                    <button onClick={() => setActiveTab('project')} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'project' ? 'border-secondary-light dark:border-secondary-dark text-secondary-light dark:text-secondary-dark' : 'border-transparent text-gray-500 hover:border-gray-300'}`}>Project Wise</button>
                    <button onClick={() => setActiveTab('item')} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'item' ? 'border-secondary-light dark:border-secondary-dark text-secondary-light dark:text-secondary-dark' : 'border-transparent text-gray-500 hover:border-gray-300'}`}>Item Wise</button>
                </nav>
            </div>

            {activeTab === 'project' && (
                <div>
                    <label htmlFor="project-select" className="block text-sm font-medium mb-2">Select a Project:</label>
                    <select id="project-select" value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)} className="w-full max-w-sm p-2 border rounded-md bg-transparent dark:border-gray-600 dark:bg-dark-bg-card">
                        <option value="">-- Choose Project --</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>

                    {selectedProjectId && (
                        <div className="mt-6">
                            <h3 className="text-lg font-bold font-serif mb-2">Assets for {projects.find(p=>p.id === selectedProjectId)?.name}</h3>
                            {projectAssets.length > 0 ? (
                                <ul className="list-disc list-inside space-y-1">
                                    {projectAssets.map(asset => <li key={asset.id}>{asset.name} - <i>{asset.description}</i></li>)}
                                </ul>
                            ) : (
                                <p className="text-gray-500">No project-specific assets assigned to this project.</p>
                            )}
                        </div>
                    )}
                </div>
            )}
            
            {activeTab === 'item' && (
                 <div>
                    <label htmlFor="item-select" className="block text-sm font-medium mb-2">Select an Item:</label>
                    <select id="item-select" value={selectedItemName} onChange={e => setSelectedItemName(e.target.value)} className="w-full max-w-sm p-2 border rounded-md bg-transparent dark:border-gray-600 dark:bg-dark-bg-card">
                        <option value="">-- Choose Item --</option>
                        {itemNames.map(name => <option key={name} value={name}>{name}</option>)}
                    </select>

                    {selectedItemName && (
                        <div className="mt-6">
                            <h3 className="text-lg font-bold font-serif mb-2">Summary for {selectedItemName} ({itemAssets.length} total)</h3>
                             <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-4 py-2 text-left">Location / Assignee</th>
                                            <th className="px-4 py-2 text-left">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {itemAssets.map(asset => (
                                            <tr key={asset.id} className="border-b dark:border-gray-700">
                                                <td className="px-4 py-2">{assigneeMap.get(asset.assignedToId) || 'Unassigned'}</td>
                                                <td className="px-4 py-2">{asset.status}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AssetSummaryView;