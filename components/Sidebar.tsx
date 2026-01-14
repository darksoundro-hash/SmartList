
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  History,
  BarChart3,
  Settings,
  ShoppingCart,
  Plus,
  ChevronDown,
  User,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { UserProfile } from '../types';
import { supabase } from '../SmartList/services/src/lib/supabase';

interface SidebarProps {
  activePage: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    avatarUrl: '',
    isPremium: false
  });

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile({
          name: profileData.name || 'Usuário',
          email: user.email || '',
          avatarUrl: profileData.avatar_url || '',
          isPremium: profileData.is_premium || false
        });
      }
    }
  };

  useEffect(() => {
    loadProfile();
    window.addEventListener('storage', loadProfile);
    return () => window.removeEventListener('storage', loadProfile);
  }, []);

  // Fechar menu mobile ao clicar em um link
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevenir scroll do body quando menu mobile está aberto
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Painel', path: '/dashboard' },
    { id: 'lists', icon: ClipboardList, label: 'Minhas Listas', path: '/lists' },
    { id: 'history', icon: History, label: 'Histórico', path: '/history' },
    { id: 'finances', icon: BarChart3, label: 'Finanças', path: '/finances' },
    { id: 'settings', icon: Settings, label: 'Perfil', path: '/profile' },
  ];

  const SidebarContent = () => (
    <>
      <div className="h-20 flex items-center justify-between px-4 md:px-6 lg:px-8 border-b border-gray-200 dark:border-white/5">
        <Link to="/dashboard" className="flex items-center gap-3" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="size-10 bg-primary rounded-xl flex items-center justify-center text-background-dark shadow-lg shadow-primary/20">
            <ShoppingCart size={24} fill="currentColor" />
          </div>
          <span className="hidden sm:block text-lg md:text-xl font-bold tracking-tight text-slate-900 dark:text-white">SmartList</span>
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="md:hidden size-10 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-colors min-h-[44px] min-w-[44px]"
          aria-label="Fechar menu"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 px-3 md:px-4 lg:px-6 space-y-1.5 md:space-y-2 py-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activePage === item.id;
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 md:gap-4 px-3 md:px-4 py-3 md:py-3.5 rounded-xl transition-all relative overflow-hidden group min-h-[48px] ${isActive
                ? 'bg-primary/10 text-primary dark:text-primary'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
            >
              <Icon size={22} className={isActive ? 'text-primary' : 'group-hover:text-primary transition-colors flex-shrink-0'} />
              <span className="font-medium text-base">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 md:px-6 mb-4">
        <Link 
          to="/create-list" 
          onClick={() => setIsMobileMenuOpen(false)}
          className="flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full h-12 md:h-14 px-4 bg-primary text-background-dark text-sm md:text-base font-bold hover:bg-green-400 transition-colors shadow-lg shadow-primary/20 min-h-[48px]"
        >
          <Plus size={20} />
          <span className="truncate">Nova Lista</span>
        </Link>
      </div>

      <div className="p-4 md:p-6 mt-auto border-t border-gray-200 dark:border-white/5">
        <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-surface-dark rounded-2xl border border-transparent dark:border-white/5 hover:border-primary/30 transition-colors group">
          <div
            onClick={() => {
              navigate('/profile');
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center gap-3 flex-1 cursor-pointer min-w-0"
          >
            <div className="size-10 md:size-11 rounded-full bg-cover bg-center ring-2 ring-white dark:ring-white/10 flex-shrink-0" style={{ backgroundImage: `url('${profile.avatarUrl || `https://ui-avatars.com/api/?name=${profile.name || 'U'}&background=13ec5b&color=0b1810`}')` }}></div>
            <div className="flex flex-col overflow-hidden min-w-0 flex-1">
              <p className="text-sm font-bold truncate text-slate-900 dark:text-white group-hover:text-primary transition-colors">{profile.name || 'Usuário'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{profile.isPremium ? 'Usuário Premium' : 'Usuário Free'}</p>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Deseja realmente sair da conta?')) {
                supabase.auth.signOut();
                navigate('/');
                setIsMobileMenuOpen(false);
              }
            }}
            className="hidden lg:flex p-2 text-slate-400 hover:text-red-500 hover:bg-white/50 dark:hover:bg-black/20 rounded-lg transition-all ml-1 flex-shrink-0 min-h-[44px] min-w-[44px]"
            title="Sair da conta"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </>
  );

  console.log("isMobileMenuOpen (outside SidebarContent):", isMobileMenuOpen);

  return (
    <>
      {/* Botão Hambúrguer para Mobile */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="md:hidden fixed top-4 left-4 z-[60] size-12 rounded-xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/5 flex items-center justify-center text-slate-700 dark:text-white shadow-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors min-h-[48px] min-w-[48px] active:scale-95"
        aria-label="Abrir menu"
      >
        <Menu size={24} />
      </button>

      {/* Overlay para Mobile */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] animate-in fade-in duration-200"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-20 lg:w-72 flex-col border-r border-gray-200 dark:border-white/5 bg-white dark:bg-background-dark sticky top-0 h-screen z-30 transition-all duration-300 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Sidebar Mobile (Drawer) */}
      <aside
        className={`md:hidden fixed top-0 left-0 h-full w-80 max-w-[85vw] flex-col border-r border-gray-200 dark:border-white/5 bg-white dark:bg-background-dark z-[60] transition-transform duration-300 ease-out shadow-2xl ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>
    </>
  );
};
