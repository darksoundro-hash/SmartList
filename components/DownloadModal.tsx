import React from 'react';
import { X, Smartphone, Apple, Monitor, Upload, Download, ShoppingCart } from 'lucide-react';

interface DownloadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onInstall?: () => void;
    isInstallable: boolean;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({ isOpen, onClose, onInstall, isInstallable }) => {
    const [showConfirmation, setShowConfirmation] = React.useState(false);

    if (!isOpen) return null;

    const handleAction = () => {
        if (isInstallable) {
            setShowConfirmation(true);
        } else {
            // For non-installable environments, we still need to show some tips, 
            // but let's keep it extremely minimal as per user request.
            setShowConfirmation(true);
        }
    };

    const confirmDownload = () => {
        if (isInstallable && onInstall) {
            onInstall();
        } else {
            // Fallback for when browser prompt isn't ready
            alert("Para instalar: no Android use o menu do Chrome 'Instalar'; no iPhone use 'Adicionar à Tela de Início' no Safari.");
        }
        setShowConfirmation(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-gradient-to-b from-surface-dark to-background-dark border border-white/10 rounded-[3rem] p-10 max-w-sm w-full shadow-2xl flex flex-col items-center gap-8 transform animate-in zoom-in-95 duration-300 relative">

                {/* Top-Right Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all active:scale-90"
                    aria-label="Fechar"
                >
                    <X size={20} />
                </button>

                {!showConfirmation ? (
                    <>
                        <div className="size-32 bg-primary rounded-[2.5rem] flex items-center justify-center text-background-dark shadow-[0_0_40px_rgba(19,236,91,0.4)] cursor-pointer hover:scale-110 active:scale-95 transition-all duration-300 group relative" onClick={handleAction}>
                            <ShoppingCart size={64} fill="currentColor" />
                            <div className="absolute -inset-2 rounded-[2.7rem] border-2 border-primary/30 animate-ping opacity-20 pointer-events-none"></div>
                        </div>

                        {/* Platform Symbols */}
                        <div className="flex items-center gap-4">
                            <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-green-500 border border-white/5">
                                <Smartphone size={20} />
                            </div>
                            <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-white border border-white/5">
                                <Apple size={20} />
                            </div>
                        </div>

                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-black text-white tracking-tight">SmartList App</h2>
                            <p className="text-primary font-bold uppercase tracking-[0.2em] text-xs">Toque para baixar</p>
                        </div>

                        <button
                            onClick={onClose}
                            className="mt-4 px-6 h-12 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white font-bold rounded-xl transition-all active:scale-95"
                        >
                            Voltar
                        </button>
                    </>
                ) : (
                    <div className="flex flex-col items-center text-center gap-8 animate-in zoom-in-95 duration-200">
                        <div className="size-24 bg-primary rounded-[2rem] flex items-center justify-center text-background-dark shadow-2xl">
                            <ShoppingCart size={48} fill="currentColor" />
                        </div>

                        <h3 className="text-2xl font-black text-white leading-tight">Deseja baixar o aplicativo?</h3>

                        <div className="flex flex-col w-full gap-3">
                            <button
                                onClick={confirmDownload}
                                className="w-full h-14 bg-primary hover:bg-green-400 text-background-dark font-black rounded-2xl transition-all active:scale-95 shadow-lg shadow-primary/20"
                            >
                                Sim, Baixar Agora
                            </button>
                            <button
                                onClick={() => setShowConfirmation(false)}
                                className="w-full h-14 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all active:scale-95"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
