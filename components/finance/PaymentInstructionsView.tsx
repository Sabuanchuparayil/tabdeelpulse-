import React, { useState, useEffect, useContext, useMemo } from 'react';
import { PaymentInstruction, PaymentStatus } from '../../types';
import { useApi } from '../../hooks/useApi';
import { AuthContext } from '../../contexts/AuthContext';
import PaymentReviewModal from './PaymentReviewModal';

interface PaymentInstructionsViewProps {
    initialFilter?: PaymentStatus;
}

const PaymentInstructionsView: React.FC<PaymentInstructionsViewProps> = ({ initialFilter }) => {
    const [payments, setPayments] = useState<PaymentInstruction[]>([]);
    const [selectedPayment, setSelectedPayment] = useState<PaymentInstruction | null>(null);
    const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>(initialFilter || 'all');
    const api = useApi();
    const { hasPermission } = useContext(AuthContext)!;

    useEffect(() => {
        api.getPayments().then(setPayments);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    const handleUpdate = (updatedPayment: PaymentInstruction) => {
        setPayments(prev => prev.map(p => p.id === updatedPayment.id ? updatedPayment : p));
        setSelectedPayment(null);
    };

    const filteredPayments = useMemo(() => {
        if (statusFilter === 'all') return payments;
        return payments.filter(p => p.status === statusFilter);
    }, [payments, statusFilter]);
    
    const getStatusClass = (status: PaymentStatus) => {
        switch (status) {
            case PaymentStatus.PENDING: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case PaymentStatus.APPROVED: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case PaymentStatus.PAID: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case PaymentStatus.REJECTED: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        }
    };

    return (
        <>
            <div className="mb-4">
                <select 
                    value={statusFilter} 
                    onChange={e => setStatusFilter(e.target.value as PaymentStatus | 'all')}
                    className="p-2 border rounded-md bg-transparent dark:border-gray-600"
                >
                    <option value="all">All Statuses</option>
                    {Object.values(PaymentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            <div className="bg-white dark:bg-dark-bg-card rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th className="px-6 py-3">Payee</th>
                                <th className="px-6 py-3">Amount</th>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPayments.map(p => (
                                <tr key={p.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{p.payee}</td>
                                    <td className="px-6 py-4">{p.amount.toLocaleString()} {p.currency}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${p.isRecurring ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                                            {p.isRecurring ? 'Recurring' : 'One-Time'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{p.date}</td>
                                    <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(p.status)}`}>{p.status}</span></td>
                                    <td className="px-6 py-4 space-x-2 whitespace-nowrap">
                                        <button onClick={() => setSelectedPayment(p)} className="text-primary-light dark:text-primary-dark hover:underline">
                                            {p.status === PaymentStatus.PENDING && hasPermission('finance:approve') ? 'Review' : 'View Details'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {selectedPayment && (
                <PaymentReviewModal 
                    isOpen={!!selectedPayment}
                    onClose={() => setSelectedPayment(null)}
                    onUpdate={handleUpdate}
                    payment={selectedPayment}
                />
            )}
        </>
    );
};

export default PaymentInstructionsView;