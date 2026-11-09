import { Link } from 'react-router-dom';
import logo from '../assets/logo';

export default function BrandLogo({ className = '', imageClassName = '' }) {
  return (
    <Link to="/" className={`brand-lockup ${className}`} aria-label="KazeMenu home">
      <span className="brand-symbol-crop" aria-hidden="true">
        <img src={logo} alt="KazeMenu logo" className={`brand-lockup-image ${imageClassName}`} />
      </span>
      <span className="brand-wordmark">KazeMenu</span>
    </Link>
  );
}
