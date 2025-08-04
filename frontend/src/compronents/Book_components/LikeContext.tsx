// src/context/LikeContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';

interface LikeContextType {
  likes: { [key: string]: number };
  setLikes: (id: string, count: number) => void;
}

const LikeContext = createContext<LikeContextType | undefined>(undefined);

export const LikeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [likes, setLikesState] = useState<{ [key: string]: number }>({});

  const setLikes = (id: string, count: number) => {
    setLikesState(prevLikes => ({ ...prevLikes, [id]: count }));
  };

  return (
    <LikeContext.Provider value={{ likes, setLikes }}>
      {children}
    </LikeContext.Provider>
  );
};

export const useLikes = () => {
  const context = useContext(LikeContext);
  if (context === undefined) {
    throw new Error('useLikes must be used within a LikeProvider');
  }
  return context;
};
