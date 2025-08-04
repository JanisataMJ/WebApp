import React from 'react';
import { useBalanceContext } from '../src/compronents/Home_components/BalanceContext';

const SomeOtherComponent: React.FC = () => {
  const { triggerRefresh } = useBalanceContext(); // Access the context function

  const handleSomeAction = () => {
    // Perform some action, then trigger the refresh
    triggerRefresh();
  };

  return (
    <button onClick={handleSomeAction}>Trigger Balance Refresh</button>
  );
};

export default SomeOtherComponent;
