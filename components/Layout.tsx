
import React from 'react';
import { Sidebar } from './Sidebar';

interface LayoutProps {
    children: React.ReactNode;
    activePage: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, activePage }) => {
    return (
        <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-sans transition-colors duration-300">
            <Sidebar activePage={activePage} />
            <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative md:ml-0">
                {children}
            </main>
        </div>
    );
};
