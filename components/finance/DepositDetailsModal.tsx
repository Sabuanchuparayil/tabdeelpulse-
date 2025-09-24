import React from 'react';
import { Deposit } from '../../types';
import Modal from '../common/Modal';

interface DepositDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    deposit: Deposit;
    accountName: string;
}

const DepositDetailsModal: React.FC<DepositDetailsModalProps> = ({ isOpen, onClose, deposit, accountName }) => {

    const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
            <p className="font-semibold text-gray-800 dark:text-gray-100">{value}</p>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Deposit Details">
            <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                    <DetailItem label="Account" value={accountName} />
                    <DetailItem label="Amount" value={`${deposit.amount.toLocaleString()} AED`} />
                    <DetailItem label="Deposit Date" value={new Date(deposit.depositDate).toLocaleDateString()} />
                    <DetailItem label="Logged On" value={new Date(deposit.createdTimestamp).toLocaleString()} />
                </div>
            </div>
            <div className="flex justify-end pt-4">
                <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600">Close</button>
            </div>
        </Modal>
    );
};

export default DepositDetailsModal;