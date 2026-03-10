import React from 'react';

export const Card = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
    <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
        {children}
    </div>
);

export const CardContent = ({ children }: { children: React.ReactNode }) => (
    <div className="flex flex-col gap-2">
        {children}
    </div>
);
