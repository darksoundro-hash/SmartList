
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout } from '../components/Layout';
import {
  TrendingUp,
  ShoppingBasket,
  Search,
  Bell,
  PlusCircle,
  Clock,
  Edit,
  LayoutGrid,
  List as ListIcon
} from 'lucide-react';
import { GroceryList } from '../types';
import { supabase } from '../SmartList/services/src/lib/supabase';

const GROCERY_IMAGES = [
  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800', // Market fruit
  'https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&q=80&w=800', // Produce
  'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=800', // Fresh produce
  'https://images.unsplash.com/photo-1601004869352-7440d0f83ce6?auto=format&fit=crop&q=80&w=800', // Fruits
  'https://images.unsplash.com/photo-1597393312915-1fb688abec81?auto=format&fit=crop&q=80&w=800', // Veggies 2
  'https://images.unsplash.com/photo-1543168256-418811576931?auto=format&fit=crop&q=80&w=800', // Grocery bag
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [lists, setLists] = useState<GroceryList[]>([]);
  const [userName, setUserName] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const activePage = location.pathname.includes('/lists') ? 'lists' : 'dashboard';

  useEffect(() => {
    fetchLists();
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
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

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
    <Layout activePage={activePage}>
      <header className="h-20 md:h-24 flex items-center justify-between px-4 md:px-6 lg:px-10 border-b border-gray-200 dark:border-white/5 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md sticky top-0 z-20 md:pl-20 lg:pl-0">
        <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">Minhas Listas</h2>
        <div className="flex items-center gap-3 md:gap-4">
          <label className="hidden md:flex items-center bg-slate-100 dark:bg-surface-dark rounded-full px-4 h-11 w-64 lg:w-80 border border-transparent focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all cursor-text group">
            <Search size={18} className="text-slate-400 group-hover:text-primary" />
            <input className="bg-transparent border-none focus:ring-0 text-sm w-full ml-2 placeholder-slate-500 dark:placeholder-slate-400 dark:text-white" placeholder="Buscar listas..." type="text" />
          </label>
          <div className="h-8 w-px bg-gray-300 dark:bg-white/10 mx-2 hidden md:block"></div>
          <button className="size-11 md:size-12 rounded-full bg-slate-100 dark:bg-surface-dark border border-transparent hover:border-primary/50 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-all relative group min-h-[44px] min-w-[44px]">
            <Bell size={20} className="group-hover:text-primary" />
            <span className="absolute top-2.5 right-2.5 md:top-3 md:right-3.5 size-2 bg-primary rounded-full ring-2 ring-white dark:ring-surface-dark"></span>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-10 space-y-8 md:space-y-10 pb-20 md:pb-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              Boa noite, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-green-400">{userName || 'Usuário'}</span>
            </h1>
            <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 max-w-xl">
              Gerencie suas compras com eficiência e inteligência.
            </p>
          </div>
          <button 
            onClick={() => navigate('/create-list')} 
            className="bg-primary hover:bg-[#0fdc50] text-background-dark h-14 md:h-16 px-6 md:px-8 rounded-full font-bold flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-[0_8px_20px_-6px_rgba(19,236,91,0.4)] whitespace-nowrap min-h-[56px] text-base md:text-lg"
          >
            <PlusCircle size={22} className="md:w-6 md:h-6" />
            Criar Nova Lista
          </button>
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          <div className="bg-white dark:bg-surface-dark p-5 md:p-6 rounded-2xl md:rounded-[2rem] flex flex-col justify-between min-h-[160px] md:min-h-[180px] relative overflow-hidden group hover:ring-1 hover:ring-primary/30 transition-all duration-300 border border-gray-100 dark:border-white/5">
            <div className="absolute -right-6 -top-6 p-6 opacity-5 group-hover:opacity-10 transition-opacity bg-primary rounded-full blur-3xl size-40"></div>
            <div className="flex justify-between items-start z-10">
              <div className="flex flex-col gap-1">
                <span className="text-slate-500 dark:text-slate-400 font-medium text-xs md:text-sm uppercase tracking-wider">Economia Mensal</span>
                <p className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">R$ 850,00</p>
              </div>
              <div className="size-12 md:size-14 rounded-2xl bg-primary/5 flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-[0_0_20px_rgba(19,236,91,0.05)] group-hover:shadow-[0_0_30px_rgba(19,236,91,0.2)]">
                <img src="/assets/economy_premium.png" alt="Economia" className="size-8 md:size-10 object-contain drop-shadow-[0_0_8px_rgba(19,236,91,0.4)]" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
              <p className="text-green-600 dark:text-primary text-sm font-bold flex items-center gap-1.5">
                12% de aumento
                <span className="text-slate-400 dark:text-slate-500 font-normal ml-1">vs mês passado</span>
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-surface-dark p-5 md:p-6 rounded-2xl md:rounded-[2rem] flex flex-col justify-between min-h-[160px] md:min-h-[180px] relative overflow-hidden group hover:ring-1 hover:ring-primary/30 transition-all duration-300 border border-gray-100 dark:border-white/5">
            <div className="absolute -right-6 -top-6 p-6 opacity-5 group-hover:opacity-10 transition-opacity bg-primary rounded-full blur-3xl size-40"></div>
            <div className="flex justify-between items-start z-10">
              <div className="flex flex-col gap-1">
                <span className="text-slate-500 dark:text-slate-400 font-medium text-xs md:text-sm uppercase tracking-wider">Listas Ativas</span>
                <p className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">{lists.length}</p>
              </div>
              <div className="size-12 md:size-14 rounded-2xl bg-primary/5 flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-[0_0_20px_rgba(19,236,91,0.05)] group-hover:shadow-[0_0_30px_rgba(19,236,91,0.2)]">
                <img src="/assets/active_lists_premium.png" alt="Listas" className="size-8 md:size-10 object-contain drop-shadow-[0_0_8px_rgba(19,236,91,0.4)]" />
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4 md:mb-6 gap-4">
            <h3 className="text-lg md:text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              Minhas Listas
              <span className="bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 text-xs px-2 py-0.5 rounded-full">{lists.length}</span>
            </h3>
            <div className="flex bg-white dark:bg-surface-dark p-1 rounded-full border border-gray-100 dark:border-white/5">
              <button
                onClick={() => setViewMode('grid')}
                className={`size-10 md:size-11 flex items-center justify-center rounded-full transition-all min-h-[44px] min-w-[44px] ${viewMode === 'grid' ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 hover:text-primary'}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`size-10 md:size-11 flex items-center justify-center rounded-full transition-all min-h-[44px] min-w-[44px] ${viewMode === 'list' ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 hover:text-primary'}`}
              >
                <ListIcon size={18} />
              </button>
            </div>
          </div>

          <div className={viewMode === 'grid'
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
            : "flex flex-col gap-4"
          }>
            {viewMode === 'grid' && (
              <button 
                onClick={() => navigate('/create-list')} 
                className="group relative flex flex-col items-center justify-center h-[280px] md:h-[340px] rounded-2xl md:rounded-[2rem] border-2 border-dashed border-slate-300 dark:border-white/10 bg-transparent hover:bg-primary/5 hover:border-primary transition-all duration-300 min-h-[280px]"
              >
                <div className="size-16 md:size-20 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4 md:mb-5 group-hover:scale-110 group-hover:bg-primary group-hover:text-background-dark transition-all duration-300 shadow-sm">
                  <PlusCircle size={28} className="md:w-8 md:h-8 text-slate-400 group-hover:text-background-dark" />
                </div>
                <p className="font-bold text-base md:text-lg text-slate-900 dark:text-white group-hover:text-primary transition-colors">Criar Nova Lista</p>
                <p className="text-slate-500 text-sm mt-1">Inicie um novo plano</p>
              </button>
            )}

            {lists.map(list => (
              viewMode === 'grid' ? (
                <div
                  key={list.id}
                  className="group bg-white dark:bg-surface-dark rounded-2xl md:rounded-[2rem] overflow-hidden hover:shadow-2xl hover:shadow-black/10 dark:hover:shadow-black/40 transition-all duration-300 hover:-translate-y-1 flex flex-col h-[280px] md:h-[340px] border border-gray-100 dark:border-white/5 cursor-pointer"
                  onClick={() => navigate(`/list-details/${list.id}`)}
                >
                  <div
                    className="h-32 md:h-40 bg-cover bg-center relative"
                    style={{
                      backgroundImage: `url('${GROCERY_IMAGES[
                        (list.id?.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) || 0) % GROCERY_IMAGES.length
                      ]}')`
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    <div className="absolute top-3 md:top-4 right-3 md:right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="size-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-primary hover:text-black transition-colors min-h-[32px] min-w-[32px]">
                        <Edit size={14} />
                      </button>
                    </div>
                    <div className="absolute bottom-3 md:bottom-4 left-4 md:left-5 text-white">
                      <h4 className="font-bold text-lg md:text-xl leading-tight truncate pr-4">{list.name}</h4>
                      <p className="text-xs text-slate-300 mt-1 flex items-center gap-1">
                        <Clock size={12} /> {new Date(list.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 md:p-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-3 md:space-y-4">
                      <div className="flex justify-between items-center text-xs md:text-sm">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Progresso</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {list.items?.filter(i => i.bought).length || 0} / {list.items?.length || 0}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-white/10 rounded-full h-2 md:h-2.5 overflow-hidden">
                        <div className="bg-primary h-full rounded-full shadow-[0_0_10px_rgba(19,236,91,0.5)]" style={{ width: `${calculateProgress(list)}%` }}></div>
                      </div>
                      <div className="flex justify-between items-center text-xs md:text-sm pt-1 border-t border-dashed border-gray-200 dark:border-white/10 mt-2">
                        <span className="text-slate-500 dark:text-slate-400">Total Lista</span>
                        <span className="font-bold text-slate-900 dark:text-white">R$ {calculateTotal(list).toFixed(2).replace('.', ',')}</span>
                      </div>
                    </div>
                    <button className="w-full mt-3 md:mt-4 py-2.5 md:py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 font-semibold text-xs md:text-sm hover:bg-slate-100 dark:hover:bg-white/10 group-hover:bg-primary group-hover:border-primary group-hover:text-background-dark transition-all min-h-[44px]">
                      Ver Detalhes
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  key={list.id}
                  className="group bg-white dark:bg-surface-dark rounded-2xl p-4 md:p-5 flex items-center gap-4 hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-white/5 cursor-pointer min-h-[80px]"
                  onClick={() => navigate(`/list-details/${list.id}`)}
                >
                  <div
                    className="size-14 md:size-16 rounded-xl bg-cover bg-center shrink-0"
                    style={{
                      backgroundImage: `url('${GROCERY_IMAGES[
                        (list.id?.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) || 0) % GROCERY_IMAGES.length
                      ]}')`
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-base md:text-lg text-slate-900 dark:text-white truncate">{list.name}</h4>
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
                  <div className="text-right w-20 md:w-24">
                    <p className="text-slate-400 text-[10px] font-bold uppercase">Total</p>
                    <p className="font-black text-sm md:text-base text-slate-900 dark:text-white">R$ {calculateTotal(list).toFixed(2).replace('.', ',')}</p>
                  </div>
                </div>
              )
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Dashboard;
