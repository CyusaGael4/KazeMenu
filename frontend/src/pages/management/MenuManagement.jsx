import { useCallback, useEffect, useState } from 'react';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../hooks/useToast';
import { getImageUploadError, MAX_IMAGE_UPLOAD_LABEL } from '../../utils/imageUpload';
import { getImageUrl } from '../../utils/imageUrl';
import usePageMeta from '../../hooks/usePageMeta';

export default function MenuManagement() {
  const { addToast } = useToast();
  usePageMeta({
    title: 'Menu management',
    description: 'Add categories and dishes, upload photos and control availability in your KazeMenu restaurant menu.',
    noIndex: true,
  });
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [item, setItem] = useState({ categoryId: '', name: '', description: '', price: '', image: '' });
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState('');
  const [error, setError] = useState('');

  const loadMenu = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [categoryResponse, itemResponse] = await Promise.all([
        api.get('/api/menu/categories'),
        api.get('/api/menu/items'),
      ]);
      setCategories(categoryResponse.data.data || []);
      setItems(itemResponse.data.data || []);
      setItem((current) => ({ ...current, categoryId: current.categoryId || categoryResponse.data.data?.[0]?._id || '' }));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to load menu data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadMenu(); }, [loadMenu]);

  const addCategory = async (event) => {
    event.preventDefault();
    if (!categoryName.trim()) return;
    setBusyAction('category');
    setError('');
    try {
      const { data } = await api.post('/api/menu/categories', { name: categoryName.trim() });
      setCategories((current) => [...current, data.data]);
      setItem((current) => ({ ...current, categoryId: current.categoryId || data.data._id }));
      setCategoryName('');
      addToast('Category added', data.data.name);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not add the category.');
    } finally {
      setBusyAction('');
    }
  };

  const uploadItemImage = async (file) => {
    const validationError = getImageUploadError(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    const formData = new FormData();
    formData.append('image', file);
    setBusyAction('item-image');
    setError('');
    try {
      const { data } = await api.post('/api/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setItem((current) => ({ ...current, image: data.data.url }));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Image upload failed. Try again.');
    } finally {
      setBusyAction('');
    }
  };

  const addItem = async (event) => {
    event.preventDefault();
    if (busyAction) return;
    setBusyAction('item');
    setError('');
    try {
      const { data } = await api.post('/api/menu/items', {
        ...item,
        price: Number(item.price),
      });
      setItems((current) => [data.data, ...current]);
      setItem((current) => ({ ...current, name: '', description: '', price: '', image: '' }));
      addToast('Menu item added', data.data.name);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not add the menu item.');
    } finally {
      setBusyAction('');
    }
  };

  const toggleAvailability = async (menuItem) => {
    const action = `availability-${menuItem._id}`;
    setBusyAction(action);
    try {
      const { data } = await api.patch(`/api/menu/items/${menuItem._id}/availability`, {
        isAvailable: !menuItem.isAvailable,
      });
      setItems((current) => current.map((entry) => entry._id === menuItem._id ? data.data : entry));
      addToast('Availability updated', `${menuItem.name} is now ${data.data.isAvailable ? 'available' : 'unavailable'}.`);
    } catch (requestError) {
      addToast('Could not update availability', requestError.response?.data?.message || 'Please try again.', 'error');
    } finally {
      setBusyAction('');
    }
  };

  return (
    <section className="pt-section">
      <header className="pt-head">
        <div className="pt-head-copy">
          <h1 className="pt-title">Menu Management</h1>
          
        </div>
      </header>

      {error && <p role="alert" className="pt-alert">{error}</p>}

      <div className="pt-two-col">
        <div className="pt-col-stack">
          <section className="pt-panel">
            <div className="pt-panel-head">
              <h2>Categories</h2>
              <span>{categories.length}</span>
            </div>
            <form onSubmit={addCategory} className="pt-inline-form">
              <label className="pt-field">
                <span className="sr-only">Category name</span>
                <input
                  value={categoryName}
                  onChange={(event) => setCategoryName(event.target.value)}
                  placeholder="Category name"
                  maxLength={80}
                  required
                  className="form-input"
                />
              </label>
              <Button type="submit" loading={busyAction === 'category'} loadingLabel="Adding...">Add</Button>
            </form>
            {loading ? (
              <div role="status" aria-label="Loading categories" className="pt-skeletons">
                <Skeleton className="h-4 w-2/3" /><Skeleton className="h-4 w-1/2" />
              </div>
            ) : categories.length ? (
              <ol className="pt-categories">
                {categories.map((category, index) => (
                  <li key={category._id}>
                    <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                    {category.name}
                  </li>
                ))}
              </ol>
            ) : <p className="pt-empty">Add a category before you add a dish.</p>}
          </section>

          <section className="pt-panel">
            <div className="pt-panel-head">
              <h2>Add a dish</h2>
            </div>
            <form onSubmit={addItem} className="pt-form">
              <label className="pt-field">
                Category
                <select value={item.categoryId} onChange={(event) => setItem({ ...item, categoryId: event.target.value })} required className="form-input">
                  <option value="">Select a category</option>
                  {categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}
                </select>
              </label>
              <label className="pt-field">
                Dish name
                <input value={item.name} onChange={(event) => setItem({ ...item, name: event.target.value })} maxLength={120} required className="form-input" />
              </label>
              <label className="pt-field">
                Description
                <textarea value={item.description} onChange={(event) => setItem({ ...item, description: event.target.value })} maxLength={500} className="form-input pt-textarea" />
              </label>
              <div className="pt-field">
                <label htmlFor="menu-item-image">Photo</label>
                <input
                  id="menu-item-image"
                  type="file"
                  accept="image/*"
                  aria-describedby="menu-item-image-help"
                  disabled={Boolean(busyAction)}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) uploadItemImage(file);
                    event.target.value = '';
                  }}
                  className="media-upload"
                />
                <p id="menu-item-image-help" className="pt-help">Maximum file size: {MAX_IMAGE_UPLOAD_LABEL}.</p>
                {busyAction === 'item-image' && <p className="pt-help" role="status">Uploading image...</p>}
                {item.image && <img src={getImageUrl(item.image)} alt="Menu item preview" className="media-image-preview pt-photo" />}
              </div>
              <label className="pt-field">
                Price (RWF)
                <input type="number" min="0" step="1" value={item.price} onChange={(event) => setItem({ ...item, price: event.target.value })} required className="form-input" />
              </label>
              <Button type="submit" loading={busyAction === 'item'} loadingLabel="Saving dish..." disabled={!categories.length || busyAction === 'item-image'}>
                Save dish
              </Button>
            </form>
          </section>
        </div>

        <section className="pt-panel">
          <div className="pt-panel-head">
            <h2>Dishes</h2>
            <span>{items.length}</span>
          </div>
          {loading ? (
            <div role="status" aria-label="Loading menu items" className="pt-skeletons">
              {[0, 1, 2].map((row) => (
                <div key={row} className="pt-skeleton-row">
                  <Skeleton className="h-12 w-12" />
                  <div><Skeleton className="h-4 w-40" /><Skeleton className="mt-2 h-3 w-56" /></div>
                </div>
              ))}
            </div>
          ) : items.length ? (
            <ul className="pt-dishes">
              {items.map((menuItem) => {
                const busy = busyAction === `availability-${menuItem._id}`;
                return (
                  <li key={menuItem._id}>
                    {menuItem.image
                      ? <img src={getImageUrl(menuItem.image)} alt={`Photo of ${menuItem.name}`} className="pt-dish-photo" loading="lazy" />
                      : <span className="pt-dish-photo pt-dish-photo-empty" aria-hidden="true" />}
                    <div className="pt-dish-body">
                      <h3>{menuItem.name}</h3>
                      {menuItem.description && <p>{menuItem.description}</p>}
                      <strong>{new Intl.NumberFormat('en-US').format(menuItem.price)} RWF</strong>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={menuItem.isAvailable}
                      aria-label={`${menuItem.name} availability`}
                      disabled={busy}
                      onClick={() => toggleAvailability(menuItem)}
                      className={`pt-toggle ${menuItem.isAvailable ? 'pt-toggle-on' : ''}`}
                    >
                      <span className="pt-toggle-track" aria-hidden="true"><i /></span>
                      <span className="pt-toggle-label">{busy ? 'Saving' : menuItem.isAvailable ? 'Available' : 'Sold out'}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : <p className="pt-empty">Dishes you add will appear here, in the order guests see them.</p>}
        </section>
      </div>
    </section>
  );
}
