
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import {
   TrendingDown,
   TrendingUp,
   DollarSign,
   PieChart,
   ArrowUpRight,
   ArrowDownRight,
   Wallet,
   Calendar,
   Filter,
   ArrowLeft
} from 'lucide-react';
import { HistoryEntry } from '../types';
import { supabase } from '../SmartList/services/src/lib/supabase';

const Finances: React.FC = () => {
   const navigate = useNavigate();
   const [history, setHistory] = useState<HistoryEntry[]>([]);

   useEffect(() => {
      fetchHistoryAndInsights();
   }, []);

   const fetchHistoryAndInsights = async () => {
      try {
         const { data: { user } } = await supabase.auth.getUser();
         if (!user) return;

         const { data, error } = await supabase
            .from('shopping_history')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false });

         if (error) throw error;

         const mappedHistory: HistoryEntry[] = (data || []).map(item => ({
            id: item.id,
            date: item.date.split('T')[0],
            store: item.store,
            itemCount: item.item_count,
            totalValue: item.total_value,
            isFavorite: item.is_favorite
         }));

         setHistory(mappedHistory);

      } catch (e) {
         console.error('Error in finances:', e);
      }
   };

   const stats = useMemo(() => {
      const totalSpent = history.reduce((acc, curr) => acc + curr.totalValue, 0);
      const lastMonthSpent = 1250.00; // Mock para comparação
      const diff = ((totalSpent - lastMonthSpent) / lastMonthSpent) * 100;
      const averageTicket = history.length > 0 ? totalSpent / history.length : 0;

      return { totalSpent, lastMonthSpent, diff, averageTicket };
   }, [history]);

   const formatCurrency = (val: number) => {
      return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
   };

   return (
      <Layout activePage="finances">
         <header className="h-20 flex items-center justify-between px-4 md:px-6 lg:px-10 border-b border-white/5 bg-background-dark/80 backdrop-blur-md sticky top-0 z-20">
            <div className="flex items-center gap-4">
               <button
                  onClick={() => navigate('/dashboard')}
                  className="size-10 rounded-full bg-slate-100 dark:bg-white/5 border border-transparent hover:border-primary/50 flex items-center justify-center text-slate-700 dark:text-white hover:text-primary transition-all group"
               >
                  <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
               </button>
               <div className="flex flex-col">
                  <h1 className="text-xl font-black text-white uppercase tracking-tight">Painel Financeiro</h1>
                  <p className="text-[10px] text-text-secondary font-black uppercase tracking-widest opacity-60">Análise de investimentos em mantimentos</p>
               </div>
               <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 px-4 h-10 bg-surface-dark border border-border-green rounded-full text-xs font-bold text-text-secondary hover:text-white transition-all">
                     <Calendar size={16} /> 2024
                  </button>
                  <button className="size-10 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center text-primary">
                     <Filter size={18} />
                  </button>
               </div>
            </div>
         </header>

         <div className="p-6 lg:p-10 space-y-8 pb-32 max-w-7xl mx-auto w-full">
            {/* Métricas Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               <div className="bg-surface-dark p-6 rounded-[2rem] border border-border-green flex flex-col justify-between group hover:border-primary/40 transition-all shadow-xl">
                  <div className="flex justify-between items-start">
                     <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Gasto Total</span>
                     <div className="size-10 rounded-xl bg-background-dark border border-border-green flex items-center justify-center text-primary"><DollarSign size={20} /></div>
                  </div>
                  <div className="mt-4">
                     <h3 className="text-2xl font-black text-white">{formatCurrency(stats.totalSpent)}</h3>
                     <div className={`flex items-center gap-1 mt-1 text-[10px] font-black uppercase ${stats.diff > 0 ? 'text-red-400' : 'text-primary'}`}>
                        {stats.diff > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {Math.abs(stats.diff).toFixed(1)}% vs anterior
                     </div>
                  </div>
               </div>

               <div className="bg-surface-dark p-6 rounded-[2rem] border border-border-green flex flex-col justify-between group hover:border-primary/40 transition-all shadow-xl">
                  <div className="flex justify-between items-start">
                     <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Orçamento Médio</span>
                     <div className="size-10 rounded-xl bg-background-dark border border-border-green flex items-center justify-center text-primary"><Wallet size={20} /></div>
                  </div>
                  <div className="mt-4">
                     <h3 className="text-2xl font-black text-white">{formatCurrency(stats.averageTicket)}</h3>
                     <p className="text-[10px] text-text-secondary font-bold uppercase mt-1 tracking-widest">Por visita ao mercado</p>
                  </div>
               </div>

               <div className="bg-surface-dark p-6 rounded-[2rem] border border-border-green flex flex-col justify-between group hover:border-primary/40 transition-all shadow-xl">
                  <div className="flex justify-between items-start">
                     <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Itens Comprados</span>
                     <div className="size-10 rounded-xl bg-background-dark border border-border-green flex items-center justify-center text-primary"><PieChart size={20} /></div>
                  </div>
                  <div className="mt-4">
                     <h3 className="text-2xl font-black text-white">{history.reduce((a, b) => a + b.itemCount, 0)}</h3>
                     <p className="text-[10px] text-text-secondary font-bold uppercase mt-1 tracking-widest">Produtos únicos estocados</p>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
               {/* Gráfico de Barras Evolução */}
               <div className="bg-surface-dark rounded-[2.5rem] border border-border-green p-8 shadow-2xl">
                  <div className="flex justify-between items-center mb-10">
                     <h3 className="text-lg font-black uppercase tracking-widest">Fluxo de Despesas</h3>
                     <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                           <div className="size-2 rounded-full bg-primary"></div>
                           <span className="text-[10px] font-bold text-text-secondary uppercase">Gasto Real</span>
                        </div>
                     </div>
                  </div>
                  <div className="h-64 flex items-end justify-between gap-4 px-4">
                     {[450, 780, 520, 1100, 890, stats.totalSpent > 0 ? stats.totalSpent / 2 : 300].map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                           <div className="w-full bg-background-dark/50 rounded-full h-full relative overflow-hidden flex items-end">
                              <div
                                 className="w-full bg-primary transition-all duration-1000 group-hover:bg-[#0fdc53] group-hover:shadow-[0_0_20px_rgba(19,236,91,0.4)]"
                                 style={{ height: `${(h / 1200) * 100}%` }}
                              ></div>
                           </div>
                           <span className="text-[10px] font-black text-text-secondary uppercase tracking-tighter opacity-40">Mês {i + 1}</span>
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* Categorias e Distribuição */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-surface-dark rounded-[2.5rem] border border-border-green p-8 shadow-2xl">
                  <h3 className="text-lg font-black uppercase tracking-widest mb-8">Gastos por Categoria</h3>
                  <div className="space-y-6">
                     {[
                        { name: 'Alimentação Básica', color: '#13ec5b', value: 45 },
                        { name: 'Higiene & Limpeza', color: '#326744', value: 25 },
                        { name: 'Proteínas & Carnes', color: '#0fdc53', value: 20 },
                        { name: 'Hortifruti', color: '#097d2e', value: 10 }
                     ].map((cat, i) => (
                        <div key={i} className="space-y-2">
                           <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                              <span className="text-text-secondary">{cat.name}</span>
                              <span className="text-white">{cat.value}%</span>
                           </div>
                           <div className="h-2 w-full bg-background-dark rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${cat.value}%`, backgroundColor: cat.color }}></div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="bg-surface-dark rounded-[2.5rem] border border-border-green p-8 shadow-2xl flex flex-col justify-between">
                  <div>
                     <h3 className="text-lg font-black uppercase tracking-widest mb-2">Saúde Financeira</h3>
                     <p className="text-xs text-text-secondary font-medium">Seu orçamento está sob controle.</p>
                  </div>
                  <div className="py-10 flex justify-center">
                     <div className="relative size-48 flex items-center justify-center">
                        {/* Gráfico Circular Simples em SVG */}
                        <svg className="size-full -rotate-90">
                           <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-background-dark" />
                           <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent"
                              strokeDasharray="552.9" strokeDashoffset={552.9 * (1 - 0.72)}
                              className="text-primary transition-all duration-1000" strokeLinecap="round" />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                           <span className="text-4xl font-black text-white">72%</span>
                           <span className="text-xs font-black text-text-secondary uppercase tracking-widest">Eficiência</span>
                        </div>
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-4 rounded-2xl bg-background-dark/50 border border-border-green text-center">
                        <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-1">Previsão Próxima</p>
                        <p className="text-white font-bold text-sm">R$ 520,00</p>
                     </div>
                     <div className="p-4 rounded-2xl bg-background-dark/50 border border-border-green text-center">
                        <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-1">Potencial Economia</p>
                        <p className="text-primary font-bold text-sm">R$ 68,00</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
         <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 10% 90%, #13ec5b 0%, transparent 40%)" }}></div>
      </Layout>
   );
};

export default Finances;
