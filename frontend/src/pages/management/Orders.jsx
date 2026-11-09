import { useCallback, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import Dialog from '../../components/ui/Dialog';
import { Skeleton } from '../../components/ui/Skeleton';
import usePageMeta from '../../hooks/usePageMeta';

const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const socket = io(socketUrl, {
  autoConnect: true,
  transports: ['websocket', 'polling'],
});

const nextStatus = {
  PLACED: 'ACCEPTED',
  ACCEPTED: 'PREPARING',
  PREPARING: 'READY',
  READY: 'SERVED',
};

const nextActionLabel = {
  PLACED: 'Accept order',
  ACCEPTED: 'Start preparing',
  PREPARING: 'Mark ready',
  READY: 'Mark served',
};

const statusLabel = {
  PLACED: 'New',
  ACCEPTED: 'Accepted',
  PREPARING: 'Preparing',
  READY: 'Ready',
  SERVED: 'Served',
};

const orderColumns = [
  { title: 'New', key: 'new', statuses: ['PLACED', 'ACCEPTED'], empty: 'No new orders yet.' },
  { title: 'Preparing', key: 'preparing', statuses: ['PREPARING'], empty: 'Nothing at the pass.' },
  { title: 'Ready', key: 'ready', statuses: ['READY'], empty: 'Nothing waiting to be served.' },
];
const activeStatuses = new Set(orderColumns.flatMap((column) => column.statuses));

export default function Orders() {
  const { restaurantId } = useAuth();
  const { addToast } = useToast();
  usePageMeta({
    title: 'Orders',
    description: 'The live KazeMenu order queue for your restaurant: accept, prepare and serve dine-in orders.',
    noIndex: true,
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyAction, setBusyAction] = useState('');
  const [pendingCancel, setPendingCancel] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      setSocketConnected(false);
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchOrders = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true);
    setError('');
    try {
      const responses = await Promise.all(
        [...activeStatuses].map((status) => api.get('/api/orders', {
          params: { status },
          headers: { 'x-restaurant-id': restaurantId },
        }))
      );
      const loadedOrders = responses.flatMap(({ data }) => data.data || []);
      loadedOrders.sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime());
      setOrders(loadedOrders);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (!restaurantId) return undefined;
    socket.auth = { restaurantId };

    socket.on('connect', () => setSocketConnected(true));
    socket.on('disconnect', () => setSocketConnected(false));
    socket.on('new-order', (order) => {
      if (activeStatuses.has(order.status)) {
        setOrders((current) => [order, ...current.filter((entry) => entry._id !== order._id)].slice(0, 200));
      }
      addToast('New order received', `Order ${order.orderReference || ''}`);
    });
    socket.on('order-updated', ({ status }) => {
      fetchOrders();
      addToast('Order updated', `Order status: ${status}`);
    });
    socket.on('order-cancelled', ({ orderId }) => {
      setOrders((current) => current.filter((order) => order._id !== orderId));
    });

    socket.on('connect_error', (socketError) => {
      console.error('Order updates connection failed:', socketError.message);
    });
    return () => socket.disconnect();
  }, [restaurantId, fetchOrders, addToast]);

  const connectionLabel = !isOnline
    ? 'Offline'
    : socketConnected
      ? 'Live updates'
      : 'Reconnecting';

  const updateStatus = async (order) => {
    const status = nextStatus[order.status];
    if (!status) return;
    const actionId = `${order._id}:status`;
    setBusyAction(actionId);
    try {
      const { data } = await api.patch(`/api/orders/${order._id}/status`, {
        status,
        note: 'Updated by restaurant staff',
      }, {
        headers: { 'x-restaurant-id': restaurantId },
      });
      setOrders((current) => {
        const remaining = current.filter((entry) => entry._id !== order._id);
        return activeStatuses.has(status) ? [data.data, ...remaining] : remaining;
      });
      addToast('Status updated', `Order ${order.orderReference || ''} is now ${status.toLowerCase()}.`);
    } catch (requestError) {
      addToast('Could not update order', requestError.response?.data?.message || 'Please try again.', 'error');
    } finally {
      setBusyAction('');
    }
  };

  const cancelOrder = async () => {
    if (!pendingCancel) return;
    setCancelLoading(true);
    try {
      await api.patch(`/api/orders/${pendingCancel._id}/cancel`, {
        reason: 'Cancelled by restaurant staff',
      }, {
        headers: { 'x-restaurant-id': restaurantId },
      });
      setOrders((current) => current.filter((order) => order._id !== pendingCancel._id));
      addToast('Order cancelled', `Order ${pendingCancel.orderReference || ''} was cancelled.`);
      setPendingCancel(null);
    } catch (requestError) {
      addToast('Could not cancel order', requestError.response?.data?.message || 'Please try again.', 'error');
    } finally {
      setCancelLoading(false);
    }
  };

  if (!restaurantId) {
    return <p role="alert" className="pt-error">No restaurant is associated with this account.</p>;
  }

  const activeCount = orders.length;

  return (
    <section className="pt-section">
      <header className="pt-head">
        <div className="pt-head-copy">
          <h1 className="pt-title">Orders</h1>
          
        </div>
        <p className={`pt-live ${!isOnline || !socketConnected ? 'pt-live-off' : ''}`} role="status" aria-live="polite">
          <span aria-hidden="true" />
          {connectionLabel}
        </p>
      </header>

      {error && (
        <div role="alert" className="pt-alert">
          <span>{error}</span>
          <Button type="button" variant="secondary" onClick={fetchOrders}>Try again</Button>
        </div>
      )}

      {loading ? (
        <div className="pt-board" role="status" aria-label="Loading orders">
          {orderColumns.map((column) => (
            <section key={column.key} className="pt-col">
              <div className="pt-col-head">
                <h2>{column.title}</h2>
                <span>...</span>
              </div>
              <div className="pt-col-list">
                <Skeleton className="h-36 w-full" />
                <Skeleton className="h-36 w-full" />
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="pt-board">
          {orderColumns.map((column) => {
            const columnOrders = orders.filter((order) => column.statuses.includes(order.status));
            return (
              <section key={column.key} className="pt-col" aria-label={`${column.title} orders`}>
                <div className="pt-col-head">
                  <h2>{column.title}</h2>
                  <span aria-label={`${columnOrders.length} orders`}>{columnOrders.length}</span>
                </div>
                {columnOrders.length ? (
                  <div className="pt-col-list">
                    {columnOrders.map((order) => (
                      <article key={order._id} className="pt-ticket">
                        <div className="pt-ticket-top">
                          <h3>{order.orderReference || order._id}</h3>
                          <span className={`pt-status pt-status-${column.key}`}>
                            {statusLabel[order.status] || order.status}
                          </span>
                        </div>
                        {order.items?.length > 0 && (
                          <ul className="pt-ticket-items">
                            {order.items.map((item, index) => (
                              <li key={`${order._id}-${index}`}>
                                <span>{item.quantity} × {item.itemName}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                        <div className="pt-ticket-actions">
                          {nextStatus[order.status] && (
                            <Button
                              type="button"
                              loading={busyAction === `${order._id}:status`}
                              loadingLabel="Updating..."
                              onClick={() => updateStatus(order)}
                            >
                              {nextActionLabel[order.status]}
                            </Button>
                          )}
                          {['PLACED', 'ACCEPTED'].includes(order.status) && (
                            <button type="button" className="pt-text-action" onClick={() => setPendingCancel(order)}>
                              Cancel order
                            </button>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="pt-empty">{column.empty}</p>
                )}
              </section>
            );
          })}
        </div>
      )}

      <Dialog
        open={Boolean(pendingCancel)}
        onClose={() => !cancelLoading && setPendingCancel(null)}
        title="Cancel this order?"
        className="pt-dialog"
        actions={
          <div className="pt-dialog-actions">
            <Button type="button" variant="secondary" disabled={cancelLoading} onClick={() => setPendingCancel(null)}>Go back</Button>
            <Button type="button" loading={cancelLoading} loadingLabel="Cancelling..." onClick={cancelOrder}>Confirm cancellation</Button>
          </div>
        }
      >
        <p className="text-sm leading-6 text-muted">
          Order {pendingCancel?.orderReference || ''} will be marked as cancelled. This cannot be undone.
        </p>
      </Dialog>
    </section>
  );
}
