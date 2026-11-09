import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Minus, Plus, Search, ShoppingBag, X } from 'lucide-react';
import Dialog from '../components/ui/Dialog';
import RollingNumber from '../components/RollingNumber';
import Button from '../components/ui/Button';
import usePageMeta from '../hooks/usePageMeta';

const categories = ['Popular', 'Main Dishes', 'Breakfast', 'Drinks', 'Desserts', 'Snacks'];

const menu = [
  ['Chicken Burger', 'Main Dishes', 'Grilled chicken, crisp lettuce, tomato and house sauce on a toasted bun.', 7500, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80', true],
  ['Lake Kivu Tilapia', 'Main Dishes', 'Whole grilled tilapia with herb butter, lemon and roasted potatoes.', 12000, 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80', false],
  ['Beef Brochettes', 'Main Dishes', 'Charcoal-grilled beef skewers with onion, pepper and kachumbari.', 9000, 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=600&q=80', false],
  ['Kigali Breakfast Plate', 'Breakfast', 'Eggs, avocado, fruit, sausages and freshly baked bread.', 6500, 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=600&q=80', true],
  ['Avocado Toast', 'Breakfast', 'Sourdough, smashed avocado, chilli and a squeeze of lime.', 4800, 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80', false],
  ['Fresh Passion Juice', 'Drinks', 'Bright, chilled passion fruit juice made to order.', 2000, 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=600&q=80', false],
  ['Rwandan Coffee', 'Drinks', 'Single-origin beans, brewed black or with steamed milk.', 1800, 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=600&q=80', false],
  ['Chocolate Cake', 'Desserts', 'A rich chocolate slice served with vanilla cream.', 3500, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80', false],
  ['Banana and Honey Bowl', 'Desserts', 'Caramelised banana, yoghurt, honey and toasted peanuts.', 2800, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80', false],
  ['Spiced Potato Wedges', 'Snacks', 'Crisp wedges with rosemary, paprika and house dip.', 3000, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80', false],
  ['Grilled Corn', 'Snacks', 'Charred corn with chilli butter and lime salt.', 1500, 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80', false],
].map(([name, category, description, price, image, popular]) => ({
  name, category, description, price, image, popular, id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
}));

const money = (value) => `${new Intl.NumberFormat('en-US').format(value)} RWF`;

export default function DemoMenuPage() {
  usePageMeta({
    title: 'Sample menu',
    description: 'Explore a live KazeMenu sample menu and place a demo dine-in order from table 04. No account or app needed.',
  });
  const [category, setCategory] = useState('Popular');
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailQuantity, setDetailQuantity] = useState(1);
  const [cart, setCart] = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [note, setNote] = useState('');
  const [status, setStatus] = useState('');

  const term = search.trim().toLowerCase();
  const matchesSearch = (item) => !term || `${item.name} ${item.description} ${item.category}`.toLowerCase().includes(term);

  const sections = useMemo(() => {
    const pool = menu.filter(matchesSearch);
    if (term) return [{ title: 'Search results', items: pool }];
    if (category === 'Popular') return [{ title: 'Popular right now', items: pool.filter((item) => item.popular) }];
    return [{ title: category, items: pool.filter((item) => item.category === category) }];
  }, [category, term]);

  const cartItems = useMemo(() => Object.entries(cart)
    .map(([id, quantity]) => ({ item: menu.find((entry) => entry.id === id), quantity }))
    .filter(({ item, quantity }) => item && quantity > 0), [cart]);

  const itemCount = cartItems.reduce((sum, entry) => sum + entry.quantity, 0);
  const total = cartItems.reduce((sum, entry) => sum + entry.item.price * entry.quantity, 0);

  useEffect(() => {
    if (!status) return undefined;
    const timer = window.setTimeout(() => setStatus(''), 2400);
    return () => window.clearTimeout(timer);
  }, [status]);

  const addItem = (item, quantity = 1) => {
    setCart((current) => ({ ...current, [item.id]: (current[item.id] || 0) + quantity }));
    setStatus(`${quantity > 1 ? `${quantity} × ` : ''}${item.name} added to your order`);
  };

  const changeQuantity = (id, delta) => {
    setCart((current) => {
      const next = { ...current, [id]: Math.max(0, (current[id] || 0) + delta) };
      if (!next[id]) delete next[id];
      return next;
    });
  };

  const openItem = (item) => {
    setSelectedItem(item);
    setDetailQuantity(1);
  };

  const placeOrder = () => {
    setPlacedOrder({
      reference: `KM-${Math.floor(1000 + Math.random() * 9000)}`,
      items: cartItems,
      total,
      note,
    });
    setCart({});
    setNote('');
    setReviewOpen(false);
    setCartOpen(false);
  };

  return (
    <>
      <header className="dm-bar">
        <Link to="/" className="dm-back"><ArrowLeft size={17} aria-hidden="true" /> Back to home</Link>
        <button type="button" className="dm-bar-cart" onClick={() => setCartOpen(true)}>
          <ShoppingBag size={18} aria-hidden="true" />
          <span>Order</span>
          {itemCount > 0 && <b aria-hidden="true"><RollingNumber value={itemCount} /></b>}
          <span className="sr-only">{itemCount === 0 ? 'Order is empty' : `${itemCount} items in your order`}</span>
        </button>
      </header>

      <main className="dm-page">
        <section className="dm-masthead">
          <h1>Kigali Grillz</h1>
          <p>Your neighborhood spot to enjoy authentic Rwandan flavors.</p>
        </section>

        <div className="dm-toolbar">
          <label className="dm-search">
            <Search size={18} aria-hidden="true" />
            <span className="sr-only">Search the menu</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search dishes or drinks"
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} aria-label="Clear search"><X size={16} /></button>
            )}
          </label>
          <nav className="dm-categories" aria-label="Menu categories">
            {categories.map((entry) => (
              <button
                key={entry}
                type="button"
                className="dm-chip"
                aria-pressed={!term && category === entry}
                onClick={() => { setCategory(entry); setSearch(''); }}
              >
                {entry}
              </button>
            ))}
          </nav>
        </div>

        <div className="dm-layout">
          <div className="dm-menu">
            {sections.map((section) => (
              <section key={section.title} className="dm-section">
                <div className="dm-section-head">
                  <h2>{section.title}</h2>
                  <span>{section.items.length} {section.items.length === 1 ? 'dish' : 'dishes'}</span>
                </div>
                {section.items.length ? (
                  <ul className="dm-list">
                    {section.items.map((item) => {
                      const quantity = cart[item.id] || 0;
                      return (
                        <li key={item.id} className="dm-row">
                          <button type="button" className="dm-row-thumb" onClick={() => openItem(item)} aria-label={`View ${item.name}`}>
                            <img src={item.image} alt="" loading="lazy" />
                          </button>
                          <div className="dm-row-body">
                            <div className="dm-row-head">
                              <h3><button type="button" onClick={() => openItem(item)}>{item.name}</button></h3>
                            </div>
                            <p>{item.description}</p>
                            <div className="dm-row-foot">
                              <strong>{money(item.price)}</strong>
                              {quantity > 0 ? (
                                <div className="dm-stepper">
                                  <button type="button" onClick={() => changeQuantity(item.id, -1)} aria-label={`Remove one ${item.name}`}><Minus size={15} /></button>
                                  <span><RollingNumber value={quantity} /></span>
                                  <button type="button" onClick={() => changeQuantity(item.id, 1)} aria-label={`Add one more ${item.name}`}><Plus size={15} /></button>
                                </div>
                              ) : (
                                <button type="button" className="dm-add" onClick={() => addItem(item)}>
                                  <Plus size={16} aria-hidden="true" /> Add
                                </button>
                              )}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="dm-empty">
                    <h3>Nothing matches “{search}”.</h3>
                    <p>Try a shorter word, or browse a category instead.</p>
                    <button type="button" onClick={() => { setSearch(''); setCategory('Popular'); }}>Show popular dishes</button>
                  </div>
                )}
              </section>
            ))}
          </div>

          <aside className="dm-order" aria-label="Your order">
            <OrderSummary
              items={cartItems}
              itemCount={itemCount}
              total={total}
              changeQuantity={changeQuantity}
              onReview={() => setReviewOpen(true)}
              onClear={() => setCart({})}
            />
          </aside>
        </div>
      </main>

      <div className="dm-status" role="status" aria-live="polite">{status}</div>

      {itemCount > 0 && (
        <button type="button" className="dm-mobile-bar" onClick={() => setCartOpen(true)}>
          <span><ShoppingBag size={18} aria-hidden="true" /> View order · <RollingNumber value={itemCount} /> {itemCount === 1 ? 'item' : 'items'}</span>
          <strong><RollingNumber value={money(total)} /></strong>
        </button>
      )}

      {selectedItem && (
        <Dialog
          open
          onClose={() => setSelectedItem(null)}
          title={selectedItem.name}
          className="dm-detail-dialog"
          actions={(
            <div className="dm-detail-actions">
              <div className="dm-stepper dm-stepper-lg">
                <button type="button" onClick={() => setDetailQuantity((value) => Math.max(1, value - 1))} aria-label="Decrease quantity"><Minus size={17} /></button>
                <span><RollingNumber value={detailQuantity} /></span>
                <button type="button" onClick={() => setDetailQuantity((value) => value + 1)} aria-label="Increase quantity"><Plus size={17} /></button>
              </div>
              <Button type="button" onClick={() => { addItem(selectedItem, detailQuantity); setSelectedItem(null); }}>
                Add {money(selectedItem.price * detailQuantity)}
              </Button>
            </div>
          )}
        >
          <div className="dm-detail">
            <img src={selectedItem.image} alt={selectedItem.name} />
            <p className="dm-detail-category">{selectedItem.category}</p>
            <p className="dm-detail-desc">{selectedItem.description}</p>
            <p className="dm-detail-price">{money(selectedItem.price)}</p>
          </div>
        </Dialog>
      )}

      <Dialog open={cartOpen} onClose={() => setCartOpen(false)} title="Your order" className="dm-cart-dialog">
        <OrderSummary
          items={cartItems}
          itemCount={itemCount}
          total={total}
          changeQuantity={changeQuantity}
          onReview={() => { setCartOpen(false); setReviewOpen(true); }}
          onClear={() => setCart({})}
        />
      </Dialog>

      <Dialog
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        title="Review your order"
        actions={(
          <div className="dm-review-actions">
            <Button type="button" onClick={placeOrder}>Place demo order · {money(total)}</Button>
          </div>
        )}
      >
        <div className="dm-review">
          <div className="dm-review-meta">
            <div><span>Restaurant</span><strong>Kigali Grillz</strong></div>
            <div><span>Table</span><strong>04 · Dine-in</strong></div>
          </div>
          <ul className="dm-review-lines">
            {cartItems.map(({ item, quantity }) => (
              <li key={item.id}><span>{quantity} × {item.name}</span><span>{money(item.price * quantity)}</span></li>
            ))}
          </ul>
          <label className="dm-note" htmlFor="dm-order-note">
            Notes for the kitchen <span>optional</span>
            <textarea
              id="dm-order-note"
              value={note}
              maxLength={200}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Allergies, preferences or how you would like a dish served"
            />
          </label>
          <div className="dm-totals">
            <strong><span>Total</span><span>{money(total)}</span></strong>
          </div>
        </div>
      </Dialog>

      {placedOrder && (
        <Dialog
          open
          onClose={() => setPlacedOrder(null)}
          title="Order placed"
        >
          <div className="dm-placed">
            <span className="dm-placed-icon" aria-hidden="true"><Check size={32} /></span>
            <p><strong>Demo order {placedOrder.reference}</strong> is confirmed for table 04.</p>
            <p>The kitchen would now see these dishes on the pass. Nothing was sent anywhere. This is a sample menu.</p>
            <ul>
              {placedOrder.items.map(({ item, quantity }) => (
                <li key={item.id}><span>{quantity} × {item.name}</span><span>{money(item.price * quantity)}</span></li>
              ))}
            </ul>
            <div className="dm-totals"><strong><span>Total paid at table</span><span>{money(placedOrder.total)}</span></strong></div>
            {placedOrder.note && <p className="dm-placed-note">Note for the kitchen: “{placedOrder.note}”</p>}
          </div>
        </Dialog>
      )}
    </>
  );
}

function OrderSummary({ items, itemCount, total, changeQuantity, onReview, onClear }) {
  return (
    <div className="dm-order-inner">
      <div className="dm-order-head">
        <h2>Your order</h2>
        <span>Table 04</span>
      </div>
      {items.length === 0 ? (
        <div className="dm-order-empty">
          <ShoppingBag size={22} aria-hidden="true" />
          <p>Nothing added yet.</p>
          <p>Tap <strong>Add</strong> beside a dish and it will appear here with the running total.</p>
        </div>
      ) : (
        <>
          <ul className="dm-order-lines">
            {items.map(({ item, quantity }) => (
              <li key={item.id}>
                <div>
                  <strong>{item.name}</strong>
                  <span>{money(item.price)} each</span>
                </div>
                <div className="dm-stepper">
                  <button type="button" onClick={() => changeQuantity(item.id, -1)} aria-label={`Remove one ${item.name}`}><Minus size={14} /></button>
                  <span><RollingNumber value={quantity} /></span>
                  <button type="button" onClick={() => changeQuantity(item.id, 1)} aria-label={`Add one more ${item.name}`}><Plus size={14} /></button>
                </div>
                <b>{money(item.price * quantity)}</b>
              </li>
            ))}
          </ul>
          <div className="dm-totals">
            <strong><span>Total</span><span><RollingNumber value={money(total)} /></span></strong>
          </div>
          <Button type="button" className="dm-order-cta" onClick={onReview}>Review order · <RollingNumber value={itemCount} /></Button>
          <button type="button" className="dm-order-clear" onClick={onClear}>Clear order</button>
        </>
      )}
    </div>
  );
}
