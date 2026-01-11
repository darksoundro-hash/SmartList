
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import {
  User,
  Mail,
  Camera,
  Check,
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  LogOut,
  Sparkles,
  Upload
} from 'lucide-react';
import { UserProfile } from '../types';
import { supabase } from '../SmartList/services/src/lib/supabase';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    avatarUrl: '',
    isPremium: true
  });
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/');
        return;
      }

      // Initial state from auth
      setProfile(prev => ({ ...prev, email: user.email || '' }));

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfile(prev => ({
          ...prev,
          name: data.name || '',
          avatarUrl: data.avatar_url || '',
        }));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user');

      const { error } = await supabase
        .from('profiles')
        .update({
          name: profile.name,
          avatar_url: profile.avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update successful
      setTimeout(() => {
        setIsSaved(false);
        navigate('/dashboard');
      }, 1000);

    } catch (err) {
      console.error('Error saving profile:', err);
      alert('Erro ao salvar perfil.');
      setIsSaved(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Limit file size to avoid DB issues?
      if (file.size > 2 * 1024 * 1024) { // 2MB
        alert('Arquivo muito grande. Máximo 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfile({ ...profile, avatarUrl: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleLogout = async () => {
    if (confirm("Deseja realmente sair da conta?")) {
      await supabase.auth.signOut();
      navigate('/');
    }
  };

  return (
    <Layout activePage="settings">
      <header className="h-20 flex items-center justify-between px-6 lg:px-10 border-b border-gray-200 dark:border-white/5 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="size-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all text-slate-700 dark:text-white"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Meu Perfil</h1>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
          <Sparkles size={16} className="text-primary" />
          <span className="text-xs font-bold text-primary uppercase">Conta Premium Ativa</span>
        </div>
      </header>

      <div className="flex-1 p-6 lg:p-12 max-w-4xl mx-auto w-full space-y-12 pb-20 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
        ) : (
          <>
            {/* Header do Perfil com Upload de Foto */}
            <div className="flex flex-col items-center md:flex-row gap-8 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="relative group cursor-pointer" onClick={triggerFileInput}>
                <div
                  className="size-32 md:size-40 rounded-full bg-cover bg-center border-4 border-primary shadow-2xl transition-transform duration-300 group-hover:scale-105 overflow-hidden bg-slate-200 dark:bg-slate-800"
                  style={{ backgroundImage: `url('${profile.avatarUrl || 'https://picsum.photos/200/200'}')` }}
                >
                  {!profile.avatarUrl && (
                    <div className="w-full h-full flex items-center justify-center bg-surface-dark">
                      <User size={64} className="text-text-secondary" />
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity gap-2">
                  <Camera size={32} className="text-white" />
                  <span className="text-[10px] font-bold uppercase text-white">Alterar Foto</span>
                </div>
                {/* Input de arquivo oculto */}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
              <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-2">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white">{profile.name || 'Usuário'}</h2>
                <div className="flex items-center gap-2 text-slate-500 dark:text-text-secondary">
                  <Mail size={16} />
                  <span>{profile.email}</span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/5 text-slate-500 dark:text-text-secondary rounded-full text-xs font-bold uppercase tracking-wider mt-2">
                  <ShieldCheck size={14} className="text-primary" />
                  Membro desde Jan 2024
                </div>
              </div>
            </div>

            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white dark:bg-surface-dark p-8 rounded-[2rem] border border-gray-200 dark:border-white/5 shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <User size={120} className="text-primary" />
              </div>

              <div className="flex flex-col gap-3 relative z-10">
                <label className="text-sm font-bold text-slate-500 dark:text-text-secondary uppercase tracking-widest pl-1">Nome de Exibição</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                  <input
                    className="w-full h-14 bg-slate-50 dark:bg-background-dark/50 border border-gray-200 dark:border-white/10 rounded-xl pl-12 pr-4 text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 relative z-10">
                <label className="text-sm font-bold text-slate-500 dark:text-text-secondary uppercase tracking-widest pl-1">E-mail de Contato</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                  <input
                    type="email"
                    value={profile.email}
                    readOnly
                    className="w-full h-14 bg-slate-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl pl-12 pr-4 text-slate-500 dark:text-gray-400 cursor-not-allowed"
                    title="E-mail gerenciado pelo login"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 md:col-span-2 relative z-10">
                <label className="text-sm font-bold text-slate-500 dark:text-text-secondary uppercase tracking-widest pl-1">URL ou Origem da Foto</label>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative group flex-1">
                    <Camera className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                    <input
                      className="w-full h-14 bg-slate-50 dark:bg-background-dark/50 border border-gray-200 dark:border-white/10 rounded-xl pl-12 pr-4 text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none text-xs"
                      type="text"
                      placeholder="Cole um link ou faça upload ao lado..."
                      value={profile.avatarUrl.startsWith('data:') ? 'Imagem carregada localmente' : profile.avatarUrl}
                      onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    className="h-14 px-6 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 group"
                  >
                    <Upload size={20} className="text-primary group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-bold text-slate-700 dark:text-white">Importar Foto</span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-text-secondary px-2 italic">Você pode colar um link direto ou clicar em "Importar Foto" para selecionar um arquivo do seu dispositivo.</p>
              </div>

              <div className="md:col-span-2 pt-4 relative z-10">
                <button
                  type="submit"
                  disabled={isSaved}
                  className={`w-full h-14 rounded-full font-bold flex items-center justify-center gap-3 transition-all ${isSaved ? 'bg-primary text-background-dark scale-95 opacity-80' : 'bg-primary hover:bg-[#0fdc53] text-background-dark shadow-lg shadow-primary/20 active:scale-95'}`}
                >
                  {isSaved ? (
                    <>
                      <Check size={24} />
                      Dados Atualizados!
                    </>
                  ) : (
                    <>
                      <Check size={24} />
                      Salvar Alterações
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Opções Adicionais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-200 dark:border-white/5 flex items-center gap-6 group hover:border-primary/30 transition-all cursor-pointer shadow-sm">
                <div className="size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CreditCard size={28} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Assinatura Premium</h4>
                  <p className="text-sm text-slate-500 dark:text-text-secondary">Próxima renovação: 12/03/2024</p>
                </div>
              </div>

              <div
                onClick={handleLogout}
                className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-200 dark:border-white/5 flex items-center gap-6 group hover:border-red-500/30 transition-all cursor-pointer shadow-sm"
              >
                <div className="size-14 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <LogOut size={28} />
                </div>
                <div>
                  <h4 className="font-bold text-red-500">Sair da Conta</h4>
                  <p className="text-sm text-slate-500 dark:text-text-secondary">Desconectar deste dispositivo</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Profile;
