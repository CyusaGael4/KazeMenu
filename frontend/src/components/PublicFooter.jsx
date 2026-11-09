import { Link, useLocation } from 'react-router-dom';
import { Facebook, Instagram, Linkedin, Mail } from 'lucide-react';
import BrandLogo from './BrandLogo';

const links = [
  ['Home', '/'],
  ['How It Works', '/how-it-works'],
  ['Sample Menu', '/demo-menu'],
  ['Features', '/features'],
  ['FAQ', '/faq'],
];

export default function PublicFooter() {
  const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL;
  const { pathname } = useLocation();

  return (
    <footer className="brand-footer">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <BrandLogo className="footer-brand" />
          <p className="mt-4 max-w-sm text-sm leading-6 text-black/75">
            Digital dine-in ordering that helps restaurants serve guests with ease.
          </p>
        </div>
        <div>
          <h2 className="font-bold text-black">Explore</h2>
          <nav className="mt-4 grid gap-y-3 text-sm" aria-label="Footer navigation">
            {links.filter(([, to]) => to !== pathname).map(([label, to]) => <Link key={to} to={to} className="footer-link">{label}</Link>)}
          </nav>
        </div>
        <div>
          <h2 className="font-bold text-black">Get in touch</h2>
          <p className="mt-4 text-sm leading-6 text-black/75">
            Questions about bringing KazeMenu to your restaurant?
          </p>
          {supportEmail && (
            <a href={`mailto:${supportEmail}`} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-black underline underline-offset-4">
              <Mail size={16} /> {supportEmail}
            </a>
          )}
          <div className="footer-social-icons" aria-label="Social media">
            <span title="Instagram coming soon" aria-label="Instagram coming soon"><Instagram size={18} aria-hidden="true" /></span>
            <span title="Facebook coming soon" aria-label="Facebook coming soon"><Facebook size={18} aria-hidden="true" /></span>
            <span title="LinkedIn coming soon" aria-label="LinkedIn coming soon"><Linkedin size={18} aria-hidden="true" /></span>
          </div>
        </div>
      </div>
      <div className="border-t border-black/15">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-xs text-black/70 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>© {new Date().getFullYear()} KazeMenu. All rights reserved.</p>
          <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Legal links">
            <Link to="/privacy" className="footer-link footer-legal-link">Privacy</Link>
            <Link to="/terms" className="footer-link footer-legal-link">Terms &amp; conditions</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
