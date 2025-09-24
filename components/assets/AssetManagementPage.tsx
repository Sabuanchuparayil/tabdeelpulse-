import React, { useState, useEffect, useContext, useMemo, useRef } from 'react';
import { useApi } from '../../hooks/useApi';
import { Asset, User, Project, Page } from '../../types';
import { AuthContext } from '../../contexts/AuthContext';
import Icon from '../common/Icon';
import AssetFormModal from './AssetFormModal';
import AssetSummaryView from './AssetSummaryView';
import AssetListView from './AssetListView';
import AssetDisposalModal from './AssetDisposalModal';
import AssetImportModal, { AssetImportRow } from './AssetImportModal';
import { calculateDepreciation } from '../../utils/finance';
import * as XLSX from 'xlsx';
import AccessDenied from '../common/AccessDenied';
import PageHeader from '../common/PageHeader';

type AssetView = 'list' | 'summary';

interface AssetManagementPageProps {
    navigate: (page: Page, props?: Record<string, any>) => void;
}

const AssetManagementPage: React.FC<AssetManagementPageProps> = ({ navigate }) => {
    const [view, setView] = useState<AssetView>('list');
    const [assets, setAssets] = useState<Asset[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
    const [isDisposalModalOpen, setDisposalModalOpen] = useState(false);
    const [assetToDispose, setAssetToDispose] = useState<Asset | null>(null);
    const [isImportModalOpen, setImportModalOpen] = useState(false);
    const [importData, setImportData] = useState<AssetImportRow[]>([]);
    
    const importFileRef = useRef<HTMLInputElement>(null);
    const api = useApi();
    const { hasPermission } = useContext(AuthContext)!;

    const fetchData = async () => {
        setLoading(true);
        try {
            const [assetData, userData, projectData] = await Promise.all([
                api.getAssets(),
                api.getUsers(),
                api.getProjects()
            ]);
            setAssets(assetData);
            setUsers(userData);
            setProjects(projectData);
        } catch (error) {
            console.error("Failed to fetch asset data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const assigneeMap = useMemo(() => {
        const map = new Map<string, string>();
        users.forEach(u => map.set(u.id, u.name));
        projects.forEach(p => map.set(p.id, p.name));
        map.set('loc-1', 'Main Conference Room');
        map.set('loc-2', 'Office Floor');
        map.set('disposed', 'Disposed');
        return map;
    }, [users, projects]);

    const handleFormSave = () => {
        setFormModalOpen(false);
        setEditingAsset(null);
        fetchData(); // Refresh data after save
    };
    
    const handleAssetUpdated = (updatedAsset: Asset) => {
        setAssets(prev => prev.map(a => a.id === updatedAsset.id ? updatedAsset : a));
    };

    const handleOpenForm = (asset: Asset | null = null) => {
        setEditingAsset(asset);
        setFormModalOpen(true);
    };

    const handleOpenDisposalModal = (asset: Asset) => {
        setAssetToDispose(asset);
        setDisposalModalOpen(true);
    };

    const handleDisposalSave = () => {
        setDisposalModalOpen(false);
        setAssetToDispose(null);
        fetchData();
    };
    
    const generateExportData = () => {
        const headers = [
            'Name', 'Description', 'Category', 'Status',
            'PurchaseDate (YYYY-MM-DD)', 'PurchaseCost', 'DepreciationRate (0.0-1.0)',
            'AssignedTo (Name or Location)', 'BookValue'
        ];

        const data = assets.map(asset => {
            const { currentBookValue } = calculateDepreciation(asset);
            const assignedTo = assigneeMap.get(asset.assignedToId) || asset.assignedToId;
            return {
                Name: asset.name,
                Description: asset.description,
                Category: asset.category,
                Status: asset.status,
                'PurchaseDate (YYYY-MM-DD)': asset.purchaseDate,
                PurchaseCost: asset.purchaseCost,
                'DepreciationRate (0.0-1.0)': asset.depreciationRate,
                'AssignedTo (Name or Location)': assignedTo,
                BookValue: currentBookValue
            };
        });

        return { headers, data };
    };
    
    const handleExportCSV = () => {
        const { data } = generateExportData();
        const csv = [
            Object.keys(data[0]).join(','),
            ...data.map(row => Object.values(row).join(','))
        ].join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        const date = new Date().toISOString().split('T')[0];
        link.setAttribute('download', `tabdeel_pulse_assets_export_${date}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const handleExportExcel = () => {
        const { data } = generateExportData();
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Assets');
        const date = new Date().toISOString().split('T')[0];
        XLSX.writeFile(workbook, `tabdeel_pulse_assets_export_${date}.xlsx`);
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json<AssetImportRow>(worksheet);
            setImportData(json);
            setImportModalOpen(true);
        };
        reader.readAsArrayBuffer(file);
        event.target.value = ''; // Reset input
    };

    const handleConfirmImport = async (validAssetsToImport: Omit<Asset, 'id' | 'movements' | 'createdTimestamp' | 'updatedTimestamp'>[], actorId: string) => {
        if(validAssetsToImport.length > 0) {
            await api.addMultipleAssets(validAssetsToImport, actorId);
        }
        setImportModalOpen(false);
        setImportData([]);
        fetchData(); // Refresh list
    };

    if (!hasPermission('assets:view')) {
        return <AccessDenied />;
    }

    return (
        <div>
            <PageHeader title="Asset Management">
                {hasPermission('assets:manage') && (
                    <>
                        <input type="file" ref={importFileRef} onChange={handleFileSelect} className="hidden" accept=".xlsx, .xls"/>
                        <button onClick={() => importFileRef.current?.click()} className="bg-teal-600 text-white px-3 py-2 rounded-lg flex items-center space-x-2 hover:bg-teal-700 transition-colors text-sm">
                            <Icon name="arrow-up-tray" className="w-4 h-4" />
                            <span>Import</span>
                        </button>
                        <button onClick={handleExportExcel} className="bg-green-600 text-white px-3 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700 transition-colors text-sm">
                            <Icon name="arrow-down-tray" className="w-4 h-4" />
                            <span>Excel</span>
                        </button>
                         <button onClick={handleExportCSV} className="bg-gray-600 text-white px-3 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-700 transition-colors text-sm">
                            <span>CSV</span>
                        </button>
                        <button onClick={() => handleOpenForm()} className="bg-primary-light dark:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:opacity-90 transition-opacity text-sm">
                            <Icon name="plus" className="w-5 h-5" />
                            <span>Add Asset</span>
                        </button>
                    </>
                )}
            </PageHeader>

            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <nav className="-mb-px flex space-x-6">
                    <button onClick={() => setView('list')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${view === 'list' ? 'border-primary-light dark:border-primary-dark text-primary-light dark:text-primary-dark' : 'border-transparent text-gray-500 hover:text-gray-300 dark:hover:text-gray-600'}`}>All Assets</button>
                    <button onClick={() => setView('summary')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${view === 'summary' ? 'border-primary-light dark:border-primary-dark text-primary-light dark:text-primary-dark' : 'border-transparent text-gray-500 hover:text-gray-300 dark:hover:text-gray-600'}`}>Summary</button>
                </nav>
            </div>

            {loading ? (
                <div className="text-center p-8">Loading assets...</div>
            ) : view === 'list' ? (
                <AssetListView assets={assets} users={users} projects={projects} onEdit={handleOpenForm} onAssetUpdate={handleAssetUpdated} onOpenDisposal={handleOpenDisposalModal} />
            ) : (
                <AssetSummaryView assets={assets} users={users} projects={projects} />
            )}

            {isFormModalOpen && (
                <AssetFormModal 
                    isOpen={isFormModalOpen} 
                    onClose={() => { setFormModalOpen(false); setEditingAsset(null); }}
                    onSave={handleFormSave}
                    asset={editingAsset}
                    users={users}
                    projects={projects}
                />
            )}

            {isDisposalModalOpen && assetToDispose && (
                <AssetDisposalModal
                    isOpen={isDisposalModalOpen}
                    onClose={() => { setDisposalModalOpen(false); setAssetToDispose(null); }}
                    onSave={handleDisposalSave}
                    asset={assetToDispose}
                />
            )}

            {isImportModalOpen && (
                 <AssetImportModal
                    isOpen={isImportModalOpen}
                    onClose={() => { setImportModalOpen(false); setImportData([]); }}
                    onConfirm={handleConfirmImport}
                    data={importData}
                 />
            )}
        </div>
    );
};

export default AssetManagementPage;