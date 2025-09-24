import React, { useState, useContext } from 'react';
import { AccountHead, ApprovalStatus } from '../../types';
import { useApi } from '../../hooks/useApi';
import { AuthContext } from '../../contexts/AuthContext';
import Modal from '../common/Modal';

interface AccountReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (updatedAccount: AccountHead) => void;
    account: AccountHead;
}

const AccountReviewModal: React.FC<AccountReviewModalProps> = ({ isOpen, onClose, onUpdate, account }) => {
    const [rejectionReason, setRejectionReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const api = useApi();
    const { user } = useContext(AuthContext)!;

    const handleAction = async (newStatus: ApprovalStatus) => {
        if (!user) return;
        if (newStatus === ApprovalStatus.REJECTED && !rejectionReason.trim()) {
            alert("A reason is required to reject an account.");
            return;
        }

        setIsSubmitting(true);
        const updatedAccount = {
            ...account,
            approvalStatus: newStatus,
            rejectionReason: newStatus === ApprovalStatus.REJECTED ? rejectionReason : undefined,
        };
        
        try {
            const result = await api.updateAccount(updatedAccount, user.id);
            onUpdate(result);
        } catch (error) {
            console.error(`Failed to ${newStatus} account`, error);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
            <p className="font-semibold text-gray-800 dark:text-gray-100">{value}</p>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Review Account: ${account.name}`}>
            <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                        <DetailItem label="Account Name" value={account.name} />
                        <DetailItem label="Bank" value={account.bankName} />
                        <DetailItem label="Account Number" value={account.accountNumber} />
                        <DetailItem label="Status" value={account.approvalStatus} />
                    </div>
                </div>

                <div className="p-4 border-t dark:border-gray-600 space-y-3">
                    <h4 className="font-semibold">Take Action</h4>
                    <div>
                        <label htmlFor="rejectionReason" className="block text-sm font-medium mb-1">Reason (if rejecting)</label>
                        <textarea
                            id="rejectionReason"
                            value={rejectionReason}
                            onChange={e => setRejectionReason(e.target.value)}
                            rows={2}
                            className="w-full p-2 border rounded-md bg-transparent dark:border-gray-600"
                            placeholder="Provide a reason for rejection..."
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600">Close</button>
                    <button 
                        onClick={() => handleAction(ApprovalStatus.REJECTED)} 
                        disabled={isSubmitting || !rejectionReason.trim()}
                        className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                    >
                        Reject
                    </button>
                    <button 
                        onClick={() => handleAction(ApprovalStatus.APPROVED)} 
                        disabled={isSubmitting}
                        className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                    >
                        Approve
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default AccountReviewModal;