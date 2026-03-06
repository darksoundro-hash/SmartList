
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('⚠️ Supabase URL ou Key não encontrados! Verifique .env.local');
}

// Criar o cliente Supabase
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder'
);

// Helper para verificar conectividade
export const checkSupabaseConnection = async () => {
    try {
        const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true }).limit(1);
        if (error) {
            if (error.message === 'Failed to fetch') {
                return { success: false, error: 'Projeto Supabase pausado ou sem internet.' };
            }
            return { success: false, error: error.message };
        }
        return { success: true };
    } catch (e) {
        return { success: false, error: 'Erro de rede ao conectar com Supabase.' };
    }
};
