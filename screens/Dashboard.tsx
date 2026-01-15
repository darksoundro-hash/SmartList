import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, useMobileMenu } from '../components/Layout';
import {
  TrendingUp,
  ShoppingBasket,
  Search,
  Bell,
  PlusCircle,
  Clock,
  Edit,
  LayoutGrid,
  List as ListIcon,
  Menu,
  X,
  Check
} from 'lucide-react';
import { DashboardSkeleton } from '../components/Skeleton';
import { useToast } from '../components/ToastContext';
import { GroceryList, Notification } from '../types';
import { supabase } from '../SmartList/services/src/lib/supabase';

// Card background image is now handled via static asset
const CARD_BG_IMAGE = '/assets/card_bg.png';


const DashboardContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { openMobileMenu } = useMobileMenu();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [lists, setLists] = useState<GroceryList[]>([]);
  const [userName, setUserName] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Notification State
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', title: 'Bem-vindo!', message: 'Comece criando sua primeira lista de compras inteligente.', time: 'Agora', read: false, type: 'info' },
    { id: '2', title: 'Dica de Economia', message: 'Produtos da estação estão 20% mais baratos esta semana.', time: '2h atrás', read: false, type: 'success' },
    { id: '3', title: 'Meta Atingida', message: 'Parabéns! Você se manteve no orçamento em sua última compra.', time: '1d atrás', read: true, type: 'info' }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.notification-dropdown') && !target.closest('.notification-trigger')) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showNotifications]);

  useEffect(() => {
    fetchLists();
    // Welcome toast
    setTimeout(() => {
      addToast('Bem-vindo de volta! 👋', 'success');
    }, 1500);
  }, []);

  const fetchLists = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return; // Or redirect to login

      const { data, error } = await supabase
        .from('grocery_lists')
        .select(`
          *,
          items:grocery_items(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        // Simulate a small delay for the skeleton effect to be visible and premium feeling
        await new Promise(resolve => setTimeout(resolve, 800));

        const mappedLists: GroceryList[] = data.map((list: any) => ({
          id: list.id,
          name: list.name,
          store: list.store || '',
          createdAt: list.created_at,
          shoppingDate: list.shopping_date,
          maxBudget: list.max_budget,
          items: (list.items || []).map((item: any) => ({
            id: item.id,
            name: item.name,
            category: item.category,
            quantity: item.quantity,
            unitPrice: item.unit_price,
            bought: item.bought,
            aisle: item.aisle,
            imageUrl: item.image_url
          })),
          progress: 0,
          estimatedTotal: 0
        }));
        setLists(mappedLists);
      }

      // Fetch user name with retry (in case trigger is slightly slow)
      let profile = null;
      for (let i = 0; i < 3; i++) {
        const { data } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .single();
        if (data) {
          profile = data;
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      if (profile) {
        setUserName(profile.name || '');
      }
      console.error('Error fetching dashboard data:', error);
      addToast('Erro ao carregar seus dados.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <header className="h-20 lg:h-24 flex items-center justify-between px-4 lg:px-10 border-b border-gray-200 dark:border-white/5 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4 md:hidden">
            <button
              onClick={openMobileMenu}
              className="size-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
            >
              <Menu size={20} />
            </button>
            <span className="text-lg font-bold text-slate-900 dark:text-white">SmartList</span>
          </div>
        </header>
        <DashboardSkeleton />
      </>
    );
  }

  const calculateProgress = (list: GroceryList) => {
    if (!list.items || list.items.length === 0) return 0;
    const boughtCount = list.items.filter(i => i.bought).length;
    return (boughtCount / list.items.length) * 100;
  };

  const calculateTotal = (list: GroceryList) => {
    if (!list.items) return 0;
    return list.items.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
  };

  return (
    <>
      <header className="h-20 lg:h-24 flex items-center justify-between px-4 lg:px-10 border-b border-gray-200 dark:border-white/5 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-4 md:hidden">
          <button
            onClick={openMobileMenu}
            className="size-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
          >
            <Menu size={20} />
          </button>
          <span className="text-lg font-bold text-slate-900 dark:text-white">SmartList</span>
        </div>
        <h2 className="text-xl font-bold hidden md:block opacity-0 lg:opacity-100 text-slate-900 dark:text-white">Minhas Listas</h2>
        <div className="flex items-center gap-4 flex-1 md:flex-none justify-end">
          <label className="hidden md:flex items-center bg-slate-100 dark:bg-surface-dark rounded-full px-4 h-11 w-64 lg:w-80 border border-transparent focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all cursor-text group">
            <Search size={18} className="text-slate-400 group-hover:text-primary" />
            <input className="bg-transparent border-none focus:ring-0 text-sm w-full ml-2 placeholder-slate-500 dark:placeholder-slate-400 dark:text-white" placeholder="Buscar listas..." type="text" />
          </label>
          <div className="h-8 w-px bg-gray-300 dark:bg-white/10 mx-2 hidden md:block"></div>

          {/* Notification Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="notification-trigger size-11 rounded-full bg-slate-100 dark:bg-surface-dark border border-transparent hover:border-primary/50 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-all relative group"
            >
              <Bell size={20} className="group-hover:text-primary" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2.5 size-2.5 bg-primary rounded-full ring-2 ring-white dark:ring-surface-dark animate-pulse"></span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="notification-dropdown absolute right-0 top-14 w-80 md:w-96 bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200 z-50">
                <div className="p-4 border-b border-gray-200 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-black/20">
                  <h3 className="font-bold text-slate-900 dark:text-white">Notificações</h3>
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
                      Marcar todas como lidas
                    </button>
                  )}
                </div>
                <div className="max-h-[60vh] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                      Nenhuma notificação no momento.
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      {notifications.map(notification => (
                        <div
                          key={notification.id}
                          onClick={() => markAsRead(notification.id, {} as any)}
                          className={`p-4 border-b border-gray-100 dark:border-white/5 last:border-0 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer relative group ${!notification.read ? 'bg-primary/5' : ''}`}
                        >
                          <div className="flex gap-3">
                            <div className={`mt-1 size-2 rounded-full shrink-0 ${!notification.read ? 'bg-primary' : 'bg-transparent'}`}></div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-1">
                                <h4 className={`text-sm ${!notification.read ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-600 dark:text-slate-300'}`}>{notification.title}</h4>
                                <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">{notification.time}</span>
                              </div>
                              <p className={`text-xs ${!notification.read ? 'text-slate-700 dark:text-slate-200' : 'text-slate-500 dark:text-slate-500'} leading-relaxed`}>{notification.message}</p>
                            </div>
                            <div className="flex flex-col items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => removeNotification(notification.id, e)}
                                className="p-1 hover:bg-red-100 dark:hover:bg-red-500/20 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                              >
                                <X size={14} />
                              </button>
                              {!notification.read && (
                                <button
                                  onClick={(e) => markAsRead(notification.id, e)}
                                  className="p-1 hover:bg-primary/20 text-primary rounded-lg transition-colors"
                                  title="Marcar como lida"
                                >
                                  <Check size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 lg:p-10 space-y-8 lg:space-y-10 pb-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              Boa noite, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-green-400">{userName || 'Usuário'}</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg max-w-xl">
              Gerencie suas compras com eficiência e inteligência.
            </p>
          </div>
          <button onClick={() => navigate('/create-list')} className="bg-primary hover:bg-[#0fdc50] text-background-dark h-12 md:h-14 px-8 rounded-full font-bold flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-[0_8px_20px_-6px_rgba(19,236,91,0.4)] whitespace-nowrap w-full md:w-auto">
            <PlusCircle size={24} />
            Criar Nova Lista
          </button>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="bg-white dark:bg-surface-dark p-6 rounded-[2rem] flex flex-col justify-between min-h-[160px] md:min-h-[180px] relative overflow-hidden group hover:ring-1 hover:ring-primary/30 transition-all duration-300 border border-gray-100 dark:border-white/5">
            <div className="absolute -right-6 -top-6 p-6 opacity-5 group-hover:opacity-10 transition-opacity bg-primary rounded-full blur-3xl size-40"></div>
            <div className="flex justify-between items-start z-10">
              <div className="flex flex-col gap-1">
                <span className="text-slate-500 dark:text-slate-400 font-medium text-sm uppercase tracking-wider">Economia Mensal</span>
                <p className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">R$ 850,00</p>
              </div>
              <div className="size-14 rounded-2xl bg-primary/5 flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-[0_0_20px_rgba(19,236,91,0.05)] group-hover:shadow-[0_0_30px_rgba(19,236,91,0.2)]">
                <img src="/assets/economy_premium.png" alt="Economia" className="size-10 object-contain drop-shadow-[0_0_8px_rgba(19,236,91,0.4)]" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
              <p className="text-green-600 dark:text-primary text-sm font-bold flex items-center gap-1.5">
                12% de aumento
                <span className="text-slate-400 dark:text-slate-500 font-normal ml-1">vs mês passado</span>
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-surface-dark p-6 rounded-[2rem] flex flex-col justify-between min-h-[160px] md:min-h-[180px] relative overflow-hidden group hover:ring-1 hover:ring-primary/30 transition-all duration-300 border border-gray-100 dark:border-white/5">
            <div className="absolute -right-6 -top-6 p-6 opacity-5 group-hover:opacity-10 transition-opacity bg-primary rounded-full blur-3xl size-40"></div>
            <div className="flex justify-between items-start z-10">
              <div className="flex flex-col gap-1">
                <span className="text-slate-500 dark:text-slate-400 font-medium text-sm uppercase tracking-wider">Listas Ativas</span>
                <p className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">{lists.length}</p>
              </div>
              <div className="size-14 rounded-2xl bg-primary/5 flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-[0_0_20px_rgba(19,236,91,0.05)] group-hover:shadow-[0_0_30px_rgba(19,236,91,0.2)]">
                <img src="/assets/active_lists_premium.png" alt="Listas" className="size-10 object-contain drop-shadow-[0_0_8px_rgba(19,236,91,0.4)]" />
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              Minhas Listas
              <span className="bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 text-xs px-2 py-0.5 rounded-full">{lists.length}</span>
            </h3>
            <div className="flex bg-white dark:bg-surface-dark p-1 rounded-full border border-gray-100 dark:border-white/5">
              <button
                onClick={() => setViewMode('grid')}
                className={`size-9 flex items-center justify-center rounded-full transition-all ${viewMode === 'grid' ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 hover:text-primary'}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`size-9 flex items-center justify-center rounded-full transition-all ${viewMode === 'list' ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 hover:text-primary'}`}
              >
                <ListIcon size={18} />
              </button>
            </div>
          </div>

          <div className={viewMode === 'grid'
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "flex flex-col gap-4"
          }>
            {viewMode === 'grid' && (
              <button onClick={() => navigate('/create-list')} className="group relative flex flex-col items-center justify-center h-[340px] rounded-[2rem] border-2 border-dashed border-slate-300 dark:border-white/10 bg-transparent hover:bg-primary/5 hover:border-primary transition-all duration-300 min-h-[300px]">
                <div className="size-20 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-primary group-hover:text-background-dark transition-all duration-300 shadow-sm">
                  <PlusCircle size={32} className="text-slate-400 group-hover:text-background-dark" />
                </div>
                <p className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-primary transition-colors">Criar Nova Lista</p>
                <p className="text-slate-500 text-sm mt-1">Inicie um novo plano</p>
              </button>
            )}

            {lists.map(list => (
              viewMode === 'grid' ? (
                <div
                  key={list.id}
                  className="group bg-white dark:bg-surface-dark rounded-[2rem] overflow-hidden hover:shadow-2xl hover:shadow-black/10 dark:hover:shadow-black/40 transition-all duration-300 hover:-translate-y-1 flex flex-col h-[340px] border border-gray-100 dark:border-white/5 cursor-pointer min-h-[300px]"
                  onClick={() => navigate(`/list-details/${list.id}`)}
                >
                  <div
                    className="h-40 bg-cover bg-center relative"
                    style={{
                      backgroundImage: `url('${CARD_BG_IMAGE}')`

                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    <div className="absolute top-4 right-4 z-10 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="size-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-primary hover:text-black transition-colors">
                        <Edit size={14} />
                      </button>
                    </div>
                    <div className="absolute bottom-4 left-5 text-white">
                      <h4 className="font-bold text-xl leading-tight truncate pr-4">{list.name}</h4>
                      <p className="text-xs text-slate-300 mt-1 flex items-center gap-1">
                        <Clock size={12} /> {new Date(list.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Progresso</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {list.items?.filter(i => i.bought).length || 0} / {list.items?.length || 0}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-white/10 rounded-full h-2.5 overflow-hidden">
                        <div className="bg-primary h-full rounded-full shadow-[0_0_10px_rgba(19,236,91,0.5)]" style={{ width: `${calculateProgress(list)}%` }}></div>
                      </div>
                      <div className="flex justify-between items-center text-sm pt-1 border-t border-dashed border-gray-200 dark:border-white/10 mt-2">
                        <span className="text-slate-500 dark:text-slate-400">Total Lista</span>
                        <span className="font-bold text-slate-900 dark:text-white">R$ {calculateTotal(list).toFixed(2).replace('.', ',')}</span>
                      </div>
                    </div>
                    <button className="w-full mt-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-white/10 group-hover:bg-primary group-hover:border-primary group-hover:text-background-dark transition-all">
                      Ver Detalhes
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  key={list.id}
                  className="group bg-white dark:bg-surface-dark rounded-2xl p-4 flex items-center gap-4 hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-white/5 cursor-pointer"
                  onClick={() => navigate(`/list-details/${list.id}`)}
                >
                  <div
                    className="size-16 rounded-xl bg-cover bg-center shrink-0"
                    style={{
                      backgroundImage: `url('${CARD_BG_IMAGE}')`

                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 dark:text-white truncate">{list.name}</h4>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1"><Clock size={12} /> {new Date(list.createdAt).toLocaleDateString('pt-BR')}</span>
                      <span className="size-1 rounded-full bg-slate-300 dark:bg-white/10"></span>
                      <span>{list.items?.length || 0} itens</span>
                    </div>
                  </div>
                  <div className="hidden md:flex flex-col items-end gap-2 w-48">
                    <div className="flex justify-between w-full text-[10px] font-bold uppercase tracking-wider">
                      <span className="text-slate-400">Progresso</span>
                      <span className="text-primary">{Math.round(calculateProgress(list))}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: `${calculateProgress(list)}%` }}></div>
                    </div>
                  </div>
                  <div className="text-right w-24">
                    <p className="text-slate-400 text-[10px] font-bold uppercase">Total</p>
                    <p className="font-black text-slate-900 dark:text-white">R$ {calculateTotal(list).toFixed(2).replace('.', ',')}</p>
                  </div>
                </div>
              )
            ))}
          </div>
        </section>
      </div>
    </>
  );
};

const Dashboard: React.FC = () => {
  const location = useLocation();
  const activePage = location.pathname.includes('/lists') ? 'lists' : 'dashboard';

  return (
    <Layout activePage={activePage}>
      <DashboardContent />
    </Layout>
  );
};

export default Dashboard;
