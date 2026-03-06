import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../SmartList/services/src/lib/supabase';
import { PLANS } from '../constants/plans';

interface SubscriptionContextType {
    isPremium: boolean;
    isLoading: boolean;
    plan: typeof PLANS.FREE | typeof PLANS.PREMIUM_MONTHLY;
    checkLimits: {
        canCreateList: (currentCount: number) => boolean;
        canAddItem: (currentCount: number) => boolean;
        canDeleteList: () => boolean;
    };
    refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
    isPremium: false,
    isLoading: true,
    plan: PLANS.FREE,
    checkLimits: {
        canCreateList: () => false,
        canAddItem: () => false,
        canDeleteList: () => false,
    },
    refreshSubscription: async () => { },
});

export const useSubscription = () => useContext(SubscriptionContext);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isPremium, setIsPremium] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPlan, setCurrentPlan] = useState<any>(PLANS.FREE);

    useEffect(() => {
        checkSubscriptionStatus();
    }, []);

    const checkSubscriptionStatus = async () => {
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (authError && authError.message === 'Failed to fetch') {
                console.warn('⚠️ Não foi possível conectar ao Supabase (Projeto pausado ou sem rede)');
                setIsPremium(false);
                setCurrentPlan(PLANS.FREE);
                return;
            }

            if (user) {
                const { data, error: profileError } = await supabase
                    .from('profiles')
                    .select('is_premium')
                    .eq('id', user.id)
                    .single();

                if (profileError && profileError.message === 'Failed to fetch') {
                    setIsPremium(false);
                    setCurrentPlan(PLANS.FREE);
                    return;
                }

                if (data) {
                    const premium = data.is_premium || false;
                    setIsPremium(premium);
                    setCurrentPlan(premium ? PLANS.PREMIUM_MONTHLY : PLANS.FREE);
                }
            } else {
                setIsPremium(false);
                setCurrentPlan(PLANS.FREE);
            }
        } catch (error: any) {
            console.error('Erro ao verificar assinatura:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const checkLimits = {
        canCreateList: (currentCount: number) => {
            return currentCount < currentPlan.limits.maxLists;
        },
        canAddItem: (currentCount: number) => {
            return currentCount < currentPlan.limits.maxItemsPerList;
        },
        canDeleteList: () => {
            return currentPlan.limits.canDeleteLists;
        },
    };

    return (
        <SubscriptionContext.Provider value={{
            isPremium,
            isLoading,
            plan: currentPlan,
            checkLimits,
            refreshSubscription: checkSubscriptionStatus
        }}>
            {children}
        </SubscriptionContext.Provider>
    );
};
