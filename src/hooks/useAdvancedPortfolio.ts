import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const fetchBackendList = async (entity: string, token: string) => {
    const res = await fetch(`${BACKEND_URL}/api/advanced/${entity}`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) return [];
    return res.json();
};

export const useAdvancedPortfolio = () => {
    const { token } = useAuth();

    const { data: advancedData } = useQuery({
        queryKey: ['advancedPortfolioSummary'],
        queryFn: async () => {
            const endpoints = [
                "crypto_investments", "bonds", "etfs", "nps_investments",
                "bank_accounts", "provident_funds", "liabilities", "custom_assets"
            ];

            const results = await Promise.all(endpoints.map(e => fetchBackendList(e, token!)));

            const payload: Record<string, any[]> = {};
            endpoints.forEach((e, idx) => {
                payload[e] = results[idx];
            });

            // Calculate totals
            let totalLiabilities = 0;
            let totalAssets = 0;
            let totalInvestments = 0;

            payload.liabilities?.forEach(l => totalLiabilities += parseFloat(l.outstanding_amount || '0'));
            payload.bank_accounts?.forEach(a => totalAssets += parseFloat(a.current_balance || '0'));
            payload.custom_assets?.forEach(a => totalAssets += parseFloat(a.current_value || '0'));
            payload.provident_funds?.forEach(p => totalAssets += parseFloat(p.current_value || '0'));

            payload.crypto_investments?.forEach(c => totalInvestments += (parseFloat(c.current_price || c.average_price || '0') * parseFloat(c.quantity || '0')));
            payload.bonds?.forEach(b => totalInvestments += parseFloat(b.face_value || '0') * parseFloat(b.quantity || '0'));
            payload.etfs?.forEach(e => totalInvestments += parseFloat(e.current_nav || e.purchase_price || '0') * parseFloat(e.quantity || '0'));
            payload.nps_investments?.forEach(n => totalInvestments += parseFloat(n.current_value || n.amount_invested || '0'));

            return {
                raw: payload,
                liabilities: payload.liabilities || [],
                totalLiabilities,
                totalAssets,
                totalInvestments
            };
        },
        enabled: !!token
    });

    return advancedData || { totalLiabilities: 0, totalAssets: 0, totalInvestments: 0, raw: {}, liabilities: [] };
};
