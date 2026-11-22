'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { CustomerSessionUser } from '@/lib/types';

interface CustomerAuthContextValue {
  customer: CustomerSessionUser | null;
  setCustomer: (next: CustomerSessionUser | null) => void;
  refreshCustomer: () => Promise<CustomerSessionUser | null>;
  logout: () => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null);

interface CustomerAuthProviderProps {
  initialCustomer: CustomerSessionUser | null;
  children: ReactNode;
}

export function CustomerAuthProvider({
  initialCustomer,
  children,
}: CustomerAuthProviderProps) {
  const [customer, setCustomer] = useState<CustomerSessionUser | null>(
    initialCustomer
  );

  const refreshCustomer = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      if (!res.ok) return null;
      const data = (await res.json()) as {
        authenticated?: boolean;
        customer?: CustomerSessionUser | null;
      };
      const next = data.authenticated && data.customer ? data.customer : null;
      setCustomer(next);
      return next;
    } catch {
      return null;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      setCustomer(null);
    }
  }, []);

  const value = useMemo<CustomerAuthContextValue>(
    () => ({
      customer,
      setCustomer,
      refreshCustomer,
      logout,
    }),
    [customer, refreshCustomer, logout]
  );

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth(): CustomerAuthContextValue {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return ctx;
}
