import React, { useState, useEffect } from 'react';
import { X, Check, Copy, CreditCard, QrCode, ShieldCheck, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '../SmartList/services/src/lib/supabase';
import { useSubscription } from './SubscriptionContext';
import { useToast } from './ToastContext';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    planName: string;
    price: string;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, planName, price }) => {
    const { addToast } = useToast();
    const { refreshSubscription } = useSubscription();
    const [step, setStep] = useState<'method' | 'processing' | 'success'>('method');
    const [method, setMethod] = useState<'pix' | 'card' | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Mock Timer for PIX
    const [timeLeft, setTimeLeft] = useState(300); // 5 mins

    useEffect(() => {
        if (method === 'pix' && step === 'processing' && timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        }
    }, [method, step, timeLeft]);

    if (!isOpen) return null;

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleConfirmPayment = async () => {
        setIsSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not found');

            const { error } = await supabase
                .from('profiles')
                .update({ is_premium: true })
                .eq('id', user.id);

            if (error) throw error;

            // Simulate server delay for professional feel
            await new Promise(resolve => setTimeout(resolve, 2000));

            await refreshSubscription();
            setStep('success');
            addToast('Assinatura ativada com sucesso!', 'success');
        } catch (error) {
            console.error('Error during checkout:', error);
            addToast('Erro ao processar pagamento. Tente novamente.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white dark:bg-surface-dark rounded-[2.5rem] w-full max-w-lg shadow-2xl relative overflow-hidden border border-white/10">

                {/* Header Decor */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-green-400 to-primary animate-pulse" />

                <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-full transition-colors z-20">
                    <X size={20} className="text-slate-500" />
                </button>

                <div className="p-8 md:p-10">
                    {step === 'method' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                            <div className="text-center space-y-2">
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white">Checkout Seguro</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">Você está assinando o <span className="text-primary font-bold">{planName}</span></p>
                                <div className="inline-block px-4 py-2 bg-primary/10 rounded-2xl mt-4">
                                    <span className="text-2xl font-black text-primary">{price}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button
                                    onClick={() => { setMethod('pix'); setStep('processing'); }}
                                    className="p-6 rounded-3xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 hover:border-primary/50 transition-all group flex flex-col items-center gap-4"
                                >
                                    <div className="size-14 bg-white dark:bg-background-dark rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                        <QrCode size={28} className="text-primary" />
                                    </div>
                                    <span className="font-bold dark:text-white">Pagamento via PIX</span>
                                </button>
                                <button
                                    onClick={() => { setMethod('card'); setStep('processing'); }}
                                    className="p-6 rounded-3xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 hover:border-primary/50 transition-all group flex flex-col items-center gap-4"
                                >
                                    <div className="size-14 bg-white dark:bg-background-dark rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                        <CreditCard size={28} className="text-primary" />
                                    </div>
                                    <span className="font-bold dark:text-white">Cartão de Crédito</span>
                                </button>
                            </div>

                            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest pt-4">
                                <ShieldCheck size={14} className="text-green-500" />
                                Ambiente 100% Seguro e Criptografado
                            </div>
                        </div>
                    )}

                    {step === 'processing' && method === 'pix' && (
                        <div className="space-y-8 text-center animate-in fade-in zoom-in-95">
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Escaneie o QR Code</h3>
                                <p className="text-slate-500 text-sm">Aprovação instantânea após o pagamento</p>
                            </div>

                            <div className="bg-white p-6 rounded-[2rem] inline-block shadow-xl mx-auto">
                                <div className="size-48 bg-slate-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-200">
                                    {/* Mock QR Code */}
                                    <QrCode size={120} className="text-slate-900" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 flex items-center justify-between">
                                    <span className="text-xs font-mono text-slate-500 truncate mr-4">00020101021226850014br.gov.bcb.pix0124smartlist...</span>
                                    <button className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-lg hover:bg-primary/20">
                                        <Copy size={14} /> Copiar
                                    </button>
                                </div>
                                <div className="text-sm font-bold text-slate-400 flex items-center justify-center gap-2">
                                    Expira em: <span className="text-primary text-xl font-black tabular-nums">{formatTime(timeLeft)}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleConfirmPayment}
                                disabled={isSubmitting}
                                className="w-full h-14 bg-primary hover:bg-green-400 text-background-dark font-black rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-primary/20"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" /> : <><Check /> Já realizei o pagamento</>}
                            </button>
                        </div>
                    )}

                    {step === 'processing' && method === 'card' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-10">
                            <div className="text-center space-y-2">
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Dados do Cartão</h3>
                                <p className="text-slate-500 text-sm">Transação processada com segurança</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Número do Cartão</label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input type="text" placeholder="0000 0000 0000 0000" className="w-full h-12 bg-slate-50 dark:bg-white/5 rounded-xl border-none ring-1 ring-slate-200 dark:ring-white/10 focus:ring-2 focus:ring-primary pl-12 text-slate-900 dark:text-white" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Validade</label>
                                        <input type="text" placeholder="MM/AA" className="w-full h-12 bg-slate-50 dark:bg-white/5 rounded-xl border-none ring-1 ring-slate-200 dark:ring-white/10 focus:ring-2 focus:ring-primary px-4 text-slate-900 dark:text-white" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">CVC</label>
                                        <input type="text" placeholder="000" className="w-full h-12 bg-slate-50 dark:bg-white/5 rounded-xl border-none ring-1 ring-slate-200 dark:ring-white/10 focus:ring-2 focus:ring-primary px-4 text-slate-900 dark:text-white" />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleConfirmPayment}
                                disabled={isSubmitting}
                                className="w-full h-14 bg-primary hover:bg-green-400 text-background-dark font-black rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-primary/20"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" /> : <><Check /> Assinar Agora</>}
                            </button>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="text-center py-10 space-y-8 animate-in zoom-in-90 duration-500">
                            <div className="relative inline-block">
                                <div className="size-24 bg-green-500 rounded-full flex items-center justify-center shadow-xl shadow-green-500/30 animate-bounce">
                                    <Check size={48} className="text-white" strokeWidth={4} />
                                </div>
                                <div className="absolute -top-4 -left-4 animate-ping"><Sparkles className="text-primary" /></div>
                                <div className="absolute -bottom-4 -right-4 animate-ping [animation-delay:0.5s]"><Sparkles className="text-yellow-400" /></div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-4xl font-black text-slate-900 dark:text-white leading-tight">Você agora é <span className="text-primary italic">Premium</span>!</h3>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">Acesso total desbloqueado instantaneamente.</p>
                            </div>

                            <button
                                onClick={onClose}
                                className="w-full h-16 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-3xl hover:scale-105 active:scale-95 transition-all shadow-2xl"
                            >
                                Começar a Usar Agora
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
