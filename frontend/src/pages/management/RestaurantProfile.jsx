import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { useToast } from '../../hooks/useToast';
import usePageMeta from '../../hooks/usePageMeta';
import api from '../../services/api';

const emptyProfile = {
  name: '',
  phone: '',
  email: '',
};

const profileFields = [
  { key: 'name', label: 'Restaurant name', required: true },
  { key: 'phone', label: 'Phone number', type: 'tel', autoComplete: 'tel' },
  { key: 'email', label: 'Contact email', type: 'email', autoComplete: 'email' },
];

export default function RestaurantProfile() {
  const { restaurant, setRestaurant } = useOutletContext();
  const { toastSuccess, toastError } = useToast();
  usePageMeta({
    title: 'Restaurant profile',
    description: 'Update the restaurant details guests see on your KazeMenu menu.',
    noIndex: true,
  });
  const [form, setForm] = useState(emptyProfile);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (restaurant) {
      setForm({
        ...emptyProfile,
        ...Object.fromEntries(Object.keys(emptyProfile).map((key) => [key, restaurant[key] || ''])),
      });
    }
  }, [restaurant]);

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setError('');
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    if (loading || !form.name.trim()) return;

    setLoading(true);
    setError('');
    try {
      const { data } = await api.put('/api/restaurant/me', {
        ...form,
        name: form.name.trim(),
        currency: 'RWF',
      });
      setRestaurant(data.data);
      toastSuccess('Profile saved', 'Your restaurant information has been updated.');
    } catch (requestError) {
      const message = requestError.response?.data?.message || 'Could not save your profile. Try again.';
      setError(message);
      toastError('Could not save profile', message);
    } finally {
      setLoading(false);
    }
  };

  if (!restaurant) {
    return <p role="status" className="pt-empty">Loading restaurant profile...</p>;
  }

  return (
    <section className="pt-section">
      <header className="pt-head">
        <div className="pt-head-copy">
          <h1 className="pt-title">Restaurant Profile Settings</h1>
          
        </div>
      </header>

      <div className="pt-two-col pt-two-col-narrow">
        <form className="pt-panel pt-form" onSubmit={saveProfile}>
          {error && <p className="pt-alert" role="alert">{error}</p>}

          {profileFields.map(({ key, label, type = 'text', placeholder, autoComplete, required }) => (
            <label key={key} className="pt-field">
              {label}
              <input
                type={type}
                value={form[key]}
                onChange={(event) => updateField(key, event.target.value)}
                placeholder={placeholder}
                autoComplete={autoComplete}
                required={required}
                maxLength={key === 'name' ? 120 : undefined}
                className="form-input"
              />
            </label>
          ))}

          <div className="pt-form-foot">
            <Button type="submit" loading={loading} loadingLabel="Saving..." disabled={loading || !form.name.trim()}>
              Save profile
            </Button>
            <span className="pt-help">Changes apply to the guest menu immediately.</span>
          </div>
        </form>

        <aside className="pt-panel pt-preview" aria-label="Guest preview">
          <div className="pt-panel-head">
            <h2>Guests see this</h2>
          </div>
          <p className="pt-preview-name">{form.name.trim() || 'Your restaurant'}</p>
          <dl className="pt-facts">
            <div><dt>Phone</dt><dd>{form.phone || 'Not set'}</dd></div>
            <div><dt>Email</dt><dd>{form.email || 'Not set'}</dd></div>
            <div><dt>Currency</dt><dd>RWF</dd></div>
            <div><dt>Menu link</dt><dd>{restaurant.slug ? `/guest-restaurant/${restaurant.slug}` : 'Created with your account'}</dd></div>
          </dl>
          <p className="pt-help">
            Ordering is handled from the table codes in Tables &amp; QR. This page is only what guests read about the restaurant.
          </p>
        </aside>
      </div>
    </section>
  );
}
