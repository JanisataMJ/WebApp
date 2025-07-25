import React, { useEffect } from 'react';
import { GetCoinById } from '../../services/https/Coin/coin';
import { useBalanceContext } from './BalanceContext';

const Balance: React.FC = () => {
  const { balance, setBalance, refresh } = useBalanceContext(); // Access the balance and setter from context
  const userId = localStorage.getItem("id");

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        if (userId) {
          const response = await GetCoinById(userId);
          setBalance(response.data.balance); // Update balance in context
        }
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    };

    fetchBalance();
  }, [userId, refresh, setBalance]); // Include setBalance in the dependency array

  return <p>{balance}</p>;
};

export default Balance;
