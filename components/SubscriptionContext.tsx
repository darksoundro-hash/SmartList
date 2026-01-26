import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../SmartList/services/src/lib/supabase';

interface SubscriptionContextType {
    isPremium: boolean;
    isLoading: boolean;
    checkLimits: {
        canCreateList: (currentCount: number) => boolean;
        canAddItem: (currentCount: number) => boolean;
        canDeleteList: () => boolean;
    };
    limits: {
        maxLists: number;
        maxItemsPerList: number;
    };
}

const SubscriptionContext = createContext<SubscriptionContextType>({
    isPremium: false,
    isLoading: true,
    checkLimits: {
        canCreateList: () => false,
        canAddItem: () => false,
        canDeleteList: () => false,
    },
    limits: {
        maxLists: 2,
        maxItemsPerList: 5,
    },
});

export const useSubscription = () => useContext(SubscriptionContext);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isPremium, setIsPremium] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Limites Hardcoded para Grátis
    const LIMITS = {
        maxLists: 2,
        maxItemsPerList: 5,
    };

    useEffect(() => {
        checkSubscriptionStatus();
    }, []);

    const checkSubscriptionStatus = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Verificar status premium na tabela de profiles
                const { data } = await supabase
                    .from('profiles')
                    .select('is_premium')
                    .eq('id', user.id)
                    .single();

                if (data) {
                    // Mapeando do banco snake_case para o estado camelCase
                    setIsPremium(data.is_premium || false);
                }
            }
        } catch (error) {
            console.error('Erro ao verificar assinatura:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const checkLimits = {
        canCreateList: (currentCount: number) => {
            if (isPremium) return true;
            return currentCount < LIMITS.maxLists;
        },
        canAddItem: (currentCount: number) => {
            if (isPremium) return true;
            return currentCount < LIMITS.maxItemsPerList;
        },
        canDeleteList: () => {
            if (isPremium) return true;
            return false; // Usuários grátis não podem excluir listas
        },
    };

    return (
        <SubscriptionContext.Provider value={{ isPremium, isLoading, checkLimits, limits: LIMITS }}>
            {children}
        </SubscriptionContext.Provider>
    );
};
