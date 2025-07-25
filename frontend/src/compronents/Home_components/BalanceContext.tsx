import React, { createContext, useContext, useState, ReactNode } from 'react';

interface BalanceContextType {
  refresh: boolean;
  triggerRefresh: () => void;
  balance: number | null; // Include balance in the context type
  setBalance: React.Dispatch<React.SetStateAction<number | null>>; // Function to update balance
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

export const BalanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [refresh, setRefresh] = useState(false);
  const [balance, setBalance] = useState<number | null>(null); // Create balance state

  const triggerRefresh = () => setRefresh(prev => !prev);

  return (
    <BalanceContext.Provider value={{ refresh, triggerRefresh, balance, setBalance }}>
      {children}
    </BalanceContext.Provider>
  );
};

export const useBalanceContext = () => {
  const context = useContext(BalanceContext);
  if (context === undefined) {
    throw new Error('useBalanceContext must be used within a BalanceProvider');
  }
  return context;
};
