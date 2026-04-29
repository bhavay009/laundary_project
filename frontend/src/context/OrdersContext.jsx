import { createContext, useContext } from 'react';
import { useOrders } from '../hooks/useOrders';

const OrdersContext = createContext(null);

export function OrdersProvider({ children }) {
  const ordersHook = useOrders();

  return (
    <OrdersContext.Provider value={ordersHook}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrdersContext() {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrdersContext must be used within an OrdersProvider');
  }
  return context;
}

export default OrdersContext;