import React from 'react';

interface TabButtonProps<T extends string> {
    name: string;
    tab: T;
    activeTab: T;
    setActiveTab: (tab: T) => void;
}

const TabButton = <T extends string>({ name, tab, activeTab, setActiveTab }: TabButtonProps<T>) => {
    const isActive = activeTab === tab;
    return (
        <button
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                isActive
                    ? 'border-primary-light dark:border-primary-dark text-primary-light dark:text-primary-dark'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
            }`}
        >
            {name}
        </button>
    );
};

export default TabButton;
