export const PLANS = {
    FREE: {
        id: 'free',
        name: 'Grátis',
        price: 0,
        limits: {
            maxLists: 3,
            maxItemsPerList: 10,
            hasAi: false,
            canDeleteLists: false,
            historyDays: 7,
        }
    },
    PREMIUM_MONTHLY: {
        id: 'premium_monthly',
        name: 'Premium Mensal',
        price: 19.90,
        limits: {
            maxLists: Infinity,
            maxItemsPerList: Infinity,
            hasAi: true,
            canDeleteLists: true,
            historyDays: Infinity,
        }
    },
    PREMIUM_ANNUAL: {
        id: 'premium_annual',
        name: 'Premium Anual',
        price: 14.90, // Per month
        totalPrice: 178.80,
        limits: {
            maxLists: Infinity,
            maxItemsPerList: Infinity,
            hasAi: true,
            canDeleteLists: true,
            historyDays: Infinity,
        }
    }
};

export type PlanId = keyof typeof PLANS;
