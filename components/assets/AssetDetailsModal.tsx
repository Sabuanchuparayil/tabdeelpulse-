import React, { useMemo, useState, useContext } from 'react';
import { Asset } from '../../types';
import { calculateDepreciation } from '../../utils/finance';
import { AuthContext } from '../../contexts/AuthContext';
import Modal from '../common/Modal';
import Icon from '../common/Icon';
import AssetMovementModal from './AssetMovementModal';

interface AssetDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    asset: Asset;
    assigneeMap: Map<string, string>;
    onAssetUpdate: (asset: Asset) => void;
    onEdit: () => void;
    onDispose: () => void;
}

const AssetDetailsModal: React.FC<AssetDetailsModalProps> = ({ isOpen, onClose, asset, assigneeMap, onAssetUpdate, onEdit, onDispose }) => {
    const [isMovementModalOpen, setMovementModalOpen] = useState(false);
    const { hasPermission } = useContext(AuthContext)!;
    const isDisposed = asset.status === 'Disposed';

    const depreciation = useMemo(() => calculateDepreciation(asset), [asset]);

    const assignmentHistory = useMemo(() => {
        const assigneeNames = new Set(Array.from(assigneeMap.values()));
        
        return [...asset.movements]
            .reverse() // Process in chronological order, then reverse at the end for display
            .map(mov => {
                const fromIsAssignee = assigneeNames.has(mov.from);
                const toIsAssignee = assigneeNames.has(mov.to);

                let action = '';
                let details = '';

                if (toIsAssignee && !fromIsAssignee) {
                    action = 'Assigned';
                    details = `To: ${mov.to}`;
                } else if (toIsAssignee && fromIsAssignee) {
                    action = 'Reassigned';
                    details = `To: ${mov.to}`;
                } else if (!toIsAssignee && fromIsAssignee) {
                    action = 'Unassigned';
                    details = `From: ${mov.from}`;
                } else {
                    return null; // Not an assignment-related movement
                }

                return {
                    id: mov.id,
                    date: mov.movementDate,
                    action,
                    details,
                    reason: mov.reason,
                };
            })
            .filter((item): item is NonNullable<typeof item> => item !== null)
            .reverse(); // Show most recent first
    }, [asset.movements, assigneeMap]);


    const handleMovementSave = (updatedAsset: Asset) => {
        onAssetUpdate(updatedAsset);
        setMovementModalOpen(false);
    }

    const DetailItem: React.FC<{ label: string; value: React.ReactNode; className?: string }> = ({ label, value, className }) => (
        <div className={`py-2 ${className}`}>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
            <p className="font-semibold text-gray-800 dark:text-gray-100">{value}</p>
        </div>
    );
    
    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title="Asset Details" size="xl">
                <div className="space-y-6">
                    {isDisposed && (
                        <div className="p-4 mb-4 text-center bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
                            <p className="font-bold text-lg">THIS ASSET IS DISPOSED</p>
                            <p className="text-sm">No further actions can be taken.</p>
                        </div>
                    )}
                    {/* Header */}
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-2xl font-bold font-serif text-light-text dark:text-dark-text">{asset.name}</h3>
                            <p className="text-gray-600 dark:text-gray-300">{asset.description}</p>
                        </div>
                        <div className="flex space-x-2 flex-shrink-0">
                             {hasPermission('assets:manage') && !isDisposed && (
                                <button onClick={onEdit} className="px-3 py-2 text-sm rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 flex items-center space-x-2">
                                    <Icon name="pencil" className="w-4 h-4" />
                                    <span>Edit</span>
                                </button>
                            )}
                            {hasPermission('assets:move') && !isDisposed && (
                                <button onClick={() => setMovementModalOpen(true)} className="px-3 py-2 text-sm rounded-lg bg-secondary-light text-white hover:opacity-90 flex items-center space-x-2">
                                    <Icon name="archive-box" className="w-4 h-4"/>
                                    <span>Log Movement</span>
                                </button>
                            )}
                             {hasPermission('assets:manage') && !isDisposed && (
                                <button onClick={onDispose} className="px-3 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 flex items-center space-x-2">
                                    <Icon name="trash" className="w-4 h-4"/>
                                    <span>Dispose</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Main Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        {/* Column 1: Asset Information */}
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                            <h4 className="font-semibold mb-2 text-lg font-serif">Asset Information</h4>
                            <div className="grid grid-cols-2 gap-x-4">
                                <DetailItem label="Asset ID" value={asset.id} />
                                <DetailItem label="Category" value={asset.category} />
                                <DetailItem label="Status" value={asset.status} />
                                <DetailItem label="Assigned To" value={assigneeMap.get(asset.assignedToId) || 'Unassigned'} />
                                <DetailItem label="Purchase Date" value={new Date(asset.purchaseDate).toLocaleDateString()} />
                                <DetailItem label="Added to System" value={new Date(asset.createdTimestamp).toLocaleString()} />
                                <DetailItem label="Last Updated" value={new Date(asset.updatedTimestamp).toLocaleString()} className="col-span-2" />
                            </div>
                        </div>

                        {/* Column 2: Financials */}
                         <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                            <h4 className="font-semibold mb-2 text-lg font-serif">Financials</h4>
                             <div className="grid grid-cols-2 gap-x-4">
                                <DetailItem label="Purchase Cost" value={`AED ${asset.purchaseCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} />
                                <DetailItem label="Depreciation Rate" value={`${(asset.depreciationRate * 100).toFixed(0)}% / year`} />
                                <DetailItem label="Useful Life" value={`${depreciation.usefulLife.toFixed(1)} years`} />
                                <DetailItem label="Salvage Value" value={`AED ${depreciation.salvageValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} />
                                <DetailItem label="Accum. Depreciation" value={`AED ${depreciation.accumulatedDepreciation.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} />
                                <DetailItem label="Current Book Value" value={`AED ${depreciation.currentBookValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} />
                            </div>
                        </div>
                    </div>
                    
                    {/* Assignment History */}
                    <div>
                        <h4 className="font-semibold mb-2 text-lg font-serif">Assignment History</h4>
                        <div className="border dark:border-gray-600 rounded-lg max-h-56 overflow-y-auto">
                            {assignmentHistory.length > 0 ? (
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 dark:bg-gray-700/50 sticky top-0">
                                        <tr>
                                            <th className="px-4 py-2 text-left font-medium">Date</th>
                                            <th className="px-4 py-2 text-left font-medium">Action</th>
                                            <th className="px-4 py-2 text-left font-medium">Details</th>
                                            <th className="px-4 py-2 text-left font-medium">Reason</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y dark:divide-gray-700">
                                        {assignmentHistory.map(item => (
                                            <tr key={item.id}>
                                                <td className="px-4 py-2 whitespace-nowrap">{new Date(item.date).toLocaleDateString()}</td>
                                                <td className="px-4 py-2">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                        item.action === 'Assigned' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                                                        item.action === 'Reassigned' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                                                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                                    }`}>{item.action}</span>
                                                </td>
                                                <td className="px-4 py-2">{item.details}</td>
                                                <td className="px-4 py-2">{item.reason}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="p-4 text-center text-gray-500">No assignment history recorded.</p>
                            )}
                        </div>
                    </div>


                    {/* Movement History */}
                    <div>
                        <h4 className="font-semibold mb-2 text-lg font-serif">Full Movement Log</h4>
                        <div className="border dark:border-gray-600 rounded-lg max-h-56 overflow-y-auto">
                            {asset.movements.length > 0 ? (
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 dark:bg-gray-700/50 sticky top-0">
                                        <tr>
                                            <th className="px-4 py-2 text-left font-medium">Date</th>
                                            <th className="px-4 py-2 text-left font-medium">From</th>
                                            <th className="px-4 py-2 text-left font-medium">To</th>
                                            <th className="px-4 py-2 text-left font-medium">Reason</th>
                                            <th className="px-4 py-2 text-left font-medium">Document</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y dark:divide-gray-700">
                                        {[...asset.movements].reverse().map(mov => (
                                            <tr key={mov.id}>
                                                <td className="px-4 py-2 whitespace-nowrap">{new Date(mov.movementDate).toLocaleDateString()}</td>
                                                <td className="px-4 py-2">{mov.from}</td>
                                                <td className="px-4 py-2">{mov.to}</td>
                                                <td className="px-4 py-2">{mov.reason}</td>
                                                <td className="px-4 py-2">
                                                    {mov.documentUrl ? (
                                                        <a href="#" onClick={e => e.preventDefault()} className="text-blue-600 dark:text-blue-400 hover:underline">View</a>
                                                    ) : (
                                                        <span className="text-gray-400 dark:text-gray-500">N/A</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="p-4 text-center text-gray-500">No movement history recorded.</p>
                            )}
                        </div>
                    </div>
                </div>
            </Modal>
            
            {isMovementModalOpen && (
                <AssetMovementModal 
                    isOpen={isMovementModalOpen}
                    onClose={() => setMovementModalOpen(false)}
                    onSave={handleMovementSave}
                    asset={asset}
                    assigneeMap={assigneeMap}
                />
            )}
        </>
    );
};

export default AssetDetailsModal;