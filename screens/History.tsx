
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import {
  Download,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  BarChart3,
  Calendar,
  Search,
  Star,
  Trash2,
  ChevronRight as ChevronRightIcon,
  ArrowLeft
} from 'lucide-react';
import { HistoryEntry } from '../types';
import { supabase } from '../SmartList/services/src/lib/supabase';

const History: React.FC = () => {
  const navigate = useNavigate();
  const [historyData, setHistoryData] = useState<HistoryEntry[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Carregar e sincronizar
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('shopping_history')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;

      if (data) {
        const mapped: HistoryEntry[] = data.map(item => ({
          id: item.id,
          date: item.date.split('T')[0], // Ensure DB returns ISO string
          store: item.store,
          itemCount: item.item_count,
          totalValue: item.total_value,
          isFavorite: item.is_favorite
        }));
        setHistoryData(mapped);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    // Optimistic
    const entry = historyData.find(h => h.id === id);
    if (!entry) return;
    const newStatus = !entry.isFavorite;

    setHistoryData(prev => prev.map(item =>
      item.id === id ? { ...item, isFavorite: newStatus } : item
    ));

    const { error } = await supabase
      .from('shopping_history')
      .update({ is_favorite: newStatus })
      .eq('id', id);

    if (error) {
      console.error('Error updating favorite:', error);
      // Revert
      setHistoryData(prev => prev.map(item =>
        item.id === id ? { ...item, isFavorite: !newStatus } : item
      ));
    }
  };

  const deleteEntry = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Deseja realmente remover este registro do seu histórico?")) {
      // Optimistic
      const oldData = [...historyData];
      setHistoryData(prev => prev.filter(entry => entry.id !== id));

      const { error } = await supabase
        .from('shopping_history')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting history:', error);
        alert('Erro ao excluir histórico');
        setHistoryData(oldData);
      }
    }
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })
      .replace(/^\w/, (c) => c.toUpperCase());
  };

  const changeMonth = (delta: number) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentMonth(newDate);
  };

  const filteredHistory = useMemo(() => {
    return historyData.filter(entry => {
      const entryDate = new Date(entry.date + 'T12:00:00');
      const matchesMonth = entryDate.getMonth() === currentMonth.getMonth() &&
        entryDate.getFullYear() === currentMonth.getFullYear();
      const matchesSearch = entry.store.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesMonth && matchesSearch;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [historyData, currentMonth, searchQuery]);

  const stats = useMemo(() => {
    const totalSpent = filteredHistory.reduce((acc, curr) => acc + curr.totalValue, 0);
    const totalItems = filteredHistory.reduce((acc, curr) => acc + curr.itemCount, 0);
    const averageSpent = filteredHistory.length > 0 ? totalSpent / filteredHistory.length : 0;
    const trend = filteredHistory.length > 0 ? "+5%" : "0%";
    return { totalSpent, totalItems, averageSpent, trend };
  }, [filteredHistory]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
  };

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + "Data,Mercado,Itens,Valor,Favorito\n"
      + filteredHistory.map(e => `${e.date},${e.store},${e.itemCount},${e.totalValue},${e.isFavorite ? 'Sim' : 'Não'}`).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `historico_${formatMonth(currentMonth).replace(' ', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout activePage="history">
      <header className="h-20 flex flex-none items-center justify-between px-4 md:px-6 lg:px-10 border-b border-white/5 bg-background-dark/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="size-10 rounded-full bg-slate-100 dark:bg-white/5 border border-transparent hover:border-primary/50 flex items-center justify-center text-slate-700 dark:text-white hover:text-primary transition-all group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-xl md:text-2xl font-black text-white leading-none">Histórico de Compras</h1>
            <p className="text-text-secondary text-[10px] font-black uppercase tracking-widest mt-1 opacity-60">Visualize e analise seus gastos mensais.</p>
          </div>
        </div>
        <button onClick={exportData} className="flex items-center gap-2 rounded-full h-10 px-6 bg-surface-dark border border-border-green text-text-secondary hover:text-white hover:border-primary transition-all text-sm font-bold active:scale-95 shadow-lg">
          <Download size={18} /> <span className="hidden sm:inline">Exportar</span>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-6 md:p-10 flex flex-col gap-8 pb-32">
        <div className="flex flex-col md:flex-row justify-between gap-6 items-center">
          <div className="flex items-center bg-surface-dark border border-border-green rounded-full p-1.5 shadow-2xl">
            <button onClick={() => changeMonth(-1)} className="p-2.5 text-text-secondary hover:text-primary rounded-full hover:bg-white/5 transition-all active:scale-75"><ChevronLeft size={22} /></button>
            <div className="px-8 text-white font-black text-sm uppercase tracking-widest min-w-[200px] text-center">{formatMonth(currentMonth)}</div>
            <button onClick={() => changeMonth(1)} className="p-2.5 text-text-secondary hover:text-primary rounded-full hover:bg-white/5 transition-all active:scale-75"><ChevronRight size={22} /></button>
          </div>
          <div className="relative group w-full md:w-80">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors" />
            <input type="text" placeholder="Pesquisar mercado..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full h-12 bg-surface-dark border border-border-green rounded-full pl-12 pr-4 text-sm text-white placeholder:text-text-secondary/40 outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-4 rounded-[2.5rem] p-8 bg-surface-dark border border-border-green shadow-xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 size-32 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="flex justify-between items-start relative z-10">
              <p className="text-text-secondary text-[10px] font-black uppercase tracking-[0.2em]">Total Gasto</p>
              <div className="size-10 bg-background-dark border border-border-green rounded-xl flex items-center justify-center text-primary shadow-lg"><DollarSign size={20} /></div>
            </div>
            <div className="relative z-10">
              <p className="text-white text-4xl font-black leading-tight tracking-tight">{formatCurrency(stats.totalSpent)}</p>
              <div className="flex items-center gap-1.5 mt-2"><TrendingUp size={16} className="text-primary" /><p className="text-primary text-[10px] font-black uppercase tracking-wider">{stats.trend} vs Setembro</p></div>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-[2.5rem] p-8 bg-surface-dark border border-border-green shadow-xl relative overflow-hidden group">
            <div className="flex justify-between items-start relative z-10">
              <p className="text-text-secondary text-[10px] font-black uppercase tracking-[0.2em]">Média por Compra</p>
              <div className="size-10 bg-background-dark border border-border-green rounded-xl flex items-center justify-center text-primary shadow-lg"><BarChart3 size={20} /></div>
            </div>
            <div className="relative z-10">
              <p className="text-white text-4xl font-black leading-tight tracking-tight">{formatCurrency(stats.averageSpent)}</p>
              <p className="text-text-secondary text-[10px] mt-2 font-black uppercase tracking-widest opacity-60">Baseado em {filteredHistory.length} visitas</p>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-[2.5rem] p-8 bg-surface-dark border border-border-green shadow-xl relative overflow-hidden group">
            <div className="flex justify-between items-start relative z-10">
              <p className="text-text-secondary text-[10px] font-black uppercase tracking-[0.2em]">Itens Comprados</p>
              <div className="size-10 bg-background-dark border border-border-green rounded-xl flex items-center justify-center text-primary shadow-lg"><ShoppingBag size={20} /></div>
            </div>
            <div className="relative z-10">
              <p className="text-white text-4xl font-black leading-tight tracking-tight">{stats.totalItems}</p>
              <p className="text-text-secondary text-[10px] mt-2 font-black uppercase tracking-widest opacity-60">Volume de estoque do mês</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col rounded-[2.5rem] bg-surface-dark border border-border-green shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between p-8 border-b border-border-green bg-surface-darker/50">
            <h3 className="text-white text-lg font-black uppercase tracking-widest">Histórico Detalhado</h3>
            <span className="px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-primary text-[10px] font-black uppercase">{filteredHistory.length} Registros</span>
          </div>

          <div className="flex flex-col divide-y divide-border-green/30">
            <div className="hidden lg:flex bg-background-dark/30 px-8 py-4 text-[10px] font-black text-text-secondary uppercase tracking-[0.3em]">
              <div className="w-1/4">Data</div><div className="w-1/4">Mercado</div><div className="w-1/6 text-center">Itens</div><div className="w-1/6 text-right">Valor</div><div className="w-1/6 text-right px-4">Ações</div>
            </div>

            {isLoading ? (
              <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
            ) : filteredHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-24 text-center opacity-40"><Calendar size={80} className="mb-6 text-text-secondary" /><p className="text-xl font-black uppercase tracking-widest">Nenhum registro.</p></div>
            ) : (
              filteredHistory.map((entry) => (
                <div key={entry.id} className="group flex flex-col lg:flex-row items-center p-6 lg:px-8 lg:py-6 hover:bg-white/[0.02] transition-all cursor-pointer relative">
                  <div className="w-full lg:w-1/4 flex items-center gap-5 mb-4 lg:mb-0">
                    <div className="size-12 rounded-2xl bg-background-dark border border-border-green text-text-secondary group-hover:text-primary transition-all shadow-xl flex items-center justify-center"><Calendar size={22} /></div>
                    <div className="flex flex-col"><span className="text-white font-black text-base uppercase tracking-tight">{formatDateLabel(entry.date)}</span></div>
                  </div>
                  <div className="w-full lg:w-1/4 flex items-center gap-2 mb-4 lg:mb-0"><span className="text-white font-bold text-lg group-hover:text-primary transition-colors">{entry.store}</span></div>
                  <div className="w-full lg:w-1/6 flex items-center justify-between lg:justify-center mb-4 lg:mb-0">
                    <span className="lg:hidden text-text-secondary text-[10px] font-black uppercase tracking-widest">Itens:</span>
                    <span className="inline-flex items-center px-4 py-1 rounded-full text-[11px] font-black bg-background-dark text-text-secondary border border-border-green uppercase tracking-wider">{entry.itemCount} itens</span>
                  </div>
                  <div className="w-full lg:w-1/6 flex items-center justify-between lg:justify-end mb-4 lg:mb-0">
                    <span className="lg:hidden text-text-secondary text-[10px] font-black uppercase tracking-widest">Valor:</span>
                    <span className="text-primary font-black text-2xl lg:text-lg">{formatCurrency(entry.totalValue)}</span>
                  </div>
                  <div className="w-full lg:w-1/6 flex justify-end items-center gap-3">
                    <button onClick={(e) => toggleFavorite(entry.id, e)} className={`size-10 rounded-full flex items-center justify-center transition-all border ${entry.isFavorite ? 'bg-primary/20 border-primary/40 text-primary shadow-lg' : 'bg-white/5 border-white/5 text-text-secondary hover:text-white'}`} title="Salvar/Favoritar"><Star size={18} fill={entry.isFavorite ? "currentColor" : "none"} /></button>
                    <button onClick={(e) => deleteEntry(entry.id, e)} className="size-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-text-secondary hover:text-red-500 hover:border-red-500/30 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button>
                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform"><ChevronRightIcon size={18} /></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, #13ec5b 0%, transparent 40%)" }}></div>
    </Layout>
  );
};

export default History;
