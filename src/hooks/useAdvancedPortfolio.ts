import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useMemo } from 'react';
import api from '@/services/api';

export interface AdvancedPortfolioData {
    metrics: {
        totalProperties: number;
        totalPropertyValue: number;
        totalMonthlyRevenue: number;
        occupancyRate: number;
        statusDistribution: { name: string; value: number }[];
        revenueData: { month: string; revenue: number }[];
    };
    details: {
        realEstate: any[];
        flats: any[];
        rentalProperties: any[];
        bankAccounts: any[];
        liabilities: any[];
        customAssets: any[];
        crypto: any[];
        bonds: any[];
        etfs: any[];
        nps: any[];
        mutualFunds: any[];
    };
}

export const useAdvancedPortfolio = () => {
    const { token } = useAuth();

    const { data, isLoading, error } = useQuery<AdvancedPortfolioData>({
        queryKey: ['consolidated-portfolio'],
        queryFn: async () => {
            const res = await api.get('/analytics/metrics');
            return res.data;
        },
        enabled: !!token,
        staleTime: 60 * 1000, // 1 minute stale time for portfolio data
        gcTime: 5 * 60 * 1000, // 5 minutes cache time
    });

    const calculatedMetrics = useMemo(() => {
        if (!data?.details) return { totalLiabilities: 0, totalAssets: 0, totalInvestments: 0 };

        const { details } = data;
        
        const totalLiabilities = (details.liabilities || [])
            .reduce((sum, l) => sum + parseFloat(l.outstanding_amount || '0'), 0);

        const totalAssets = [
            ...(details.bankAccounts || []),
            ...(details.customAssets || []),
            ...(details.realEstate || []),
            ...(details.flats || []),
            ...(details.rentalProperties || [])
        ].reduce((sum, a) => {
            const val = parseFloat(a.current_balance || a.current_value || a.price || a.purchase_price || '0');
            return sum + val;
        }, 0);

        const totalInvestments = [
            ...(details.crypto || []).map(c => parseFloat(c.current_price || c.average_price || '0') * parseFloat(c.quantity || '0')),
            ...(details.bonds || []).map(b => parseFloat(b.face_value || b.amount || '0') * parseFloat(b.quantity || '1')),
            ...(details.etfs || []).map(e => parseFloat(e.current_nav || e.purchase_price || '0') * parseFloat(e.quantity || '0')),
            ...(details.nps || []).map(n => parseFloat(n.current_value || n.amount_invested || '0'))
        ].reduce((sum, val) => sum + val, 0);

        return {
            totalLiabilities,
            totalAssets,
            totalInvestments
        };
    }, [data]);

    return {
        raw: data?.details || {},
        ...calculatedMetrics,
        isLoading,
        error
    };
};

export const getAdvancedQueryKey = (entity: string) => ['advanced', entity];

export const useAdvancedEntity = (entity: string) => {
    const { token } = useAuth();
    return useQuery({
        queryKey: getAdvancedQueryKey(entity),
        queryFn: async () => {
            const res = await api.get(`/advanced/${entity}`);
            return Array.isArray(res.data) ? res.data : (res.data.data || []);
        },
        enabled: !!token,
        staleTime: 5 * 60 * 1000,
    });
};
