import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextData {
    addToast: (message: string, type?: ToastType) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextData>({} as ToastContextData);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            removeToast(id);
        }, 4000); // Auto remove after 4 seconds
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none md:bottom-8 md:right-8">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`
              pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md min-w-[300px] max-w-sm
              animate-in slide-in-from-right-full fade-in duration-300
              ${toast.type === 'success' ? 'bg-background-dark/90 border-primary/30 text-white' : ''}
              ${toast.type === 'error' ? 'bg-red-950/90 border-red-500/30 text-white' : ''}
              ${toast.type === 'info' ? 'bg-slate-900/90 border-white/10 text-white' : ''}
              ${toast.type === 'warning' ? 'bg-amber-950/90 border-amber-500/30 text-white' : ''}
            `}
                    >
                        <div className={`p-1 rounded-full shrink-0 ${toast.type === 'success' ? 'bg-primary/20 text-primary' :
                                toast.type === 'error' ? 'bg-red-500/20 text-red-500' :
                                    toast.type === 'warning' ? 'bg-amber-500/20 text-amber-500' :
                                        'bg-blue-500/20 text-blue-500'
                            }`}>
                            {toast.type === 'success' && <CheckCircle size={18} />}
                            {toast.type === 'error' && <AlertCircle size={18} />}
                            {toast.type === 'warning' && <AlertCircle size={18} />}
                            {toast.type === 'info' && <Info size={18} />}
                        </div>
                        <p className="text-sm font-medium flex-1">{toast.message}</p>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="text-white/40 hover:text-white transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
