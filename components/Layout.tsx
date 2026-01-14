import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';

interface LayoutProps {
    children: React.ReactNode;
    activePage: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, activePage }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobileMenuOpen]);

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-sans transition-colors duration-300">
            <Sidebar activePage={activePage} isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden fade-in"
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-label="Fechar menu"
                />
            )}

            <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
                {children}
            </main>
        </div>
    );
};
