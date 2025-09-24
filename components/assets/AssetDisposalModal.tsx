import React, { useState, useContext } from 'react';
import { Asset } from '../../types';
import { useApi } from '../../hooks/useApi';
import { AuthContext } from '../../contexts/AuthContext';
import Modal from '../common/Modal';

interface AssetDisposalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    asset: Asset;
}

const AssetDisposalModal: React.FC<AssetDisposalModalProps> = ({ isOpen, onClose, onSave, asset }) => {
    const [reason, setReason] = useState('');
    const [disposalDate, setDisposalDate] = useState(new Date().toISOString().split('T')[0]);
    const [documentUrl, setDocumentUrl] = useState<string | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const api = useApi();
    const { user } = useContext(AuthContext)!;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (!reason) {
            alert('Disposal reason is required.');
            return;
        }
        setIsLoading(true);
        try {
            await api.disposeAsset(asset.id, reason, disposalDate, user.id, documentUrl);
            onSave();
        } catch (error) {
            console.error("Failed to dispose asset:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            // Mock handling of file upload
            console.log("File selected:", e.target.files[0].name);
            setDocumentUrl(`docs/disposal/${e.target.files[0].name}`);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Dispose Asset: ${asset.name}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-700 dark:text-red-300 text-sm">
                    <strong>Warning:</strong> This action is irreversible. The asset's status will be set to 'Disposed' and its book value will become 0.
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Disposal Date</label>
                    <input type="date" value={disposalDate} onChange={e => setDisposalDate(e.target.value)} required className="w-full p-2 border rounded-md bg-transparent dark:border-gray-600" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Reason for Disposal</label>
                    <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} required className="w-full p-2 border rounded-md bg-transparent dark:border-gray-600" placeholder="e.g., Damaged beyond repair, End of service life, Sold" />
                </div>
                 <div>
                     <label className="block text-sm font-medium mb-1">Disposal Certificate (Optional)</label>
                     <input type="file" onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/50 dark:file:text-blue-300 dark:hover:file:bg-blue-900"/>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
                    <button type="submit" disabled={isLoading} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">
                        {isLoading ? 'Disposing...' : 'Confirm Disposal'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default AssetDisposalModal;