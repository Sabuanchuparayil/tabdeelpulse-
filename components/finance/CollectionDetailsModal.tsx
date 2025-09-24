import React from 'react';
import { Collection } from '../../types';
import Modal from '../common/Modal';

interface CollectionDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    collection: Collection;
    projectName: string;
}

const CollectionDetailsModal: React.FC<CollectionDetailsModalProps> = ({ isOpen, onClose, collection, projectName }) => {
    
    const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
            <p className="font-semibold text-gray-800 dark:text-gray-100">{value}</p>
        </div>
    );
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Collection Details">
             <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                    <DetailItem label="Project" value={projectName} />
                    <DetailItem label="Amount Received" value={`${collection.amount.toLocaleString()} AED`} />
                    <DetailItem label="Outstanding Amount" value={`${collection.outstandingAmount.toLocaleString()} AED`} />
                    <DetailItem label="Received Date" value={new Date(collection.receivedDate).toLocaleDateString()} />
                    <DetailItem label="Payment Method" value={collection.paymentMethod} />
                    <DetailItem label="Logged On" value={new Date(collection.createdTimestamp).toLocaleString()} />
                </div>
            </div>
             <div className="flex justify-end pt-4">
                <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600">Close</button>
            </div>
        </Modal>
    );
};

export default CollectionDetailsModal;