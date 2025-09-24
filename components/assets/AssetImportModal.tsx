import React, { useMemo, useState, useContext } from 'react';
import { Asset, AssetCategory, AssetStatus } from '../../types';
import { AuthContext } from '../../contexts/AuthContext';
import Modal from '../common/Modal';

// Define the expected shape of a row from the Excel file
export interface AssetImportRow {
    Name?: string;
    Description?: string;
    Category?: string;
    PurchaseDate?: string | number;
    PurchaseCost?: number;
    DepreciationRate?: number;
}

interface ValidationResult {
    isValid: boolean;
    errors: string[];
    asset?: Omit<Asset, 'id' | 'movements' | 'createdTimestamp' | 'updatedTimestamp'>;
}

interface AssetImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (validAssets: Omit<Asset, 'id' | 'movements' | 'createdTimestamp' | 'updatedTimestamp'>[], actorId: string) => void;
    data: AssetImportRow[];
}

const AssetImportModal: React.FC<AssetImportModalProps> = ({ isOpen, onClose, onConfirm, data }) => {
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useContext(AuthContext)!;

    const validateRow = (row: AssetImportRow, index: number): ValidationResult => {
        const errors: string[] = [];
        
        // Required fields
        if (!row.Name) errors.push('Asset Name is missing.');
        if (!row.Category) errors.push('Category is missing.');
        if (!row.PurchaseDate) errors.push('Purchase Date is missing.');
        if (row.PurchaseCost === undefined || row.PurchaseCost === null) errors.push('Purchase Cost is missing.');
        if (row.DepreciationRate === undefined || row.DepreciationRate === null) errors.push('Depreciation Rate is missing.');
        
        // Data type and format validation
        if (typeof row.PurchaseCost !== 'number') errors.push('Purchase Cost must be a number.');
        if (typeof row.DepreciationRate !== 'number' || row.DepreciationRate < 0 || row.DepreciationRate > 1) {
            errors.push('Depreciation Rate must be a number between 0.0 and 1.0.');
        }

        const categoryValues = Object.values(AssetCategory) as string[];
        if (row.Category && !categoryValues.includes(row.Category)) {
            errors.push(`Invalid Category. Must be one of: ${categoryValues.join(', ')}.`);
        }

        let purchaseDate: Date;
        // Handle Excel's numeric date format
        if (typeof row.PurchaseDate === 'number') {
            // Excel stores dates as days since 1900-01-01, but there's a bug where it thinks 1900 is a leap year.
            // This formula corrects for it for dates after Feb 1900.
            purchaseDate = new Date(Date.UTC(0, 0, row.PurchaseDate - 1));
        } else {
            purchaseDate = new Date(row.PurchaseDate || '');
        }

        if (isNaN(purchaseDate.getTime())) {
            errors.push('Invalid Purchase Date format.');
        }

        if (errors.length > 0) {
            return { isValid: false, errors };
        }

        return {
            isValid: true,
            errors: [],
            asset: {
                name: row.Name!,
                description: row.Description || '',
                category: row.Category as AssetCategory,
                purchaseDate: purchaseDate.toISOString().split('T')[0],
                purchaseCost: row.PurchaseCost!,
                depreciationRate: row.DepreciationRate!,
                status: AssetStatus.ACTIVE, // Default status for new assets
                assignedToId: '', // Default to unassigned
            }
        };
    };

    const validationResults = useMemo(() => data.map(validateRow), [data]);
    const validRows = useMemo(() => validationResults.filter(r => r.isValid), [validationResults]);
    const invalidRowsCount = data.length - validRows.length;

    const handleConfirm = async () => {
        if (!user) return;
        setIsLoading(true);
        const assetsToImport = validRows.map(r => r.asset!).map(a => ({...a, assignedToId: 'loc-2'})); // Assign to office floor by default
        await onConfirm(assetsToImport, user.id);
        setIsLoading(false);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Import Assets Preview" size="xl">
            <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <h3 className="font-bold text-lg text-blue-800 dark:text-blue-200">Import Summary</h3>
                    <p>Found <strong>{data.length}</strong> rows in the file.</p>
                    <p className="text-green-600 dark:text-green-300"><strong>{validRows.length}</strong> rows are valid and will be imported.</p>
                    {invalidRowsCount > 0 && (
                        <p className="text-red-600 dark:text-red-400"><strong>{invalidRowsCount}</strong> rows have errors and will be skipped.</p>
                    )}
                </div>
                
                <div className="max-h-[50vh] overflow-y-auto border dark:border-gray-600 rounded-lg">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                            <tr>
                                <th className="px-4 py-2 text-left">#</th>
                                <th className="px-4 py-2 text-left">Name</th>
                                <th className="px-4 py-2 text-left">Category</th>
                                <th className="px-4 py-2 text-left">Cost</th>
                                <th className="px-4 py-2 text-left">Errors</th>
                            </tr>
                        </thead>
                        <tbody>
                            {validationResults.map((result, index) => (
                                <tr key={index} className={`border-t dark:border-gray-700 ${!result.isValid ? 'bg-red-50 dark:bg-red-900/20' : ''}`}>
                                    <td className="px-4 py-2">{index + 1}</td>
                                    <td className="px-4 py-2">{data[index].Name || '-'}</td>
                                    <td className="px-4 py-2">{data[index].Category || '-'}</td>
                                    <td className="px-4 py-2">{data[index].PurchaseCost || '-'}</td>
                                    <td className="px-4 py-2 text-red-600 dark:text-red-400">
                                        {result.errors.join(', ')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
                    <button 
                        type="button" 
                        onClick={handleConfirm} 
                        disabled={isLoading || validRows.length === 0} 
                        className="px-4 py-2 rounded-lg bg-primary-light dark:bg-primary-dark text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Importing...' : `Confirm & Import ${validRows.length} Assets`}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default AssetImportModal;