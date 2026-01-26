import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../SmartList/services/src/lib/supabase';
import { Sidebar } from '../components/Sidebar';
import { Shield, Users, Activity, Database, ShoppingBasket } from 'lucide-react';

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [stats, setStats] = useState({
        usersCount: 0,
        listsCount: 0,
        itemsCount: 0
    });

    useEffect(() => {
        checkAdminAccess();
    }, []);

    const checkAdminAccess = async () => {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user || user.email !== 'joao69.pvh@gmail.com') {
            navigate('/dashboard');
            return;
        }

        setIsAdmin(true);
        fetchStats();
    };

    const fetchStats = async () => {
        try {
            // Fetch users count
            const { count: usersCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });

            // Fetch lists count
            const { count: listsCount } = await supabase
                .from('grocery_lists')
                .select('*', { count: 'exact', head: true });

            // Fetch items count
            const { count: itemsCount } = await supabase
                .from('grocery_items')
                .select('*', { count: 'exact', head: true });

            setStats({
                usersCount: usersCount || 0,
                listsCount: listsCount || 0,
                itemsCount: itemsCount || 0
            });
        } catch (error) {
            console.error('Error fetching admin stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-background-dark">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isAdmin) return null;

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-background-dark transition-colors duration-200">
            <Sidebar activePage="admin" isMobileMenuOpen={false} setIsMobileMenuOpen={() => { }} />

            <main className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="mx-auto max-w-7xl">
                    <header className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                            <Shield className="text-primary" size={32} />
                            Painel do Administrador
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">
                            Controle total e estatísticas em tempo real do sistema.
                        </p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Stats Card 1 */}
                        <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-blue-100 dark:bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
                                    <Users size={24} />
                                </div>
                            </div>
                            <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{stats.usersCount}</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Usuários Cadastrados</p>
                        </div>

                        {/* Stats Card 2 */}
                        <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-purple-100 dark:bg-purple-500/10 rounded-xl text-purple-600 dark:text-purple-400">
                                    <Activity size={24} />
                                </div>
                            </div>
                            <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{stats.listsCount}</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Listas Criadas</p>
                        </div>

                        {/* Stats Card 3 */}
                        <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-orange-100 dark:bg-orange-500/10 rounded-xl text-orange-600 dark:text-orange-400">
                                    <ShoppingBasket size={24} />
                                </div>
                            </div>
                            <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{stats.itemsCount}</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Itens Adicionados</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4">Ações do Sistema</h3>
                            <div className="space-y-3">
                                <button className="w-full p-3 text-left rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-slate-600 dark:text-slate-300 font-medium flex items-center gap-3">
                                    <Users size={18} />
                                    Gerenciar Usuários (Em breve)
                                </button>
                                <button className="w-full p-3 text-left rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-slate-600 dark:text-slate-300 font-medium flex items-center gap-3">
                                    <Database size={18} />
                                    Backup (Em breve)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
