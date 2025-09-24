import React, { useState, useEffect } from 'react';
import { Deposit, AccountHead } from '../../types';
import { useApi } from '../../hooks/useApi';
import DepositDetailsModal from './DepositDetailsModal';

const DepositsView: React.FC = () => {
    const [deposits, setDeposits] = useState<Deposit[]>([]);
    const [accounts, setAccounts] = useState<AccountHead[]>([]);
    const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
    const api = useApi();
    const accountMap = new Map(accounts.map(a => [a.id, a.name]));
    
    useEffect(() => {
        Promise.all([api.getDeposits(), api.getAccounts()]).then(([depData, accData]) => {
            setDeposits(depData);
            setAccounts(accData);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <div className="bg-white dark:bg-dark-bg-card rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th className="px-6 py-3">Account</th>
                                <th className="px-6 py-3">Amount</th>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Deposit Slip</th>
                            </tr>
                        </thead>
                        <tbody>
                            {deposits.map(d => (
                                <tr 
                                    key={d.id} 
                                    className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
                                    onClick={() => setSelectedDeposit(d)}
                                >
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{accountMap.get(d.accountId) || 'N/A'}</td>
                                    <td className="px-6 py-4">{d.amount.toLocaleString()}</td>
                                    <td className="px-6 py-4">{d.depositDate}</td>
                                    <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                                        <a href="#" className="text-blue-500 hover:underline">View</a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {selectedDeposit && (
                <DepositDetailsModal
                    isOpen={!!selectedDeposit}
                    onClose={() => setSelectedDeposit(null)}
                    deposit={selectedDeposit}
                    accountName={accountMap.get(selectedDeposit.accountId) || 'N/A'}
                />
            )}
        </>
    );
};

export default DepositsView;