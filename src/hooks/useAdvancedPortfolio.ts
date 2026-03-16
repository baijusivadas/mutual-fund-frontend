import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { propertyQueryConfig } from './useQueryConfig';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const fetchBackendList = async (entity: string, token: string) => {
    const res = await fetch(`${BACKEND_URL}/api/advanced/${entity}`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) return [];
    return res.json();
};

const ENTITIES = [
    "crypto_investments", "bonds", "etfs", "nps_investments",
    "bank_accounts", "provident_funds", "liabilities", "custom_assets"
] as const;

type EntityType = typeof ENTITIES[number];

export const getAdvancedQueryKey = (entity: string) => ['advanced', entity];

export const useAdvancedEntity = (entity: EntityType) => {
    const { token } = useAuth();
    return useQuery({
        queryKey: getAdvancedQueryKey(entity),
        queryFn: () => fetchBackendList(entity, token!),
        enabled: !!token,
        ...propertyQueryConfig,
    });
};

export const useAdvancedPortfolio = () => {
    const crypto = useAdvancedEntity("crypto_investments");
    const bonds = useAdvancedEntity("bonds");
    const etfs = useAdvancedEntity("etfs");
    const nps = useAdvancedEntity("nps_investments");
    const bank = useAdvancedEntity("bank_accounts");
    const pf = useAdvancedEntity("provident_funds");
    const liabilities = useAdvancedEntity("liabilities");
    const custom = useAdvancedEntity("custom_assets");

    const isLoading = crypto.isLoading || bonds.isLoading || etfs.isLoading || nps.isLoading || 
                      bank.isLoading || pf.isLoading || liabilities.isLoading || custom.isLoading;

    const payload: Record<string, any[]> = {
        crypto_investments: crypto.data || [],
        bonds: bonds.data || [],
        etfs: etfs.data || [],
        nps_investments: nps.data || [],
        bank_accounts: bank.data || [],
        provident_funds: pf.data || [],
        liabilities: liabilities.data || [],
        custom_assets: custom.data || []
    };

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
        totalInvestments,
        isLoading
    };
};
