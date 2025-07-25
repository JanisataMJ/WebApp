import React, { createContext, useContext, useState, ReactNode } from 'react';

// สร้าง Context
interface HistoryContextProps {
  triggerHistoryRefresh: () => void;
}

const HistoryContext = createContext<HistoryContextProps | undefined>(undefined);

// สร้าง Provider
export const HistoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerHistoryRefresh = () => {
    setRefreshKey(prevKey => prevKey + 1); // เปลี่ยนแปลงค่า refreshKey
  };

  return (
    <HistoryContext.Provider value={{ triggerHistoryRefresh }}>
      {children}
    </HistoryContext.Provider>
  );
};

// Custom hook เพื่อใช้งาน Context
export const useHistoryContext = () => {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistoryContext must be used within a HistoryProvider');
  }
  return context;
};
