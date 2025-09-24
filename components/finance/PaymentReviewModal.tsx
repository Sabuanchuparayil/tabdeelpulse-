import React, { useState, useContext } from 'react';
import { PaymentInstruction, PaymentStatus } from '../../types';
import { useApi } from '../../hooks/useApi';
import { AuthContext } from '../../contexts/AuthContext';
import Modal from '../common/Modal';

interface PaymentReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (updatedPayment: PaymentInstruction) => void;
    payment: PaymentInstruction;
}

const PaymentReviewModal: React.FC<PaymentReviewModalProps> = ({ isOpen, onClose, onUpdate, payment }) => {
    const [rejectionReason, setRejectionReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const api = useApi();
    const { hasPermission, user } = useContext(AuthContext)!;
    
    const canApprove = hasPermission('finance:approve');
    const isPending = payment.status === PaymentStatus.PENDING;

    const handleAction = async (newStatus: PaymentStatus) => {
        if (!user) return;
        if (newStatus === PaymentStatus.REJECTED && !rejectionReason.trim()) {
            alert("A reason is required to reject a payment.");
            return;
        }
        
        setIsSubmitting(true);
        const updatedPayment = {
            ...payment,
            status: newStatus,
            rejectionReason: newStatus === PaymentStatus.REJECTED ? rejectionReason : undefined,
        };

        try {
            const result = await api.updatePayment(updatedPayment, user.id);
            onUpdate(result);
        } catch (error) {
            console.error(`Failed to ${newStatus} payment`, error);
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
        <Modal isOpen={isOpen} onClose={onClose} title={`Payment to ${payment.payee}`} size="lg">
            <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <DetailItem label="Payee" value={payment.payee} />
                        <DetailItem label="Amount" value={`${payment.amount.toLocaleString()} ${payment.currency}`} />
                        <DetailItem label="Payment Date" value={payment.date} />
                        <DetailItem label="Status" value={payment.status} />
                        <DetailItem label="Type" value={payment.isRecurring ? 'Recurring' : 'One-Time'} />
                        <DetailItem label="Created On" value={new Date(payment.createdTimestamp).toLocaleString()} />
                    </div>
                </div>

                {payment.status === PaymentStatus.REJECTED && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <p className="text-sm font-semibold text-red-800 dark:text-red-200">Rejection Reason:</p>
                        <p className="text-sm text-red-700 dark:text-red-300 mt-1">{payment.rejectionReason}</p>
                    </div>
                )}
                
                {canApprove && isPending && (
                    <div className="p-4 border-t dark:border-gray-600 space-y-3">
                        <h4 className="font-semibold">Take Action</h4>
                        <div>
                            <label htmlFor="rejectionReason" className="block text-sm font-medium mb-1">Reason (if rejecting)</label>
                            <textarea
                                id="rejectionReason"
                                value={rejectionReason}
                                onChange={e => setRejectionReason(e.target.value)}
                                rows={2}
                                className="w-full p-2 border rounded-md bg-transparent dark:border-gray-600 focus:ring-1 focus:ring-primary-light"
                                placeholder="Provide a clear reason for rejection..."
                            />
                        </div>
                    </div>
                )}

                <div className="flex justify-end space-x-2 pt-4">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600">Close</button>
                    {canApprove && isPending && (
                        <>
                            <button 
                                onClick={() => handleAction(PaymentStatus.REJECTED)} 
                                disabled={isSubmitting || !rejectionReason.trim()}
                                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                            >
                                Reject
                            </button>
                             <button 
                                onClick={() => handleAction(PaymentStatus.APPROVED)} 
                                disabled={isSubmitting}
                                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                            >
                                Approve
                            </button>
                        </>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default PaymentReviewModal;