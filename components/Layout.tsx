import React, { useState, useEffect, createContext, useContext } from 'react';
import { Sidebar } from './Sidebar';

// Contexto para controlar o menu mobile de qualquer lugar do app
interface MobileMenuContextType {
    isMobileMenuOpen: boolean;
    openMobileMenu: () => void;
    closeMobileMenu: () => void;
    toggleMobileMenu: () => void;
}

const MobileMenuContext = createContext<MobileMenuContextType | undefined>(undefined);

export const useMobileMenu = () => {
    const context = useContext(MobileMenuContext);
    if (!context) {
        throw new Error('useMobileMenu deve ser usado dentro de um Layout');
    }
    return context;
};

interface LayoutProps {
    children: React.ReactNode;
    activePage: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, activePage }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const openMobileMenu = () => setIsMobileMenuOpen(true);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);
    const toggleMobileMenu = () => setIsMobileMenuOpen(prev => !prev);

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
        <MobileMenuContext.Provider value={{ isMobileMenuOpen, openMobileMenu, closeMobileMenu, toggleMobileMenu }}>
            <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-sans transition-colors duration-300">
                <Sidebar
                    activePage={activePage}
                    isMobileMenuOpen={isMobileMenuOpen}
                    setIsMobileMenuOpen={setIsMobileMenuOpen}
                />

                {/* Mobile Menu Overlay */}
                <div
                    className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                        }`}
                    onClick={closeMobileMenu}
                    aria-label="Fechar menu"
                />

                <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative w-full">
                    {children}
                </main>
            </div>
        </MobileMenuContext.Provider>
    );
};
