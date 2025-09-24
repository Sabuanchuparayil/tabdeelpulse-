import React, { ReactNode } from 'react';

interface PageHeaderProps {
    title: string;
    children?: ReactNode; // For action buttons
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, children }) => {
    return (
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-serif font-bold">{title}</h1>
            {children && <div className="flex items-center space-x-2">{children}</div>}
        </div>
    );
};

export default PageHeader;
