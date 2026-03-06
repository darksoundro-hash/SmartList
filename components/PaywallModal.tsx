import React, { useState } from 'react';
import { Crown, CheckCircle2, X, Sparkles, ArrowRight } from 'lucide-react';
import { CheckoutModal } from './CheckoutModal';
import { PLANS } from '../constants/plans';

interface PaywallModalProps {
    isOpen: boolean;
    onClose: () => void;
    message?: string;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({ isOpen, onClose, message }) => {
    const [showCheckout, setShowCheckout] = useState(false);

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="bg-white dark:bg-surface-dark rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl relative overflow-hidden border border-amber-200/50 dark:border-amber-500/20">

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

                        <div className="space-y-2 mb-6">
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white">
                                Seja Premium 👑
                            </h2>
                            <p className="text-slate-500 dark:text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">
                                {message || "Desbloqueie todo o poder do SmartList AI e economize de verdade."}
                            </p>
                        </div>

                        <div className="w-full grid grid-cols-1 gap-3 mb-8">
                            {[
                                "Listas Ilimitadas (Grátis: 3)",
                                "Itens Ilimitados (Grátis: 10)",
                                "Excluir Listas Livremente",
                                "IA Assistente de Compras",
                                "Histórico Vitalício de Compras"
                            ].map((benefit, index) => (
                                <div key={index} className="flex items-center gap-3 text-left bg-slate-50 dark:bg-white/5 p-3 rounded-2xl border border-transparent hover:border-amber-500/20 transition-all group">
                                    <div className="size-6 bg-amber-500/10 rounded-full flex items-center justify-center group-hover:bg-amber-500 transition-colors">
                                        <CheckCircle2 size={16} className="text-amber-500 group-hover:text-white transition-colors" />
                                    </div>
                                    <span className="text-slate-700 dark:text-gray-200 font-bold text-sm">{benefit}</span>
                                </div>
                            ))}
                        </div>

                        <div className="w-full space-y-4">
                            <button
                                onClick={() => setShowCheckout(true)}
                                className="w-full h-16 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-white font-black rounded-3xl shadow-xl shadow-amber-500/25 transform transition-all active:scale-95 flex flex-col items-center justify-center p-2 group"
                            >
                                <div className="flex items-center gap-2">
                                    <span>ASSINAR PREMUIM</span>
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </div>
                                <span className="text-[10px] opacity-80 uppercase tracking-widest font-black">Apenas R$ 19,90/mês</span>
                            </button>

                            <button
                                onClick={() => setShowCheckout(true)}
                                className="w-full h-12 flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm hover:underline"
                            >
                                <Sparkles size={16} />
                                Ver Plano Anual (Economize R$ 60)
                            </button>
                        </div>

                        <p className="mt-6 text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-widest">
                            Cancelamento fácil a qualquer momento
                        </p>
                    </div>
                </div>
            </div>

            <CheckoutModal
                isOpen={showCheckout}
                onClose={() => {
                    setShowCheckout(false);
                    onClose();
                }}
                planName="Premium Mensal"
                price="R$ 19,90"
            />
        </>
    );
};
