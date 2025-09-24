import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import AccessDenied from '../common/AccessDenied';
import TabButton from '../common/TabButton';
import PaymentInstructionsView from './PaymentInstructionsView';
import CollectionsView from './CollectionsView';
import DepositsView from './DepositsView';
// Fix: Import Page type for the navigate prop.
import { Page, PaymentStatus } from '../../types';

type FinanceTab = 'payments' | 'collections' | 'deposits';

// Fix: Add navigate prop to conform to PageProps in MainLayout.tsx
interface FinancePageProps {
    initialTab?: FinanceTab;
    initialFilter?: PaymentStatus;
    navigate: (page: Page, props?: Record<string, any>) => void;
}

const FinancePage: React.FC<FinancePageProps> = ({ initialTab = 'payments', initialFilter }) => {
    const [activeTab, setActiveTab] = useState<FinanceTab>(initialTab);
    const { hasPermission } = useContext(AuthContext)!;

    useEffect(() => {
        setActiveTab(initialTab);
    }, [initialTab]);

    if (!hasPermission('finance:view')) {
        return <AccessDenied />;
    }
    
    return (
        <div>
            <h1 className="text-3xl font-serif font-bold mb-6">Finance</h1>
            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <nav className="-mb-px flex space-x-6">
                    {/* Fix: Explicitly provide generic type to TabButton to ensure correct type inference. */}
                    <TabButton<FinanceTab> name="Payment Instructions" tab="payments" activeTab={activeTab} setActiveTab={setActiveTab} />
                    {/* Fix: Explicitly provide generic type to TabButton to ensure correct type inference. */}
                    <TabButton<FinanceTab> name="Collections" tab="collections" activeTab={activeTab} setActiveTab={setActiveTab} />
                    {/* Fix: Explicitly provide generic type to TabButton to ensure correct type inference. */}
                    <TabButton<FinanceTab> name="Deposits" tab="deposits" activeTab={activeTab} setActiveTab={setActiveTab} />
                </nav>
            </div>
            <div>
                {activeTab === 'payments' && <PaymentInstructionsView initialFilter={initialFilter} />}
                {activeTab === 'collections' && <CollectionsView />}
                {activeTab === 'deposits' && <DepositsView />}
            </div>
        </div>
    );
};

export default FinancePage;