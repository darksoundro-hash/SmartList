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
  X
} from 'lucide-react';
import { UserProfile } from '../types';
import { supabase } from '../SmartList/services/src/lib/supabase';

interface SidebarProps {
  activePage: string;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
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

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Painel', path: '/dashboard' },
    { id: 'lists', icon: ClipboardList, label: 'Minhas Listas', path: '/lists' },
    { id: 'history', icon: History, label: 'Histórico', path: '/history' },
    { id: 'finances', icon: BarChart3, label: 'Finanças', path: '/finances' },
    { id: 'settings', icon: Settings, label: 'Perfil', path: '/profile' },
  ];

  return (
    <aside className={`
      flex w-72 flex-col border-r border-gray-200 dark:border-white/5 
      bg-white dark:bg-background-dark fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out md:static md:translate-x-0
      ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="h-24 flex items-center justify-between px-6 lg:px-8">
        <Link to="/dashboard" className="flex items-center gap-3" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="size-10 bg-primary rounded-xl flex items-center justify-center text-background-dark shadow-lg shadow-primary/20">
            <ShoppingCart size={24} fill="currentColor" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">SmartList</span>
        </Link>

        {/* Mobile Close Button */}
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="md:hidden size-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-600 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-colors touch-target"
          aria-label="Fechar menu"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 px-3 lg:px-6 space-y-2 py-4">
        {navItems.map((item) => {
          const isActive = activePage === item.id;
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all relative overflow-hidden group min-h-touch ${isActive
                ? 'bg-primary/10 text-primary dark:text-primary'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
            >
              <Icon size={24} className={isActive ? 'text-primary' : 'group-hover:text-primary transition-colors'} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-6 mb-4">
        <Link to="/create-list" className="flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full h-12 px-4 bg-primary text-background-dark text-sm font-bold hover:bg-green-400 transition-colors shadow-lg shadow-primary/20">
          <Plus size={20} />
          <span className="hidden lg:inline truncate">Nova Lista</span>
        </Link>
      </div>

      <div className="p-4 lg:p-6 mt-auto">
        <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-surface-dark rounded-2xl border border-transparent dark:border-white/5 hover:border-primary/30 transition-colors group">
          <div
            onClick={() => navigate('/profile')}
            className="flex items-center gap-3 flex-1 cursor-pointer"
          >
            <div className="size-10 rounded-full bg-cover bg-center ring-2 ring-white dark:ring-white/10" style={{ backgroundImage: `url('${profile.avatarUrl || `https://ui-avatars.com/api/?name=${profile.name || 'U'}&background=13ec5b&color=0b1810`}')` }}></div>
            <div className="hidden lg:flex flex-col overflow-hidden">
              <p className="text-sm font-bold truncate text-slate-900 dark:text-white group-hover:text-primary transition-colors">{profile.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{profile.isPremium ? 'Usuário Premium' : 'Usuário Free'}</p>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Deseja realmente sair da conta?')) navigate('/');
            }}
            className="hidden lg:flex p-2 text-slate-400 hover:text-red-500 hover:bg-white/50 dark:hover:bg-black/20 rounded-lg transition-all ml-1"
            title="Sair da conta"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};
