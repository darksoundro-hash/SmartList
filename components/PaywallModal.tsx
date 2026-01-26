import React from 'react';
import { Crown, CheckCircle2, X } from 'lucide-react';

interface PaywallModalProps {
    isOpen: boolean;
    onClose: () => void;
    message?: string;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({ isOpen, onClose, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-surface-dark rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl relative overflow-hidden border border-amber-200/50 dark:border-amber-500/20">

                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-amber-100/50 to-transparent dark:from-amber-500/10 pointer-events-none" />
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-300/20 rounded-full blur-3xl pointer-events-none" />

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-full transition-colors z-10"
                >
                    <X size={20} className="text-slate-500 dark:text-gray-400" />
                </button>

                <div className="flex flex-col items-center text-center relative z-10">
                    <div className="size-20 bg-gradient-to-br from-amber-300 to-amber-500 rounded-3xl rotate-3 shadow-lg shadow-amber-500/30 flex items-center justify-center mb-6">
                        <Crown size={40} className="text-white fill-white" />
                    </div>

                    <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                        Seja Premium 👑
                    </h2>

                    <p className="text-slate-500 dark:text-gray-400 mb-8 max-w-xs mx-auto text-sm leading-relaxed">
                        {message || "Desbloqueie todo o poder da SmartList AGORA!"}
                    </p>

                    <div className="w-full space-y-4 mb-8">
                        {[
                            "Listas Ilimitadas (Grátis: Max 2)",
                            "Itens Ilimitados (Grátis: Max 5)",
                            "Excluir Listas Livremente",
                            "Dashboard Financeiro Completo",
                            "Histórico Ilimitado"
                        ].map((benefit, index) => (
                            <div key={index} className="flex items-center gap-3 text-left bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-transparent hover:border-amber-500/20 transition-colors">
                                <CheckCircle2 size={20} className="text-amber-500 shrink-0" />
                                <span className="text-slate-700 dark:text-gray-200 font-bold text-sm">{benefit}</span>
                            </div>
                        ))}
                    </div>

                    <button className="w-full h-14 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-white font-black rounded-2xl shadow-lg shadow-amber-500/25 transform transition-all active:scale-95 flex items-center justify-center gap-2 group">
                        <span>ASSINAR AGORA</span>
                        <span className="bg-white/20 px-2 py-0.5 rounded text-xs">R$ 9,90/mês</span>
                    </button>

                    <p className="mt-4 text-xs text-slate-400 dark:text-gray-500 font-medium">
                        Cancele quando quiser. Sem fidelidade.
                    </p>
                </div>
            </div>
        </div>
    );
};
