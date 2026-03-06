import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Check, Zap, Star, Shield, ArrowRight } from 'lucide-react';

const Presell: React.FC = () => {
    const navigate = useNavigate();

    const plans = [
        {
            name: 'Grátis',
            price: 'R$ 0',
            description: 'Essencial para quem está começando.',
            features: [
                'Até 3 listas de compras',
                'Sugestões inteligentes básicas',
                'Histórico limitado (7 dias)',
                'Suporte via comunidade'
            ],
            cta: 'Começar Grátis',
            popular: false,
            color: 'slate'
        },
        {
            name: 'Premium Mensal',
            price: 'R$ 19,90',
            period: '/mês',
            description: 'Poder total para sua economia.',
            features: [
                'Listas ilimitadas',
                'IA Assistente de Orçamento',
                'Histórico Vitalício',
                'Compartilhamento em tempo real',
                'Sem anúncios'
            ],
            cta: 'Assinar Mensal',
            popular: true,
            color: 'primary'
        },
        {
            name: 'Premium Anual',
            price: 'R$ 14,90',
            period: '/mês*',
            description: 'O melhor valor para sua casa.',
            features: [
                'Tudo do plano Mensal',
                '2 meses grátis (economia de R$ 60)',
                'Suporte prioritário VIP',
                'Acesso antecipado a novos recursos'
            ],
            cta: 'Assinar Anual',
            popular: false,
            color: 'green'
        }
    ];

    return (
        <div className="min-h-screen bg-background-dark text-white font-sans selection:bg-primary/30 overflow-x-hidden">
            {/* Background Orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] size-[500px] bg-primary/10 blur-[120px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] size-[500px] bg-green-500/10 blur-[120px] rounded-full animate-pulse [animation-delay:2s]"></div>
            </div>

            <nav className="relative z-10 h-20 px-6 lg:px-20 flex items-center justify-between border-b border-white/5 backdrop-blur-md bg-black/20 sticky top-0">
                <div className="flex items-center gap-3">
                    <div className="size-10 bg-primary rounded-xl flex items-center justify-center text-background-dark shadow-lg shadow-primary/20">
                        <ShoppingCart size={24} fill="currentColor" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">SmartList</span>
                </div>
                <button
                    onClick={() => navigate('/login')}
                    className="px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 font-bold transition-all active:scale-95"
                >
                    Entrar
                </button>
            </nav>

            <main className="relative z-10 px-6 lg:px-20 py-16 lg:py-24 max-w-7xl mx-auto flex flex-col items-center">

                {/* Hero Section */}
                <div className="text-center space-y-6 max-w-4xl animate-in fade-in slide-in-from-bottom-10 duration-700">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest mb-4">
                        <Zap size={14} className="fill-current" />
                        V.2.0 Agora com IA
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-black leading-tight tracking-tighter">
                        Economize <span className="text-primary italic">de verdade</span> em cada ida ao mercado.
                    </h1>
                    <p className="text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        O SmartList usa inteligência artificial para otimizar suas compras, prever gastos e garantir que você nunca pague mais do que deveria.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full sm:w-auto px-8 h-16 bg-primary hover:bg-green-400 text-background-dark font-black text-lg rounded-2xl transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 group"
                        >
                            Começar Agora
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <a href="#planos" className="text-slate-400 hover:text-white font-bold transition-colors">Ver planos</a>
                    </div>
                </div>

                {/* Benefits Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-24 w-full">
                    {[
                        { icon: Shield, title: 'Segurança Total', desc: 'Seus dados protegidos com criptografia de ponta a ponta.' },
                        { icon: Star, title: 'Experiência Premium', desc: 'Interface limpa, rápida e sem anúncios chatos interrompendo.' },
                        { icon: Zap, title: 'Inteligência Artificial', desc: 'Sugestões baseadas no seu perfil de consumo real.' }
                    ].map((item, idx) => (
                        <div key={idx} className="p-8 bg-white/5 border border-white/5 rounded-[2rem] hover:border-primary/20 transition-all group">
                            <div className="size-14 bg-white/5 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform mb-6">
                                <item.icon size={28} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                            <p className="text-slate-400 leading-relaxed text-sm">{item.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Pricing Section */}
                <div id="planos" className="w-full space-y-12">
                    <div className="text-center space-y-4">
                        <h2 className="text-4xl lg:text-5xl font-black">Planos pensados para você</h2>
                        <p className="text-slate-400">Escolha o plano que melhor se adapta às suas necessidades.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch pt-8">
                        {plans.map((plan, idx) => (
                            <div
                                key={idx}
                                className={`relative flex flex-col p-8 rounded-[2.5rem] border transition-all duration-300 ${plan.popular
                                    ? 'bg-gradient-to-b from-white/10 to-transparent border-primary/50 shadow-2xl shadow-primary/10 scale-105 z-10'
                                    : 'bg-white/5 border-white/5 hover:border-white/10'
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1.5 bg-primary text-background-dark text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                                        Mais Popular
                                    </div>
                                )}

                                <div className="mb-8">
                                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-black tracking-tighter">{plan.price}</span>
                                        {plan.period && <span className="text-slate-400 font-bold">{plan.period}</span>}
                                    </div>
                                    <p className="mt-4 text-sm text-slate-400 leading-relaxed">{plan.description}</p>
                                </div>

                                <div className="space-y-4 flex-1 mb-10">
                                    {plan.features.map((feature, fIdx) => (
                                        <div key={fIdx} className="flex items-start gap-3">
                                            <div className="size-5 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <Check size={12} strokeWidth={3} />
                                            </div>
                                            <span className="text-sm text-slate-300">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => navigate('/login')}
                                    className={`w-full h-14 rounded-2xl font-black transition-all active:scale-95 flex items-center justify-center gap-2 ${plan.popular
                                        ? 'bg-primary hover:bg-green-400 text-background-dark shadow-lg shadow-primary/20'
                                        : 'bg-white/5 hover:bg-white/10 text-white'
                                        }`}
                                >
                                    {plan.cta}
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="text-center pt-8">
                        <p className="text-slate-500 text-sm">*Plano anual cobrado em parcela única de R$ 178,80.</p>
                    </div>
                </div>

            </main>

            <footer className="relative z-10 px-6 lg:px-20 py-12 border-t border-white/5 bg-black/20 text-center">
                <p className="text-slate-500 text-sm">© 2026 SmartList AI - Todos os direitos reservados.</p>
            </footer>
        </div>
    );
};

export default Presell;
