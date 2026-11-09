import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Minus, Plus, Search, ShoppingBag, X } from 'lucide-react';
import api from '../services/api';
import logo from '../assets/logo';
import Button from '../components/ui/Button';
import Dialog from '../components/ui/Dialog';
import { RestaurantMenuSkeleton } from '../components/ui/Skeleton';
import { useToast } from '../components/ui/ToastProvider';
import { RouteMotionSurface } from '../components/RouteMotion';
import { getImageUrl } from '../utils/imageUrl';
import usePageMeta from '../hooks/usePageMeta';

const money = (value) => `${new Intl.NumberFormat('en-US').format(value)} RWF`;

export default function GuestRestaurant() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  usePageMeta({
    title: restaurant ? `${restaurant.name} menu` : 'Restaurant menu',
    description: restaurant?.description || 'Browse the menu and order from your table with KazeMenu.',
  });
  const tableToken = searchParams.get('table');
  const [restaurant, setRestaurant] = useState(null);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [table, setTable] = useState(null);
  const [loading, setLoading] = useState(Boolean(slug));
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [cart, setCart] = useState({});
  const [instructions, setInstructions] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailQuantity, setDetailQuantity] = useState(1);
  const [cartOpen, setCartOpen] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState('');

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return undefined;
    }

    let active = true;
    setLoading(true);
    setError('');
    setRestaurant(null);
    setTable(null);
    setCategories([]);
    setItems([]);
    setCart({});
    setSearch('');
    setActiveCategory('all');
    setInstructions('');
    const requests = [
      api.get(`/api/public/restaurants/${encodeURIComponent(slug)}`),
      api.get(`/api/public/restaurants/${encodeURIComponent(slug)}/menu`),
      api.get(`/api/public/restaurants/${encodeURIComponent(slug)}/categories`),
    ];
    if (tableToken) requests.push(api.get(`/api/public/restaurants/${encodeURIComponent(slug)}/tables/${encodeURIComponent(tableToken)}`));

    Promise.all(requests)
      .then(([restaurantResponse, menuResponse, categoryResponse, tableResponse]) => {
        if (!active) return;
        setRestaurant(restaurantResponse.data.data);
        setItems(menuResponse.data.data.filter((item) => item.isAvailable));
        setCategories(categoryResponse.data.data || []);
        setTable(tableResponse?.data.data || null);
      })
      .catch((requestError) => {
        if (!active) return;
        setError(requestError.response?.data?.message || 'This menu could not be opened.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [slug, tableToken]);

  const filteredItems = useMemo(() => items.filter((item) => {
    const matchesCategory = activeCategory === 'all' || String(item.categoryId) === activeCategory;
    const term = search.trim().toLowerCase();
    return matchesCategory && (!term || `${item.name} ${item.description || ''}`.toLowerCase().includes(term));
  }), [activeCategory, items, search]);

  const cartItems = useMemo(() => Object.entries(cart)
    .map(([id, quantity]) => ({ item: items.find((entry) => entry._id === id), quantity }))
    .filter(({ item, quantity }) => item && quantity > 0), [cart, items]);
  const cartCount = cartItems.reduce((sum, entry) => sum + entry.quantity, 0);
  const subtotal = cartItems.reduce((sum, { item, quantity }) => sum + item.price * quantity, 0);

  const changeQuantity = (id, amount) => {
    setCart((current) => {
      const next = { ...current, [id]: Math.max(0, (current[id] || 0) + amount) };
      if (!next[id]) delete next[id];
      return next;
    });
  };

  const submitOrder = async () => {
    if (!table || !cartItems.length) return;
    setOrderLoading(true);
    setOrderError('');
    try {
      const { data } = await api.post(`/api/public/restaurants/${encodeURIComponent(slug)}/orders`, {
        qrToken: table.qrToken,
        items: cartItems.map(({ item, quantity }) => ({ menuItemId: item._id, quantity })),
        specialInstructions: instructions,
      });
      addToast('Order placed', `Your order reference is ${data.data.orderReference}.`);
      setCart({});
      setInstructions('');
      setConfirmationOpen(false);
      navigate(`/guest-restaurant/${encodeURIComponent(slug)}/orders/${encodeURIComponent(data.data.trackingToken)}`, {
        state: { routeMotion: 'push-forward' },
      });
    } catch (requestError) {
      setOrderError(requestError.response?.data?.message || 'Your order could not be sent. Check your items and try again.');
    } finally {
      setOrderLoading(false);
    }
  };

  if (!slug) {
    return (
      <RouteMotionSurface as="main" className="flex min-h-screen items-center justify-center bg-soft px-4">
        <section className="max-w-md rounded-lg border border-border bg-warm p-6 text-center">
          <h1 className="text-xl font-bold text-black">This link is incomplete</h1>
          <p className="mt-2 text-muted">Scan the QR code on your table to open the restaurant’s menu.</p>
          <Link to="/" className="mt-5 inline-block rounded-md bg-primary px-4 py-2 font-semibold text-white">Back to KazeMenu</Link>
        </section>
      </RouteMotionSurface>
    );
  }

  if (loading) return <RouteMotionSurface className="min-h-screen"><RestaurantMenuSkeleton /></RouteMotionSurface>;

  if (error || !restaurant) {
    return (
      <RouteMotionSurface as="main" className="flex min-h-screen items-center justify-center bg-soft px-4">
        <section className="max-w-md rounded-lg border border-border bg-warm p-6 text-center">
          <h1 className="text-xl font-bold text-black">This menu is closed right now</h1>
          <p role="alert" className="mt-2 text-red-600">Please ask a member of staff for help, or try again in a moment.</p>
          <button type="button" className="mt-5 inline-flex min-h-11 items-center font-semibold text-primary" onClick={() => window.location.reload()}>Try again</button>
        </section>
      </RouteMotionSurface>
    );
  }

  return (
    <RouteMotionSurface as="main" className="min-h-screen bg-soft pb-8">
      {restaurant.coverImage && (
        <div className="h-40 bg-cover bg-center sm:h-52" style={{ backgroundImage: `url("${restaurant.coverImage}")` }} />
      )}
      <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 lg:px-8">
        <header className="mb-7 flex flex-wrap items-center gap-4">
          <img src={restaurant.logo ? getImageUrl(restaurant.logo) : logo} alt="" className="h-16 w-16 rounded-lg border border-border bg-warm object-contain p-2" />
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-black">{restaurant.name}</h1>
            {table ? (
              <p className="mt-1 text-sm font-semibold text-primary">Table {table.tableNumber}</p>
            ) : (
              <p className="mt-1 text-sm text-muted">Scan the code on your table to order.</p>
            )}
            {restaurant.description && <p className="mt-1 text-sm text-muted">{restaurant.description}</p>}
            {restaurant.location && <p className="mt-1 text-sm text-muted">{restaurant.location}</p>}
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search the menu" aria-label="Search menu" className="form-input guest-search-input w-full" />
          </div>
        </header>

        <section className="guest-guidance mb-7" aria-label="How to order">
          <div>
            <h2 className="mt-2 text-lg font-bold text-black">
              {table ? `You are ordering for table ${table.tableNumber}` : 'Read the menu, then scan to order'}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              {table
                ? 'Choose your dishes, add a note for the kitchen if you need one, and send everything when you are ready. Your server brings it to your table.'
                : 'When you are ready, scan the code on your table so the kitchen knows where to send your food.'}
            </p>
          </div>
          <ol className="guest-guidance-steps">
            <li><span>01</span>Choose your dishes</li>
            <li><span>02</span>Leave a note if you like</li>
            <li><span>03</span>{table ? 'Send it to the kitchen' : 'Scan your table code'}</li>
          </ol>
        </section>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_330px]">
          <section>
            <nav className="category-scroller" aria-label="Menu categories">
              <button type="button" className={`category-link ${activeCategory === 'all' ? 'category-link-active' : ''}`} aria-pressed={activeCategory === 'all'} onClick={() => setActiveCategory('all')}>All items</button>
              {categories.map((category) => (
                <button
                  type="button"
                  key={category._id}
                  className={`category-link ${activeCategory === category._id ? 'category-link-active' : ''}`}
                  aria-pressed={activeCategory === category._id}
                  onClick={() => setActiveCategory(category._id)}
                >
                  {category.name}
                </button>
              ))}
            </nav>
            <h2 className="mb-4 mt-6 text-xl font-bold text-black">Menu</h2>
            {filteredItems.length ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {filteredItems.map((item) => (
                  <article key={item._id} className="menu-item">
                    <button type="button" className="menu-item-image-button" onClick={() => { setSelectedItem(item); setDetailQuantity(1); }}>
                      {item.image ? <img src={getImageUrl(item.image)} alt={item.name} className="menu-item-image" loading="lazy" /> : <div className="menu-item-image" aria-hidden="true" />}
                    </button>
                    <div className="flex items-start justify-between gap-3 p-4">
                      <button type="button" className="min-w-0 text-left" onClick={() => { setSelectedItem(item); setDetailQuantity(1); }}>
                        <h3 className="font-bold text-black">{item.name}</h3>
                        {item.description && <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted">{item.description}</p>}
                      </button>
                      <span className="shrink-0 text-sm font-bold text-primary">{money(item.price)}</span>
                    </div>
                    {table && (
                      <div className="flex justify-end border-t border-border px-4 py-3">
                        <button type="button" className="quick-add" onClick={() => { changeQuantity(item._id, 1); addToast('Added to your order', item.name); }}>
                          <Plus size={16} /> Add to order
                        </button>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-warm p-6 text-sm text-muted">
                Nothing on the menu matches that search. Try a different dish or clear the search.
              </div>
            )}
          </section>

          {table && (
            <aside className="cart-panel hidden lg:block" aria-label="Your order">
              <GuestCart
                items={cartItems}
                count={cartCount}
                subtotal={subtotal}
                instructions={instructions}
                setInstructions={setInstructions}
                changeQuantity={changeQuantity}
                idPrefix="desktop-cart"
                onPlaceOrder={() => { setOrderError(''); setConfirmationOpen(true); }}
              />
            </aside>
          )}
        </div>
      </div>

      {table && cartCount > 0 && (
        <button type="button" className="mobile-cart-button lg:hidden" onClick={() => setCartOpen(true)}>
          <span className="flex items-center gap-2"><ShoppingBag size={18} /> View order ({cartCount})</span>
          <span>{money(subtotal)}</span>
        </button>
      )}

      <Dialog
        open={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.name || 'Menu item'}
        actions={selectedItem && table && (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <QuantityControl value={detailQuantity} onChange={setDetailQuantity} />
            <Button type="button" onClick={() => {
              changeQuantity(selectedItem._id, detailQuantity);
              addToast('Added to your order', selectedItem.name);
              setSelectedItem(null);
            }}>
              Add {money((selectedItem?.price || 0) * detailQuantity)}
            </Button>
          </div>
        )}
      >
        {selectedItem && (
          <>
            {selectedItem.image && <img src={getImageUrl(selectedItem.image)} alt={selectedItem.name} className="mb-4 h-48 w-full rounded-md object-cover" />}
            <p className="text-sm leading-6 text-muted">{selectedItem.description}</p>
            <p className="mt-3 font-bold text-primary">{money(selectedItem.price)}</p>
            {!table && <p className="mt-3 text-sm text-muted">Scan the code on your table to add this to an order.</p>}
          </>
        )}
      </Dialog>

      <Dialog
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        title="Your order"
        actions={cartCount > 0 && (
          <Button type="button" className="w-full" onClick={() => { setCartOpen(false); setOrderError(''); setConfirmationOpen(true); }}>
            Review order
          </Button>
        )}
      >
        <GuestCart
          items={cartItems}
          count={cartCount}
          subtotal={subtotal}
          instructions={instructions}
          setInstructions={setInstructions}
          changeQuantity={changeQuantity}
          idPrefix="mobile-cart"
          showPlaceOrder={false}
        />
      </Dialog>

      <Dialog
        open={confirmationOpen}
        onClose={() => !orderLoading && setConfirmationOpen(false)}
        title="Confirm your order"
        actions={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" disabled={orderLoading} onClick={() => setConfirmationOpen(false)}>Go Back</Button>
            <Button type="button" loading={orderLoading} loadingLabel="Placing Order..." onClick={submitOrder}>Confirm Order</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex justify-between gap-4 text-sm"><span className="text-muted">Restaurant</span><strong>{restaurant.name}</strong></div>
          <div className="flex justify-between gap-4 text-sm"><span className="text-muted">Table</span><strong>{table?.tableNumber || 'Not selected'}</strong></div>
          <div className="border-y border-border py-3">
            {cartItems.map(({ item, quantity }) => (
              <div key={item._id} className="flex justify-between gap-4 py-1 text-sm">
                <span>{quantity} × {item.name}</span><span className="font-semibold">{money(quantity * item.price)}</span>
              </div>
            ))}
          </div>
          <label className="block text-sm font-semibold text-black" htmlFor="guest-order-instructions">
            Special instructions
            <textarea id="guest-order-instructions" value={instructions} onChange={(event) => setInstructions(event.target.value)} maxLength={500} placeholder="Anything the restaurant should know?" className="form-input mt-2 min-h-20 w-full resize-y font-normal" />
          </label>
          <div className="flex justify-between gap-4 border-t border-border pt-4 text-base font-bold"><span>Total</span><span>{money(subtotal)}</span></div>
          {orderError && <p role="alert" className="text-sm text-red-600">{orderError}</p>}
        </div>
      </Dialog>
    </RouteMotionSurface>
  );
}

function QuantityControl({ value, onChange }) {
  return (
    <div className="quantity-control" aria-label={`Quantity ${value}`}>
      <button type="button" onClick={() => onChange(Math.max(1, value - 1))} aria-label="Decrease quantity"><Minus size={16} /></button>
      <span>{value}</span>
      <button type="button" onClick={() => onChange(value + 1)} aria-label="Increase quantity"><Plus size={16} /></button>
    </div>
  );
}

function GuestCart({ items, count, subtotal, instructions, setInstructions, changeQuantity, idPrefix, showPlaceOrder = true, onPlaceOrder }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-black">Your order</h2>
        <span className="text-sm text-muted">{count} {count === 1 ? 'item' : 'items'}</span>
      </div>
      {!items.length ? (
        <div className="py-10 text-center">
          <ShoppingBag size={24} className="mx-auto text-muted" />
          <p className="mt-3 font-semibold text-black">Your order is empty</p>
          <p className="mt-1 text-sm text-muted">Add a meal to get started.</p>
        </div>
      ) : (
        <>
          <div className="mt-4 max-h-64 space-y-4 overflow-y-auto">
            {items.map(({ item, quantity }) => (
              <div key={item._id} className="flex items-start justify-between gap-3 border-b border-border pb-3">
                <div className="min-w-0">
                  <p className="font-semibold text-black">{item.name}</p>
                  <p className="mt-1 text-sm text-muted">{money(item.price * quantity)}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <button type="button" onClick={() => changeQuantity(item._id, -1)} className="quantity-mini" aria-label={`Remove one ${item.name}`}><Minus size={14} /></button>
                    <span className="text-sm">{quantity}</span>
                    <button type="button" onClick={() => changeQuantity(item._id, 1)} className="quantity-mini" aria-label={`Add one ${item.name}`}><Plus size={14} /></button>
                  </div>
                </div>
                <button type="button" onClick={() => changeQuantity(item._id, -quantity)} aria-label={`Remove ${item.name}`} className="p-1 text-muted hover:text-black"><X size={17} /></button>
              </div>
            ))}
          </div>
          <label className="mt-4 block text-sm font-semibold text-black" htmlFor={`${idPrefix}-instructions`}>
            Special instructions
            <textarea id={`${idPrefix}-instructions`} value={instructions} onChange={(event) => setInstructions(event.target.value)} maxLength={500} placeholder="Anything the restaurant should know?" className="form-input mt-2 min-h-20 w-full resize-y font-normal" />
          </label>
          <div className="mt-4 flex justify-between border-t border-border pt-4 font-bold text-black">
            <span>Total</span><span>{money(subtotal)}</span>
          </div>
          {showPlaceOrder && <Button type="button" className="mt-4 w-full" onClick={onPlaceOrder}>Place Order</Button>}
        </>
      )}
    </div>
  );
}
