
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, DollarSign, ListChecks, Sparkles, Loader2, User } from 'lucide-react';
import { supabase } from '../SmartList/services/src/lib/supabase';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const cleanEmail = email.trim();
      const cleanPassword = password.trim();

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword
        });
        if (error) throw error;
        navigate('/dashboard');
      } else {
        const { error, data } = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
          options: {
            data: {
              name: name.trim() || cleanEmail.split('@')[0]
            }
          }
        });
        if (error) throw error;
        if (data.user) {
          alert('Conta criada com sucesso! Verifique seu email para confirmar.');
          setIsLogin(true);
        }
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Erro ao autenticar. Verifique suas credenciais.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    // Implementação futura ou se configurado no Supabase
    alert('Login com Google requer configuração adicional no painel do Supabase.');
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#0b1810] selection:bg-primary selection:text-background-dark overflow-hidden">
      {/* Lado Esquerdo - Branding e Benefícios */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 xl:p-20 overflow-hidden border-r border-white/5">
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 20% 30%, #13ec5b 0%, transparent 50%), radial-gradient(circle at 80% 80%, #13ec5b 0%, transparent 50%)' }}>
        </div>

        <div className="relative z-10 flex items-center gap-3 text-white">
          <div className="size-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary shadow-lg shadow-primary/10">
            <ListChecks size={28} />
          </div>
          <h2 className="text-2xl font-black tracking-tight">SmartList AI</h2>
        </div>

        <div className="relative z-10 flex flex-col gap-10 max-w-xl">
          <div className="space-y-4">
            <h1 className="text-5xl xl:text-7xl font-black leading-[1.1] tracking-tighter text-white">
              Compras de Mercado <br />
              <span className="text-primary italic">Otimizadas por IA.</span>
            </h1>
            <p className="text-text-muted text-lg font-medium leading-relaxed max-w-md opacity-80">
              Junte-se a milhares de compradores inteligentes que gerenciam seu orçamento e otimizam listas com insights de inteligência artificial.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5">
            <div className="flex items-center gap-5 rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all hover:bg-white/10 hover:border-primary/30 group">
              <div className="flex items-center justify-center size-14 rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                <DollarSign size={28} />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Controle Financeiro</h3>
                <p className="text-sm text-text-muted opacity-70">Acompanhe gastos instantaneamente e evite surpresas no caixa.</p>
              </div>
            </div>

            <div className="flex items-center gap-5 rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all hover:bg-white/10 hover:border-primary/30 group">
              <div className="flex items-center justify-center size-14 rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                <Sparkles size={28} />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Listas Inteligentes</h3>
                <p className="text-sm text-text-muted opacity-70">IA organiza seus itens por categoria e sugere produtos faltantes.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-xs font-bold text-text-muted uppercase tracking-[0.3em] opacity-40 italic">© 2024 Smart Grocery Inc.</p>
        </div>
      </div>

      {/* Lado Direito - Formulário */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-12 lg:p-24 relative min-h-screen">
        <div className="w-full max-w-md flex flex-col gap-6 md:gap-8 lg:gap-10">
          {/* Logo Mobile */}
          <div className="lg:hidden flex items-center justify-center gap-3 text-white mb-4">
            <div className="size-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary shadow-lg shadow-primary/10">
              <ListChecks size={28} />
            </div>
            <h2 className="text-xl font-black tracking-tight">SmartList AI</h2>
          </div>

          <div className="self-center lg:self-end bg-white/5 border border-white/10 p-1.5 rounded-full flex w-fit mb-2">
            <button
              onClick={() => setIsLogin(true)}
              className={`px-6 md:px-8 py-2.5 rounded-full font-black text-xs uppercase tracking-widest transition-all min-h-[44px] ${isLogin ? 'bg-primary text-background-dark shadow-xl' : 'text-text-muted hover:text-white'}`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`px-6 md:px-8 py-2.5 rounded-full font-black text-xs uppercase tracking-widest transition-all min-h-[44px] ${!isLogin ? 'bg-primary text-background-dark shadow-xl' : 'text-text-muted hover:text-white'}`}
            >
              Cadastro
            </button>
          </div>

          <div className="flex flex-col gap-2 md:gap-3 text-center lg:text-left">
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}
            </h1>
            <p className="text-sm md:text-base text-text-muted font-medium">
              {isLogin ? 'Entre com seus dados para acessar suas listas.' : 'Comece a economizar no mercado hoje mesmo.'}
            </p>
          </div>

          <div className="flex flex-col gap-5 md:gap-6">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-3 bg-white text-background-dark font-black h-14 md:h-16 rounded-full hover:bg-gray-100 transition-all active:scale-95 disabled:opacity-50 min-h-[56px] text-base md:text-lg"
            >
              <img alt="Google" className="w-5 h-5" src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" />
              <span>Continuar com Google</span>
            </button>

            <div className="flex items-center gap-4 w-full">
              <div className="h-px bg-white/5 flex-1"></div>
              <span className="text-text-muted text-[10px] font-black uppercase tracking-widest opacity-40">OU</span>
              <div className="h-px bg-white/5 flex-1"></div>
            </div>

            <form className="flex flex-col gap-4 md:gap-5" onSubmit={handleAuth}>
              {errorMessage && (
                <div className="p-3 md:p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-bold text-center">
                  {errorMessage}
                </div>
              )}

              {!isLogin && (
                <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <span className="text-white text-[11px] font-black uppercase tracking-widest ml-1 opacity-70">Nome</span>
                  <div className="relative flex items-center group">
                    <User className="absolute left-4 md:left-5 text-text-muted group-focus-within:text-primary transition-colors" size={20} />
                    <input
                      className="w-full h-14 md:h-16 bg-white/5 border border-white/10 rounded-2xl pl-12 md:pl-14 pr-4 md:pr-6 text-white focus:border-primary/50 focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all placeholder:text-white/10 text-base min-h-[56px]"
                      placeholder="Seu nome"
                      type="text"
                      required={!isLogin}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <span className="text-white text-[11px] font-black uppercase tracking-widest ml-1 opacity-70">E-mail</span>
                <div className="relative flex items-center group">
                  <Mail className="absolute left-4 md:left-5 text-text-muted group-focus-within:text-primary transition-colors" size={20} />
                  <input
                    className="w-full h-14 md:h-16 bg-white/5 border border-white/10 rounded-2xl pl-12 md:pl-14 pr-4 md:pr-6 text-white focus:border-primary/50 focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all placeholder:text-white/10 text-base min-h-[56px]"
                    placeholder="nome@exemplo.com"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center ml-1">
                  <span className="text-white text-[11px] font-black uppercase tracking-widest opacity-70">Senha</span>
                  {isLogin && (
                    <a className="text-primary text-[11px] font-black uppercase tracking-widest hover:underline" href="#">Esqueceu?</a>
                  )}
                </div>
                <div className="relative flex items-center group">
                  <Lock className="absolute left-4 md:left-5 text-text-muted group-focus-within:text-primary transition-colors" size={20} />
                  <input
                    className="w-full h-14 md:h-16 bg-white/5 border border-white/10 rounded-2xl pl-12 md:pl-14 pr-4 md:pr-6 text-white focus:border-primary/50 focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all placeholder:text-white/10 text-base min-h-[56px]"
                    placeholder="Sua senha"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-background-dark h-16 md:h-20 rounded-full font-black text-base md:text-lg hover:bg-[#0fdc53] hover:shadow-[0_0_30px_rgba(19,236,91,0.3)] transition-all transform active:scale-[0.97] mt-2 md:mt-4 flex items-center justify-center gap-3 group relative overflow-hidden min-h-[64px]"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <>
                    <span>{isLogin ? 'Entrar' : 'Criar Conta'}</span>
                    <ArrowRight size={22} className="md:w-6 md:h-6 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-text-muted text-sm md:text-base font-medium">
              {isLogin ? 'Não tem uma conta?' : 'Já possui uma conta?'} {' '}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary font-black hover:underline transition-all min-h-[44px] px-2"
              >
                {isLogin ? 'Cadastre-se agora' : 'Faça login aqui'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
