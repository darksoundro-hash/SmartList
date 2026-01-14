
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Sparkles, Edit, Check, ChevronRight, Calendar } from 'lucide-react';
import { GroceryList } from '../types';
import { getSmartSuggestions } from '../SmartList/services/gemini';
import { supabase } from '../SmartList/services/src/lib/supabase';

const CreateList: React.FC = () => {
  const navigate = useNavigate();
  const [listName, setListName] = useState('');
  const [budget, setBudget] = useState('');
  const [shoppingDate, setShoppingDate] = useState(new Date().toISOString().split('T')[0]);
  const [useAI, setUseAI] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listName.trim() || isLoading) return;

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // 1. Criar a lista
      const { data: listData, error: listError } = await supabase
        .from('grocery_lists')
        .insert({
          user_id: user.id,
          name: listName.toUpperCase(),
          store: "Mercado Principal",
          shopping_date: shoppingDate,
          max_budget: parseFloat(budget) || 0,
          status: 'active'
        })
        .select()
        .single();

      if (listError) throw listError;
      if (!listData) throw new Error('Erro ao criar lista');

      const newListId = listData.id;

      // 2. Gerar e inserir itens se AI estiver ativada
      if (useAI) {
        const suggestions = await getSmartSuggestions(listName);

        const aiItems = suggestions.map((item: any) => ({
          list_id: newListId,
          name: item.name.toUpperCase(),
          category: item.category,
          quantity: 1,
          unit_price: item.estimatedPrice || 0,
          bought: false
        }));

        if (aiItems.length > 0) {
          const { error: itemsError } = await supabase
            .from('grocery_items')
            .insert(aiItems);

          if (itemsError) console.error('Erro ao inserir itens:', itemsError);
        }
      }

      navigate(`/list-details/${newListId}`);
    } catch (error) {
      console.error("Erro ao criar lista:", error);
      alert('Ocorreu um erro ao criar sua lista. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout activePage="lists">
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-green-500/5 to-transparent pointer-events-none"></div>
      <div className="flex-1 px-4 md:px-6 lg:px-12 py-6 md:py-8 max-w-5xl mx-auto w-full flex flex-col overflow-y-auto">
        <div className="flex flex-wrap items-center gap-2 mb-6 md:mb-8 text-xs md:text-sm">
          <Link to="/dashboard" className="text-text-secondary hover:text-primary transition-colors">Painel</Link>
          <ChevronRight size={12} className="md:w-3.5 md:h-3.5 text-gray-600" />
          <span className="text-text-secondary">Minhas Listas</span>
          <ChevronRight size={12} className="md:w-3.5 md:h-3.5 text-gray-600" />
          <span className="text-gray-900 dark:text-white font-medium">Criar Nova Lista</span>
        </div>

        <div className="mb-6 md:mb-10">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-2 md:mb-3">Vamos às compras.</h1>
          <p className="text-base md:text-lg text-text-secondary font-normal max-w-2xl">
            Dê um nome à sua lista e defina um limite de gastos para manter o controle. A IA ajudará você a organizar tudo sem esforço.
          </p>
        </div>

        <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-2xl md:rounded-[2rem] p-5 md:p-8 lg:p-10 shadow-xl shadow-black/5 max-w-3xl w-full relative overflow-hidden group/card">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none group-hover/card:bg-primary/15 transition-all duration-700"></div>
          <form className="flex flex-col gap-6 md:gap-8 relative z-10" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2 md:gap-3">
              <label className="text-gray-900 dark:text-white text-sm md:text-base font-semibold" htmlFor="listName">Nome da Lista</label>
              <div className="relative group">
                <input
                  className="w-full bg-gray-50 dark:bg-[#102216] border border-gray-200 dark:border-border-dark text-gray-900 dark:text-white rounded-xl px-4 md:px-5 h-14 md:h-16 text-base md:text-lg placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none min-h-[56px]"
                  id="listName"
                  placeholder="ex: Compras do Mês, Churrasco FDS"
                  type="text"
                  required
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                />
                <Edit className="absolute right-4 md:right-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors w-4 h-4 md:w-5 md:h-5" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="flex flex-col gap-2 md:gap-3">
                <label className="text-gray-900 dark:text-white text-sm md:text-base font-semibold" htmlFor="budget">Orçamento Máximo <span className="text-text-secondary font-normal text-xs md:text-sm ml-1">(Opcional)</span></label>
                <div className="relative group">
                  <div className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors font-medium text-base md:text-lg">R$</div>
                  <input
                    className="w-full bg-gray-50 dark:bg-[#102216] border border-gray-200 dark:border-border-dark text-gray-900 dark:text-white rounded-xl pl-11 md:pl-12 pr-4 md:pr-5 h-14 md:h-16 text-base md:text-lg placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none min-h-[56px]"
                    id="budget"
                    placeholder="0,00"
                    type="number"
                    step="0.01"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 md:gap-3">
                <label className="text-gray-900 dark:text-white text-sm md:text-base font-semibold" htmlFor="shoppingDate">Data das Compras</label>
                <div className="relative group">
                  <input
                    className="w-full bg-gray-50 dark:bg-[#102216] border border-gray-200 dark:border-border-dark text-gray-900 dark:text-white rounded-xl px-4 md:px-5 h-14 md:h-16 text-base md:text-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none [color-scheme:dark] min-h-[56px]"
                    id="shoppingDate"
                    type="date"
                    required
                    value={shoppingDate}
                    onChange={(e) => setShoppingDate(e.target.value)}
                  />
                  <Calendar className="absolute right-4 md:right-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors pointer-events-none w-4 h-4 md:w-5 md:h-5" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between py-3 md:py-4 px-4 md:px-5 rounded-xl border border-border-light dark:border-border-dark bg-gray-50 dark:bg-[#102216]/50 gap-4">
              <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-gray-900 dark:text-white font-semibold text-sm md:text-base">Sugestões Inteligentes</span>
                  <span className="text-xs text-text-secondary truncate">Usar IA para sugerir itens com base no histórico</span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={useAI}
                  onChange={(e) => setUseAI(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex flex-col-reverse md:flex-row items-stretch md:items-center justify-end gap-3 md:gap-4 mt-4 pt-6 border-t border-gray-100 dark:border-white/5">
              <button 
                onClick={() => navigate(-1)} 
                className="w-full md:w-auto px-6 md:px-8 h-12 md:h-14 rounded-full text-gray-500 font-semibold transition-colors min-h-[48px] text-base md:text-lg" 
                type="button" 
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                className={`w-full md:w-auto px-6 md:px-8 h-12 md:h-14 rounded-full bg-primary text-background-dark font-bold hover:bg-[#0fd650] focus:ring-4 focus:ring-primary/30 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25 min-h-[48px] text-base md:text-lg ${isLoading ? 'opacity-75 cursor-wait' : ''}`}
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-background-dark"></div>
                    <span>Gerando Lista...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 md:w-5 md:h-5" />
                    <span>Criar Lista</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default CreateList;
