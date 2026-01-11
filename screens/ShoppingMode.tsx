
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ShoppingCart, X, Check, Edit2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { HistoryEntry, GroceryItem, GroceryList } from '../types';
import { supabase } from '../SmartList/services/src/lib/supabase';

const ShoppingMode: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [list, setList] = useState<GroceryList | null>(null);
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchList = async () => {
      if (!id) return;
      setIsLoading(true);

      const { data, error } = await supabase
        .from('grocery_lists')
        .select(`*, items:grocery_items(*)`)
        .eq('id', id)
        .single();

      if (error || !data) {
        console.error('Error fetching list for shopping mode', error);
        alert('Erro ao carregar lista.');
        navigate('/dashboard');
        return;
      }

      const mappedList: GroceryList = {
        id: data.id,
        name: data.name,
        store: data.store || 'Loja',
        createdAt: data.created_at,
        shoppingDate: data.shopping_date,
        maxBudget: data.max_budget,
        items: [],
        progress: 0,
        estimatedTotal: 0
      };

      const mappedItems: GroceryItem[] = (data.items || [])
        .map((item: any) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          bought: item.bought,
          aisle: item.aisle || 'Geral',
          imageUrl: item.image_url || `https://picsum.photos/300/300?seed=${item.id}`
        }))
      // Optional: sort or filter logic here

      setList(mappedList);
      setItems(mappedItems);

      // smart start index: first unbought item
      const firstUnbought = mappedItems.findIndex(i => !i.bought);
      if (firstUnbought !== -1) setCurrentIndex(firstUnbought);

      setIsLoading(false);
    };

    fetchList();
  }, [id, navigate]);

  const currentItem = items[currentIndex];

  const totalSpent = useMemo(() => {
    return items.reduce((acc, item) => acc + (item.bought ? item.unitPrice * item.quantity : 0), 0);
  }, [items]);

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setShowSummary(true);
    }
  };

  const handleConfirmItem = async () => {
    if (!currentItem) return;

    // Optimistic Update
    const updatedItems = [...items];
    updatedItems[currentIndex] = { ...currentItem, bought: true };
    setItems(updatedItems);

    // DB Update
    await supabase.from('grocery_items').update({ bought: true }).eq('id', currentItem.id);

    handleNext();
  };

  const finalizePurchase = async () => {
    if (!list) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Insert into history
    const { error } = await supabase.from('shopping_history').insert({
      user_id: user.id,
      store: list.store,
      date: new Date().toISOString(),
      item_count: items.filter(i => i.bought).length,
      total_value: totalSpent
    });

    if (error) {
      console.error('Error saving history:', error);
      alert('Erro ao salvar histórico');
    }

    navigate('/history');
  };

  if (isLoading) {
    return (
      <div className="bg-background-dark min-h-screen flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (showSummary) {
    return (
      <div className="bg-background-dark min-h-screen flex items-center justify-center p-6 text-center">
        <div className="bg-surface-dark border border-border-green p-10 rounded-[3rem] max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="size-24 bg-primary/20 rounded-full flex items-center justify-center text-primary mx-auto mb-6">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-3xl font-black text-white mb-2">Compra Finalizada!</h2>
          <p className="text-text-secondary mb-8">Sua compra foi concluída e registrada no seu histórico com sucesso.</p>

          <div className="bg-background-dark/50 rounded-2xl p-6 border border-border-green/50 mb-8 space-y-3 text-left">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Itens Comprados</span>
              <span className="text-white font-bold">{items.filter(i => i.bought).length} / {items.length}</span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="text-text-secondary font-medium">Investimento</span>
              <span className="text-primary font-black">R$ {totalSpent.toFixed(2).replace('.', ',')}</span>
            </div>
          </div>

          <button
            onClick={finalizePurchase}
            className="w-full bg-primary text-background-dark h-14 rounded-full font-bold text-lg hover:bg-green-400 transition-all shadow-lg shadow-primary/20 active:scale-95"
          >
            Ver no Histórico
          </button>
        </div>
      </div>
    );
  }

  if (!currentItem) {
    return (
      <div className="bg-background-dark min-h-screen flex items-center justify-center p-6 text-center text-white">
        <p>Nenhum item nesta lista.</p>
        <button onClick={() => navigate(-1)} className="ml-4 text-primary underline">Voltar</button>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark font-sans text-slate-900 dark:text-white min-h-screen flex flex-col overflow-hidden">
      <header className="flex-none flex items-center justify-between border-b border-[#23482f] px-6 py-4 bg-surface-darker z-20">
        <div className="flex items-center gap-4 text-white">
          <div className="size-8 flex items-center justify-center bg-primary/20 rounded-full text-primary">
            <ShoppingCart size={20} />
          </div>
          <div>
            <h2 className="text-white text-lg font-bold leading-tight uppercase tracking-tight">Modo Compras</h2>
            <span className="text-text-secondary text-xs font-medium">{list?.store} • {list?.name}</span>
          </div>
        </div>
        <button onClick={() => navigate(-1)} className="flex items-center justify-center rounded-full h-10 px-5 bg-surface-dark border border-[#23482f] text-text-secondary hover:text-white hover:bg-[#23482f] transition-colors text-sm font-bold">
          <X size={18} className="mr-2" />
          <span>Sair</span>
        </button>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden relative">
        <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12 relative z-10 overflow-y-auto">
          <div className="w-full max-w-3xl mb-8">
            <div className="flex justify-between items-end mb-2">
              <span className="text-text-secondary font-black uppercase tracking-[0.2em] text-[10px]">Progresso</span>
              <span className="text-white font-bold text-sm">{currentIndex + 1} <span className="text-text-secondary font-normal">/ {items.length}</span></span>
            </div>
            <div className="h-2 w-full bg-[#23482f] rounded-full overflow-hidden">
              <div className="h-full bg-primary shadow-[0_0_10px_rgba(19,236,91,0.5)] transition-all duration-500" style={{ width: `${((currentIndex + 1) / items.length) * 100}%` }}></div>
            </div>
          </div>

          <div className="w-full max-w-3xl bg-surface-dark border border-border-green rounded-[2.5rem] p-6 lg:p-10 shadow-2xl relative group transition-all duration-300">
            <div className="absolute top-6 right-6 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20">{currentItem.category}</div>
            <div className="flex flex-col md:flex-row gap-10 items-center">
              <div className="w-full md:w-2/5 aspect-square rounded-3xl overflow-hidden bg-surface-darker relative shadow-2xl border border-[#23482f] flex items-center justify-center">
                <img src={currentItem.imageUrl} alt={currentItem.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
              <div className="flex-1 text-center md:text-left w-full">
                <h1 className="text-4xl lg:text-5xl font-black text-white mb-2 leading-tight uppercase tracking-tight">{currentItem.name}</h1>
                <p className="text-xl text-text-secondary mb-8 font-medium italic">{currentItem.category}</p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-background-dark/50 p-5 rounded-2xl border border-[#23482f]">
                    <span className="block text-text-secondary text-[10px] font-black uppercase tracking-widest mb-1">Preço Est.</span>
                    <span className="text-white text-2xl font-black">R$ {currentItem.unitPrice.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="bg-background-dark/50 p-5 rounded-2xl border border-[#23482f]">
                    <span className="block text-text-secondary text-[10px] font-black uppercase tracking-widest mb-1">Quantidade</span>
                    <span className="text-primary text-2xl font-black">{currentItem.quantity}x</span>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-start gap-4 border-t border-[#23482f] pt-6">
                  <span className="text-text-secondary font-bold uppercase text-xs tracking-widest">Total Item:</span>
                  <span className="text-4xl font-black text-white">R$ {(currentItem.unitPrice * currentItem.quantity).toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full max-w-3xl mt-10 grid grid-cols-2 gap-4 lg:gap-8">
            <button
              onClick={handleNext}
              className="group flex flex-col items-center justify-center h-32 lg:h-40 bg-surface-dark hover:bg-red-500/10 border border-[#23482f] hover:border-red-500/30 rounded-[2rem] transition-all active:scale-95"
            >
              <AlertCircle size={40} className="text-red-400 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-white font-black text-xs uppercase tracking-widest">Pular Item</span>
            </button>
            <button
              onClick={handleConfirmItem}
              className="group flex flex-col items-center justify-center h-32 lg:h-40 bg-primary hover:bg-[#0fd651] text-surface-darker rounded-[2rem] shadow-[0_15px_30px_rgba(19,236,91,0.2)] transition-all active:scale-95"
            >
              <div className="bg-black/10 p-2 rounded-full mb-2 group-hover:scale-110 transition-transform">
                <Check size={44} strokeWidth={3} />
              </div>
              <span className="font-black text-sm uppercase tracking-widest">Confirmar</span>
            </button>
          </div>
        </div>

        <aside className="hidden lg:flex w-96 bg-[#0d1c12] border-l border-[#23482f] flex-col z-20 overflow-hidden shadow-2xl">
          <div className="p-8 bg-surface-darker border-b border-[#23482f]">
            <h3 className="text-text-secondary text-[10px] font-black uppercase tracking-[0.2em] mb-6">Investimento Acumulado</h3>
            <div className="p-6 rounded-[2rem] bg-surface-dark border border-[#23482f] shadow-inner">
              <div className="text-4xl font-black text-white tracking-tight">R$ {totalSpent.toFixed(2).replace('.', ',')}</div>
              <p className="text-[10px] text-text-secondary mt-2 font-bold uppercase">Calculado em tempo real</p>
            </div>
          </div>
          <div className="flex-1 p-8 overflow-y-auto">
            <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-widest">Próximos Itens</h4>
            <div className="space-y-3 opacity-50">
              {items.slice(currentIndex + 1).map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-white/5">
                  <div className="size-10 rounded-lg bg-cover bg-center bg-surface-dark" style={{ backgroundImage: `url('${item.imageUrl}')` }}></div>
                  <div className="flex flex-col">
                    <span className="text-white text-sm font-bold truncate">{item.name}</span>
                    <span className="text-text-secondary text-[10px]">{item.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default ShoppingMode;
