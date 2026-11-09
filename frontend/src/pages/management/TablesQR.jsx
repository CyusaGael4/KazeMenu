import { useCallback, useEffect, useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer } from 'lucide-react';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import Dialog from '../../components/ui/Dialog';
import { useToast } from '../../hooks/useToast';
import { Skeleton } from '../../components/ui/Skeleton';
import usePageMeta from '../../hooks/usePageMeta';

export default function TablesQR() {
  const { addToast } = useToast();
  usePageMeta({
    title: 'Tables & QR codes',
    description: 'Create tables and print or share each table’s QR code from your KazeMenu restaurant portal.',
    noIndex: true,
  });
  const [tables, setTables] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [form, setForm] = useState({ tableName: '', tableNumber: '' });
  const [selectedTable, setSelectedTable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copying, setCopying] = useState(false);
  const [error, setError] = useState('');

  const loadTables = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [tableResponse, restaurantResponse] = await Promise.all([
        api.get('/api/tables'),
        api.get('/api/restaurant/me'),
      ]);
      setTables(tableResponse.data.data || []);
      setRestaurant(restaurantResponse.data.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load tables.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTables(); }, [loadTables]);

  const createTable = async (event) => {
    event.preventDefault();
    setCreating(true);
    setError('');
    try {
      const { data } = await api.post('/api/tables', form);
      setTables((current) => [...current, data.data]);
      setForm({ tableName: '', tableNumber: '' });
      addToast('Table added', `${data.data.tableName} is ready for its QR code.`);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not create table.');
    } finally {
      setCreating(false);
    }
  };

  const tableUrl = useCallback((table) => {
    if (!table || !restaurant?.slug) return '';
    const url = new URL(`/guest-restaurant/${encodeURIComponent(restaurant.slug)}`, window.location.origin);
    url.searchParams.set('table', table.qrToken);
    return url.toString();
  }, [restaurant]);

  const qrUrl = useMemo(() => tableUrl(selectedTable), [selectedTable, tableUrl]);

  const copyLink = async () => {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(qrUrl);
      addToast('Link copied', 'This table link opens the restaurant menu.');
    } catch {
      addToast('Could not copy link', 'Your browser may not allow clipboard access.', 'error');
    } finally {
      setCopying(false);
    }
  };

  return (
    <section className="pt-section">
      <header className="pt-head">
        <div className="pt-head-copy">
          <h1 className="pt-title">Tables &amp; QR codes Management</h1>
          
        </div>
        <p className="pt-head-meta">{tables.length} {tables.length === 1 ? 'table' : 'tables'}</p>
      </header>

      {error && <p role="alert" className="pt-alert">{error}</p>}

      <form onSubmit={createTable} className="pt-panel pt-create-table">
        <div className="pt-panel-head pt-panel-head-inline">
          <h2>Add a table</h2>
        </div>
        <div className="pt-create-fields">
          <label className="pt-field">
            Table name
            <input value={form.tableName} onChange={(event) => setForm({ ...form, tableName: event.target.value })} maxLength={80} required className="form-input" placeholder="Terrace 1" />
          </label>
          <label className="pt-field">
            Table number
            <input value={form.tableNumber} onChange={(event) => setForm({ ...form, tableNumber: event.target.value })} required className="form-input" placeholder="04" />
          </label>
          <Button type="submit" loading={creating} loadingLabel="Adding table...">Add table</Button>
        </div>
      </form>

      {loading ? (
        <div role="status" aria-label="Loading tables" className="pt-table-grid">
          {[0, 1, 2].map((index) => <Skeleton key={index} className="h-40 w-full" />)}
        </div>
      ) : tables.length ? (
        <div className="pt-table-grid">
          {tables.map((table) => (
            <article key={table._id} className="pt-table-card">
              <div className="pt-table-info">
                <span className="pt-table-number" aria-hidden="true">{table.tableNumber}</span>
                <h2>{table.tableName}</h2>
              </div>
              <div className="pt-table-qr">
                {restaurant?.slug ? (
                  <QRCodeSVG value={tableUrl(table)} size={84} level="M" aria-label={`QR code for ${table.tableName}`} />
                ) : (
                  <span className="pt-qr-placeholder" aria-hidden="true" />
                )}
                <button type="button" className="pt-text-action" onClick={() => setSelectedTable(table)}>
                  View code
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="pt-empty pt-empty-block">No tables yet. Add one above and its code is ready to print.</p>
      )}

      <Dialog
        open={Boolean(selectedTable)}
        onClose={() => setSelectedTable(null)}
        title={`${selectedTable?.tableName || 'Table'} QR code`}
        className="qr-code-dialog pt-dialog"
        actions={
          <div className="pt-dialog-actions">
            <Button type="button" variant="secondary" onClick={() => window.print()}><Printer size={16} aria-hidden="true" /> Print QR code</Button>
            <Button type="button" onClick={copyLink} loading={copying} loadingLabel="Copying...">Copy table link</Button>
          </div>
        }
      >
        {selectedTable && (
          <div className="qr-print-area">
            {restaurant?.slug ? (
              <>
                <div className="pt-qr-print">
                  <QRCodeSVG value={qrUrl} size={208} level="H" aria-label={`QR code for ${selectedTable.tableName}`} />
                </div>
                <p className="qr-print-table-number mt-4 font-semibold text-black">Table {selectedTable.tableNumber}</p>
                <p className="qr-print-restaurant-name">{restaurant.name}</p>
                <div className="qr-screen-details">
                  <p className="mt-2 text-sm text-muted">{restaurant.name}</p>
                  <p className="mt-2 break-all text-xs text-muted">{qrUrl}</p>
                </div>
              </>
            ) : (
              <p role="alert" className="text-sm text-red-600">Restaurant link is unavailable, so this QR code cannot be generated.</p>
            )}
          </div>
        )}
      </Dialog>
    </section>
  );
}
