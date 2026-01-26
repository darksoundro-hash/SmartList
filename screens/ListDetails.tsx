import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import {
  Calendar,
  Share2,
  Trash2,
  PlusCircle,
  ShoppingCart,
  Wallet,
  PiggyBank,
  Plus,
  Minus,
  CheckCircle2,
  Circle,
  X,
  ArrowLeft,
  ChevronDown,
  MoreVertical,
  Play,
  Check,
  AlertTriangle,

  Pencil,
  CreditCard,
  DollarSign,
  Smartphone
} from 'lucide-react';
import { GroceryItem, GroceryList, PaymentMethod } from '../types';

import { supabase } from '../SmartList/services/src/lib/supabase';
import { useSubscription } from '../components/SubscriptionContext';
import { PaywallModal } from '../components/PaywallModal';

const ListDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [listData, setListData] = useState<GroceryList | null>(null);
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending'>('all');
  const [shared, setShared] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Separate states for editing fields to avoid weird UI behavior
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState('');

  const [isEditingDate, setIsEditingDate] = useState(false);
  const [tempDate, setTempDate] = useState('');

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');

  // Shopping Mode State
  const [isShoppingMode, setIsShoppingMode] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card');

  // Subscription Limits
  const { checkLimits } = useSubscription();
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallMessage, setPaywallMessage] = useState('');

  const isDeleting = useRef(false);

  useEffect(() => {
    fetchList();
  }, [id]);

  const fetchList = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('grocery_lists')
        .select(`*, items:grocery_items(*)`)
        .eq('id', id)
        .single();

      if (error || !data) {
        console.error('Error fetching list:', error);
        setIsLoading(false);
        return;
      }

      const mappedList: GroceryList = {
        id: data.id,
        name: data.name,
        store: data.store || '',
        createdAt: data.created_at,
        shoppingDate: data.shopping_date,
        maxBudget: data.max_budget,
        items: [], // Populated below
        progress: 0,
        estimatedTotal: 0
      };

      const mappedItems: GroceryItem[] = (data.items || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        bought: item.bought,
        aisle: item.aisle,
        imageUrl: item.image_url
      }));

      setListData(mappedList);
      setItems(mappedItems);
      setTempBudget(data.max_budget?.toString() || '0');
      setTempDate(data.shopping_date || '');
      setTempName(data.name);
      setIsLoading(false);
    } catch (error) {
      console.error('Error in fetchList:', error);
      setIsLoading(false);
    }
  };

  const stats = useMemo(() => {
    const listTotal = items.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
    const totalBought = items.reduce((acc, item) => acc + (item.bought ? item.unitPrice * item.quantity : 0), 0);
    const boughtCount = items.filter(i => i.bought).length;
    const progress = items.length > 0 ? (boughtCount / items.length) * 100 : 0;
    const maxBudget = listData?.maxBudget || 0;
    const remainingBudget = maxBudget > 0 ? maxBudget - listTotal : 0;

    return { listTotal, totalBought, progress, remainingBudget, boughtCount, maxBudget };
  }, [items, listData]);


  const filteredItems = useMemo(() => {
    if (activeTab === 'pending') return items.filter(item => !item.bought);
    return items;
  }, [items, activeTab]);

  const handleAddItem = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Check Limits - Max Items
    if (!checkLimits.canAddItem(items.length)) {
      setPaywallMessage(`Você atingiu o limite de ${5} itens por lista do plano Grátis.`);
      setShowPaywall(true);
      return;
    }

    if (!newItemName.trim() || !id) return;

    const name = newItemName.toUpperCase();
    const tempId = Math.random().toString(36).substr(2, 9);

    // Optimistic Update
    const newItem: GroceryItem = {
      id: tempId,
      name: name,
      category: 'Geral',
      quantity: 1,
      unitPrice: 0.0,
      bought: false
    };
    setItems(prev => [newItem, ...prev]);
    setNewItemName('');

    // DB Call
    const { data, error } = await supabase
      .from('grocery_items')
      .insert({
        list_id: id,
        name: name,
        category: 'Geral',
        quantity: 1,
        unit_price: 0,
        bought: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding item:', error);
      setItems(prev => prev.filter(i => i.id !== tempId)); // Revert
    } else if (data) {
      // Replace temp ID with real ID
      setItems(prev => prev.map(i => i.id === tempId ? { ...i, id: data.id } : i));
    }
  };

  const toggleItem = async (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const newBought = !item.bought;

    // Optimistic
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, bought: newBought } : i));

    const { error } = await supabase
      .from('grocery_items')
      .update({ bought: newBought })
      .eq('id', itemId);

    if (error) {
      console.error('Error updating item:', error);
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, bought: !newBought } : i)); // Revert
    }
  };

  const updateQuantity = async (itemId: string, delta: number) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const newQty = Math.max(1, item.quantity + delta);

    setItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity: newQty } : i));

    const { error } = await supabase
      .from('grocery_items')
      .update({ quantity: newQty })
      .eq('id', itemId);

    if (error) {
      // Revert or handle error
      console.error('Error updating qty:', error);
    }
  };

  const updatePrice = async (itemId: string, price: string) => {
    const numericPrice = parseFloat(price.replace(',', '.')) || 0;

    setItems(prev => prev.map(i => i.id === itemId ? { ...i, unitPrice: numericPrice } : i));

    const { error } = await supabase
      .from('grocery_items')
      .update({ unit_price: numericPrice })
      .eq('id', itemId);

    if (error) console.error(error);
  };

  const deleteItem = async (itemId: string) => {
    if (!window.confirm('Deseja realmente excluir este item da lista?')) return;

    const oldItems = [...items];
    setItems(prev => prev.filter(item => item.id !== itemId));

    const { error } = await supabase
      .from('grocery_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error('Error deleting item', error);
      setItems(oldItems); // Revert
    }
  };

  const handleUpdateBudget = async () => {
    const newBudget = parseFloat(tempBudget.replace(',', '.')) || 0;
    if (listData && id) {
      setListData({ ...listData, maxBudget: newBudget });
      await supabase.from('grocery_lists').update({ max_budget: newBudget }).eq('id', id);
    }
    setIsEditingBudget(false);
  };

  const handleUpdateDate = async () => {
    if (listData && id) {
      setListData({ ...listData, shoppingDate: tempDate });
      await supabase.from('grocery_lists').update({ shopping_date: tempDate }).eq('id', id);
    }
    setIsEditingDate(false);
  };

  const saveListName = async () => {
    if (listData && tempName.trim() && id) {
      setListData({ ...listData, name: tempName });
      await supabase.from('grocery_lists').update({ name: tempName }).eq('id', id);
      setIsEditingName(false);
    }
  };

  const confirmDeleteList = async () => {
    // Check Limits - Delete Block
    if (!checkLimits.canDeleteList()) {
      setShowDeleteModal(false);
      setPaywallMessage('Usuários Grátis não podem excluir listas. Essa é uma funcionalidade Premium.');
      setShowPaywall(true);
      return;
    }

    if (!id) return;
    isDeleting.current = true;

    const { error } = await supabase.from('grocery_lists').delete().eq('id', id);

    if (error) {
      console.error('Error deleting list:', error);
      alert('Erro ao excluir lista. Tente novamente.');
      isDeleting.current = false;
      return;
    }

    setShowDeleteModal(false);
    navigate('/dashboard');
  };

  const handleShare = async () => {
    const listSummary = items
      .map(item => `${item.quantity}x ${item.name} - R$ ${(item.unitPrice * item.quantity).toFixed(2)}`)
      .join('\n');
    const text = `🛒 Minha Lista: ${listData?.name}\n\n${listSummary}\n\nTotal: ${formatCurrency(stats.listTotal)}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'SmartList AI', text });
      } catch (err) {
        copyToClipboard(text);
      }
    } else {
      copyToClipboard(text);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch (err) {
      alert("Erro ao copiar lista.");
    }
  };

  const handleFinalizeClick = () => {
    if (!id || !listData) return;
    setShowPaymentModal(true);
  };

  const confirmPurchase = async () => {
    if (!id || !listData) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const boughtItems = items.filter(i => i.bought);
    const totalSpent = boughtItems.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);

    // Insert into history
    const { error } = await supabase.from('shopping_history').insert({
      user_id: user.id,
      store: listData.store || 'Mercado',
      date: new Date().toISOString(),
      item_count: boughtItems.length,
      total_value: totalSpent,
      payment_method: paymentMethod
    });

    if (error) {
      console.error('Error saving history:', error);
      alert('Erro ao salvar histórico');
      return;
    }

    // Exit shopping mode and show success
    setIsShoppingMode(false);
    setShowPaymentModal(false);
    alert(`Compra finalizada! Método: ${getPaymentMethodLabel(paymentMethod)}`);
  };

  const getPaymentMethodLabel = (method: PaymentMethod) => {
    switch (method) {
      case 'credit_card': return 'Cartão de Crédito';
      case 'debit_card': return 'Cartão de Débito';
      case 'money': return 'Dinheiro';
      case 'pix': return 'Pix';
      case 'voucher': return 'Vale Alimentação';
      default: return 'Outro';
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Definir data';
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('pt-BR');
  }

  if (isLoading && !isDeleting.current) {
    return (
      <Layout activePage="lists">
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="size-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Carregando lista...</h2>
          <p className="text-slate-500 dark:text-gray-400">Preparando sua experiência de compras inteligente.</p>
        </div>
      </Layout>
    );
  }

  if (!listData && !isDeleting.current) {
    return (
      <Layout activePage="lists">
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div className="bg-white dark:bg-surface-dark p-8 rounded-[2rem] max-w-md w-full border border-gray-200 dark:border-white/5">
            <div className="size-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Lista não encontrada</h2>
            <p className="text-slate-500 dark:text-gray-400 mb-8">
              A lista que você está procurando não existe ou foi removida.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl font-bold transition-colors text-slate-900 dark:text-white"
            >
              Voltar ao Início
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout activePage="lists">
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        message={paywallMessage}
      />

      {/* Modal de Exclusão Customizado */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-dark border border-border-green rounded-[2rem] p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center gap-6 transform animate-in zoom-in-95 duration-200">
            <div className="size-20 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
              <AlertTriangle size={40} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white">Excluir Lista?</h2>
              <p className="text-text-secondary">Esta ação não pode ser desfeita. Todos os itens de <span className="text-white font-bold">"{listData?.name}"</span> serão apagados.</p>
            </div>
            <div className="flex flex-col w-full gap-3">
              <button
                onClick={confirmDeleteList}
                className="w-full h-14 bg-red-500 hover:bg-red-600 text-white font-bold rounded-full transition-all active:scale-95 shadow-lg shadow-red-500/20"
              >
                Sim, Excluir Agora
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="w-full h-14 bg-white/5 hover:bg-white/10 text-white font-bold rounded-full transition-all active:scale-95"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Pagamento */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-dark border border-border-green rounded-[2rem] p-6 max-w-md w-full shadow-2xl flex flex-col gap-6 transform animate-in slide-in-from-bottom-10 md:slide-in-from-bottom-0 md:zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <div>
                <h2 className="text-2xl font-black text-white">Pagamento</h2>
                <p className="text-text-secondary text-sm">Como você realizou esta compra?</p>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="p-2 bg-white/5 rounded-full text-slate-400 hover:text-white"><X size={20} /></button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'voucher', label: 'Vale Alim.', icon: <Wallet size={24} />, color: 'text-orange-400' },
                { id: 'credit_card', label: 'Crédito', icon: <CreditCard size={24} />, color: 'text-blue-400' },
                { id: 'debit_card', label: 'Débito', icon: <CreditCard size={24} />, color: 'text-purple-400' },
                { id: 'pix', label: 'Pix', icon: <Smartphone size={24} />, color: 'text-green-400' },
                { id: 'money', label: 'Dinheiro', icon: <DollarSign size={24} />, color: 'text-green-600' },
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                  className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all ${paymentMethod === method.id ? 'bg-primary/10 border-primary shadow-[0_0_15px_rgba(19,236,91,0.2)]' : 'bg-background-dark border-white/5 hover:bg-white/5 hover:border-white/10'}`}
                >
                  <div className={`${paymentMethod === method.id ? 'text-primary' : method.color}`}>{method.icon}</div>
                  <span className={`font-bold text-sm ${paymentMethod === method.id ? 'text-white' : 'text-slate-400'}`}>{method.label}</span>
                </button>
              ))}
            </div>

            <div className="pt-2">
              <div className="flex justify-between items-center mb-4 px-2">
                <span className="text-slate-400 font-medium">Total Pago</span>
                <span className="text-2xl font-black text-white">{formatCurrency(items.filter(i => i.bought).reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0))}</span>
              </div>
              <button
                onClick={confirmPurchase}
                className="w-full h-14 bg-primary hover:bg-green-400 text-background-dark font-bold rounded-full transition-all active:scale-95 shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
              >
                <Check size={20} />
                Confirmar Pagamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header - Fixed */}
      <header className="flex-none bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-white/5 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="size-10 rounded-full bg-slate-100 dark:bg-white/5 border border-transparent hover:border-primary/50 flex items-center justify-center text-slate-700 dark:text-white hover:text-primary transition-all group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setIsEditingName(true)}>
              {isEditingName ? (
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onBlur={saveListName}
                  onKeyDown={(e) => e.key === 'Enter' && saveListName()}
                  autoFocus
                  className="bg-transparent text-2xl font-black text-slate-900 dark:text-white outline-none border-b-2 border-primary w-full min-w-[200px]"
                />
              ) : (
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-primary transition-colors flex items-center gap-2">
                  {listData?.name}
                  <ChevronDown size={18} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                </h1>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs md:text-sm text-slate-500 dark:text-gray-400 mt-1">
              <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md">
                <Calendar size={12} />
                {new Date(listData?.createdAt || '').toLocaleDateString('pt-BR')}
              </span>
              {listData?.items && listData.items.length > 0 && (
                <>
                  <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                  <span>{listData.items.length} itens</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={() => setIsShoppingMode(!isShoppingMode)}
            className={`hidden md:flex h-10 px-4 items-center gap-2 rounded-xl font-bold transition-all shadow-lg active:scale-95 ${isShoppingMode
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-primary hover:bg-green-400 text-background-dark'
              }`}
            title={isShoppingMode ? "Sair do Modo Compras" : "Iniciar Modo Compras"}
          >
            <ShoppingCart size={18} />
            <span className="hidden sm:inline">{isShoppingMode ? 'Sair do Modo' : 'Modo Compras'}</span>
            <span className="sm:hidden">{isShoppingMode ? 'Sair' : 'Compras'}</span>
          </button>
          <button
            onClick={handleShare}
            className="hidden md:flex h-10 px-4 items-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-white font-medium transition-colors"
          >
            {shared ? <Check size={18} /> : <Share2 size={18} />}
            <span>{shared ? 'Copiado' : 'Compartilhar'}</span>
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="size-10 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-500 flex items-center justify-center transition-colors"
            title="Excluir Lista"
          >
            <Trash2 size={20} />
          </button>
          <button
            className="md:hidden size-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-700 dark:text-white"
          >
            <MoreVertical size={20} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-32">
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-tight uppercase">{listData?.name || '---'}</h1>

              {/* Data das Compras Editável */}
              <div
                className="flex items-center gap-2 group cursor-pointer w-fit"
                onClick={() => !isEditingDate && setIsEditingDate(true)}
              >
                <Calendar size={16} className="text-slate-500 dark:text-text-secondary" />
                <span className="text-slate-500 dark:text-text-secondary text-sm font-normal">Compras planejadas para:</span>
                {isEditingDate ? (
                  <input
                    autoFocus
                    type="date"
                    className="bg-background-dark/50 border border-primary/50 rounded-lg px-2 py-0.5 text-slate-900 dark:text-white text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 [color-scheme:dark]"
                    value={tempDate}
                    onChange={(e) => setTempDate(e.target.value)}
                    onBlur={handleUpdateDate}
                    onKeyDown={(e) => e.key === 'Enter' && handleUpdateDate()}
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-900 dark:text-white font-bold text-sm underline decoration-dotted decoration-primary/30 underline-offset-4">{formatDate(listData?.shoppingDate)}</span>
                    <Pencil size={12} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="flex md:hidden gap-2 w-full">
              <button
                onClick={handleShare}
                className={`flex-1 flex items-center justify-center rounded-xl h-12 px-5 transition-all gap-2 font-bold text-sm ${shared ? 'bg-primary text-background-dark' : 'bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white'}`}
              >
                {shared ? <Check size={18} /> : <Share2 size={18} />}
                {shared ? 'Copiado!' : 'Compartilhar'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col justify-between gap-1 rounded-[2rem] p-6 bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-green relative overflow-hidden group shadow-sm">
              <ShoppingCart size={48} className="absolute right-0 top-0 p-4 opacity-10 text-primary group-hover:scale-110 transition-transform pointer-events-none" />
              <p className="text-slate-500 dark:text-text-secondary text-sm font-medium uppercase tracking-wider">Total da Lista</p>
              <p className="text-slate-900 dark:text-white text-3xl font-bold leading-tight">{formatCurrency(stats.listTotal)}</p>
            </div>

            {/* Card de Limite Orçamento Editável */}
            <div
              className="flex flex-col justify-between gap-1 rounded-[2rem] p-6 bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-green relative overflow-hidden group cursor-pointer hover:border-primary/50 transition-colors shadow-sm"
              onClick={() => !isEditingBudget && setIsEditingBudget(true)}
            >
              <Wallet size={48} className="absolute right-0 top-0 p-4 opacity-10 text-primary group-hover:scale-110 transition-transform pointer-events-none" />
              <div className="flex items-center gap-2 z-10">
                <p className="text-slate-500 dark:text-text-secondary text-sm font-medium uppercase tracking-wider">Limite Orçamento</p>
                <Pencil size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {isEditingBudget ? (
                <div className="flex items-center gap-2 mt-1 z-10">
                  <span className="text-2xl font-bold text-primary">R$</span>
                  <input
                    autoFocus
                    type="text"
                    className="bg-slate-100 dark:bg-background-dark/50 border border-primary/50 rounded-lg px-2 py-1 text-slate-900 dark:text-white text-2xl font-bold w-full outline-none focus:ring-2 focus:ring-primary/20"
                    value={tempBudget}
                    onChange={(e) => setTempBudget(e.target.value)}
                    onBlur={handleUpdateBudget}
                    onKeyDown={(e) => e.key === 'Enter' && handleUpdateBudget()}
                  />
                </div>
              ) : (
                <p className="text-slate-900 dark:text-white text-3xl font-bold leading-tight z-10">{formatCurrency(stats.maxBudget)}</p>
              )}
            </div>

            <div className="flex flex-col justify-between gap-1 rounded-[2rem] p-6 bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-green relative overflow-hidden group shadow-sm">
              <PiggyBank size={48} className="absolute right-0 top-0 p-4 opacity-10 text-primary group-hover:scale-110 transition-transform pointer-events-none" />
              <p className="text-slate-500 dark:text-text-secondary text-sm font-medium uppercase tracking-wider">Restante</p>
              <p className={`${(stats.maxBudget > 0 && stats.remainingBudget < 0) ? 'text-red-500' : 'text-primary'} text-3xl font-bold leading-tight`}>
                {stats.maxBudget > 0 ? formatCurrency(stats.remainingBudget) : '---'}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6 w-full">
            <form onSubmit={handleAddItem} className="relative z-30 w-full px-1">
              <div className="bg-white dark:bg-surface-dark p-1.5 md:p-2 rounded-full border border-gray-200 dark:border-border-green flex items-center shadow-lg focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all relative z-20 w-full">
                <div className="pl-3 md:pl-4 pr-1 md:pr-2 text-slate-400 shrink-0"><PlusCircle size={20} /></div>
                <input
                  className="flex-1 bg-transparent border-none text-slate-900 dark:text-white placeholder-slate-400 focus:ring-0 text-sm md:text-base font-medium h-9 md:h-10 outline-none min-w-0"
                  placeholder="Adicionar item..."
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                />
                <button type="submit" className="ml-1 md:ml-2 h-9 md:h-10 px-3 md:px-6 rounded-full bg-primary text-background-dark font-bold text-xs md:text-sm hover:bg-green-400 transition-all active:scale-95 shadow-lg shadow-primary/20 shrink-0">
                  <span className="hidden xs:inline">Adicionar</span>
                  <Plus size={20} className="xs:hidden" />
                </button>
              </div>
            </form>

            {/* Shopping Mode Banner */}
            {isShoppingMode && (
              <div className="bg-primary/10 border-2 border-primary/30 rounded-2xl p-4 flex items-center gap-3 animate-in slide-in-from-top duration-300">
                <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <ShoppingCart size={20} className="text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">🛒 Modo Compras Ativo</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Marque os itens conforme você compra</p>
                </div>
                <button
                  onClick={() => setIsShoppingMode(false)}
                  className="size-8 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500 flex items-center justify-center transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="flex flex-col bg-white dark:bg-surface-dark rounded-[2rem] border border-gray-200 dark:border-border-green overflow-hidden min-h-[500px] shadow-xl">
              <div className="p-4 border-b border-gray-200 dark:border-border-green flex items-center justify-between bg-slate-50 dark:bg-surface-darker/30">
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${activeTab === 'all' ? 'bg-primary/10 text-primary border-primary/20' : 'text-slate-500 border-transparent hover:bg-slate-100 dark:hover:bg-white/5'}`}
                  >
                    Todos ({items.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('pending')}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${activeTab === 'pending' ? 'bg-primary/10 text-primary border-primary/20' : 'text-slate-500 border-transparent hover:bg-slate-100 dark:hover:bg-white/5'}`}
                  >
                    Para Comprar ({items.filter(i => !i.bought).length})
                  </button>
                </div>
                <div className="text-xs text-slate-500 dark:text-text-secondary font-medium">
                  Progresso: <span className="text-slate-900 dark:text-white font-bold">{stats.progress.toFixed(0)}%</span>
                </div>
              </div>

              <div className="flex flex-col divide-y divide-gray-100 dark:divide-border-green h-full">
                {filteredItems.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400">
                    <ShoppingCart size={48} className="mb-4 opacity-20" />
                    <p className="text-lg font-medium">Sua lista está vazia.</p>
                    <p className="text-sm opacity-60">Adicione itens para começar.</p>
                  </div>
                ) : (
                  filteredItems.map(item => (
                    <div key={item.id} className="flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4 px-4 md:px-6 py-4 md:py-5 items-start md:items-center hover:bg-slate-50 dark:hover:bg-white/5 transition-all group border-b border-gray-50 dark:border-white/5 last:border-0">
                      {/* Linha Superior Mobile / Coluna 1 e 2 Desktop */}
                      <div className="flex w-full md:contents items-center justify-between">
                        <div className="flex items-center gap-3 md:col-span-5 w-full">
                          <button
                            onClick={() => toggleItem(item.id)}
                            className="focus:outline-none transition-transform active:scale-90 shrink-0"
                          >
                            {item.bought ? (
                              <CheckCircle2 size={24} className="text-primary fill-primary/10" />
                            ) : (
                              <Circle size={24} className="text-slate-300 dark:text-text-secondary hover:text-primary transition-colors" />
                            )}
                          </button>
                          <div className="flex flex-col flex-1 min-w-0 mr-2">
                            <span className={`font-bold text-sm md:text-base uppercase tracking-tight truncate transition-all ${item.bought ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-white'}`}>
                              {item.name}
                            </span>
                            <span className="text-slate-400 dark:text-text-secondary text-[10px] md:text-xs truncate">{item.category}</span>
                          </div>
                        </div>

                        {/* Botão de Excluir Mobile (Visível no topo direito) */}
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="md:hidden p-2 -mr-2 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>

                      {/* Linha Inferior Mobile / Coluna 3 e 4 Desktop */}
                      <div className="flex items-center justify-between w-full md:col-span-7 md:justify-end gap-3 md:gap-6 pl-9 md:pl-0">
                        <div className="flex items-center gap-3 ml-auto md:ml-0">
                          {/* Seletor de Quantidade */}
                          <div className="flex items-center bg-slate-100 dark:bg-black/40 rounded-full border border-gray-200 dark:border-border-green/50 overflow-hidden h-9 md:h-10 shrink-0 shadow-inner">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-8 md:w-9 h-full hover:bg-white/50 dark:hover:bg-white/10 text-slate-500 dark:text-text-secondary hover:text-slate-900 dark:hover:text-white transition-colors flex items-center justify-center"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-8 md:w-10 text-center text-xs md:text-sm font-bold text-slate-900 dark:text-white whitespace-nowrap">{item.quantity}x</span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-8 md:w-9 h-full hover:bg-white/50 dark:hover:bg-white/10 text-slate-500 dark:text-text-secondary hover:text-slate-900 dark:hover:text-white transition-colors flex items-center justify-center"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          {/* Campo de Preço */}
                          <div className="relative">
                            <div className="flex items-center gap-1 bg-slate-100 dark:bg-black/20 rounded-lg px-2 md:px-3 h-9 md:h-10 border border-transparent focus-within:border-primary/50 transition-colors shadow-inner w-24 md:w-auto">
                              <span className="text-xs font-bold text-slate-400 dark:text-text-secondary">R$</span>
                              <input
                                type="text"
                                className="bg-transparent border-none p-0 w-full text-right text-sm font-bold text-slate-900 dark:text-white focus:ring-0 outline-none"
                                defaultValue={item.unitPrice.toFixed(2).replace('.', ',')}
                                onBlur={(e) => updatePrice(item.id, e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                              />
                            </div>
                            <div className="absolute top-full right-0 md:left-1/2 md:-translate-x-1/2 text-[10px] text-slate-400 dark:text-text-secondary font-bold whitespace-nowrap mt-1 leading-none">
                              Total: {formatCurrency(item.unitPrice * item.quantity)}
                            </div>
                          </div>
                        </div>

                        {/* Botão Excluir Desktop */}
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="hidden md:block p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Finalize Purchase Button - Shopping Mode */}
            {isShoppingMode && items.filter(i => i.bought).length > 0 && (
              <div className="mt-6 p-6 bg-primary/5 border-2 border-primary/20 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Pronto para finalizar?</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {items.filter(i => i.bought).length} itens marcados • {formatCurrency(items.filter(i => i.bought).reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0))}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleFinalizeClick}
                  className="w-full h-14 bg-primary hover:bg-green-400 text-background-dark font-bold rounded-full transition-all active:scale-95 shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                >
                  <Check size={20} />
                  Finalizar Compra
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ListDetails;
