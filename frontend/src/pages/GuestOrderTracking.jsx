import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import { Skeleton } from '../components/ui/Skeleton';
import { RouteMotionSurface } from '../components/RouteMotion';
import usePageMeta from '../hooks/usePageMeta';

export default function GuestOrderTracking() {
  const { slug, trackingToken } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshError, setRefreshError] = useState('');
  const orderRef = useRef(null);

  usePageMeta({
    title: order ? `Order ${order.orderReference}` : 'Order tracking',
    description: 'Follow your KazeMenu order as the restaurant accepts, prepares and serves it.',
    noIndex: true,
  });

  useEffect(() => {
    if (!slug || !trackingToken) return undefined;
    let active = true;
    let intervalId;
    setLoading(true);
    setError('');
    orderRef.current = null;
    const loadOrder = async () => {
      try {
        const { data } = await api.get(`/api/public/restaurants/${encodeURIComponent(slug)}/orders/track/${encodeURIComponent(trackingToken)}`);
        if (active) {
          orderRef.current = data.data;
          setOrder(data.data);
          setError('');
          setRefreshError('');
          if (['SERVED', 'CANCELLED'].includes(data.data.status) && intervalId) {
            window.clearInterval(intervalId);
          }
        }
      } catch {
        if (!active) return;
        if (orderRef.current) setRefreshError('We could not refresh your order just now. Trying again.');
        else setError('unavailable');
      } finally {
        if (active) setLoading(false);
      }
    };
    loadOrder();
    intervalId = window.setInterval(loadOrder, 10000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [slug, trackingToken]);

  if (loading) {
    return (
      <RouteMotionSurface as="main" className="mx-auto min-h-screen max-w-2xl bg-warm px-4 py-14" role="status" aria-label="Loading order">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-4 h-5 w-36" />
        <Skeleton className="mt-10 h-24 w-full" />
      </RouteMotionSurface>
    );
  }
  if (error || !order) {
    return (
      <RouteMotionSurface as="main" className="mx-auto flex min-h-screen max-w-2xl flex-col items-start justify-center bg-warm px-4 py-12">
        <h1 className="text-2xl font-bold text-black">This order is no longer available</h1>
        <p role="alert" className="mt-3 text-muted">Ask a member of staff if you need an update on your order.</p>
        <Link to={`/guest-restaurant/${encodeURIComponent(slug || '')}`} className="mt-5 font-semibold text-primary">Back to the menu</Link>
      </RouteMotionSurface>
    );
  }

  const statusMap = {
    PLACED: 'Order Placed',
    ACCEPTED: 'Order Accepted',
    PREPARING: 'Preparing',
    READY: 'Ready',
    SERVED: 'Served',
    CANCELLED: 'Cancelled',
  };
  const statusDescription = {
    PLACED: 'The restaurant has received your order and will review it shortly.',
    ACCEPTED: 'The restaurant has accepted your order and will begin preparing it.',
    PREPARING: 'Your meal is being prepared by the restaurant team.',
    READY: 'Your order is ready. Please wait for the restaurant team to serve it.',
    SERVED: 'Your order has been served. Enjoy your meal!',
    CANCELLED: 'This order was cancelled. Please speak with the restaurant team if you need help.',
  };

  return (
    <RouteMotionSurface as="main" className="mx-auto min-h-screen max-w-2xl bg-warm px-4 py-12">
            <h1 className="mt-3 text-3xl font-bold text-black">Order {order.orderReference}</h1>
      <p className="mt-3 max-w-xl leading-7 text-muted">
        Your order is with the kitchen. Keep this page open and it will update as your food is prepared and served.
      </p>
      <div className="mt-7 border-y border-border py-6">
        <p className="text-sm text-muted">Current status</p>
        <p className="mt-2 text-xl font-bold text-primary">{statusMap[order.status] || order.status}</p>
        <p className="mt-2 max-w-xl leading-7 text-muted">{statusDescription[order.status] || 'The restaurant will update your order status as it progresses.'}</p>
        {order.tableId?.tableNumber && <p className="mt-4 text-sm text-muted">Table {order.tableId.tableNumber}</p>}
      </div>
      {Array.isArray(order.statusHistory) && order.statusHistory.length > 0 && (
        <ol className="mt-7 space-y-4">
          {order.statusHistory.map((entry, index) => (
            <li key={`${entry.status}-${entry.at}-${index}`} className="border-l-2 border-primary pl-4">
              <p className="font-semibold text-black">{statusMap[entry.status] || entry.status}</p>
              <p className="mt-1 text-sm text-muted">{new Date(entry.at).toLocaleString()}</p>
            </li>
          ))}
        </ol>
      )}
      {refreshError && <p role="status" className="mt-6 text-sm text-muted">{refreshError}</p>}
      <Link to={`/guest-restaurant/${encodeURIComponent(slug || '')}`} className="mt-8 inline-flex min-h-11 items-center font-semibold text-primary">
        Back to the menu
      </Link>
    </RouteMotionSurface>
  );
}