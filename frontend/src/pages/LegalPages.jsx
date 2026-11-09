import { Link, useLocation } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta';

function LegalPage({ title, description, updatedAt, children }) {
  const { state } = useLocation();
  usePageMeta({ title, description });

  return (
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
      <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-black">{title}</h1>
      <p className="mt-3 text-sm text-muted">Last updated: {updatedAt}</p>
      <div className="legal-content mt-10">{children}</div>
    </article>
  );
}

export function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      description="The rules for using KazeMenu, including restaurant accounts, content, order responsibilities and acceptable use."
      updatedAt="November 7, 2026"
    >
      <p>These Terms & Conditions describe the basic rules for using KazeMenu. By creating an account or using the restaurant tools, you agree to these terms.</p>
      <h2>Using KazeMenu</h2>
      <p>KazeMenu provides tools for restaurants to manage digital menus, tables, QR links and dine-in orders. You must use the service lawfully and keep your account credentials secure.</p>
      <h2>Restaurant accounts and content</h2>
      <p>You are responsible for the accuracy and legality of the restaurant details, menu descriptions, prices, images and other content you provide. You must have the rights needed to upload and display that content. Keep menu availability and pricing current.</p>
      <h2>Orders and restaurant operations</h2>
      <p>Restaurants are responsible for reviewing and fulfilling orders, communicating with guests, and meeting applicable food safety, consumer protection and business requirements. KazeMenu is a software service and does not prepare, sell or deliver restaurant food.</p>
      <h2>Acceptable use</h2>
      <p>Do not misuse the service, interfere with its operation, attempt unauthorized access, upload unlawful content, or use the platform to deceive or harm guests or other users.</p>
      <h2>Availability and changes</h2>
      <p>We may maintain, update or change the service. We will make reasonable efforts to keep it available, but uninterrupted operation cannot be guaranteed. We may suspend access when needed to protect users, the service or comply with law.</p>
      <h2>Contact</h2>
      <p>For questions about these terms, contact the KazeMenu support team through the contact details provided on the website.</p>
      <p className="legal-related-link">Read the <Link to="/privacy">Privacy Policy</Link>.</p>
    </LegalPage>
  );
}

export function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      description="How KazeMenu uses restaurant account, menu, table and order information to provide its menu and dine-in ordering features."
      updatedAt="November 7, 2026"
    >
      <p>This policy explains how KazeMenu uses information needed to provide restaurant management and guest ordering features.</p>
      <h2>Information used</h2>
      <p>Depending on how you use the service, information may include account and sign-in details, restaurant profile and menu content, table and order details, and information guests submit with an order.</p>
      <h2>How information is used</h2>
      <p>We use information to authenticate users, operate restaurant workspaces, display menus, route and manage orders, provide support, maintain security and improve the service.</p>
      <h2>Sharing and service providers</h2>
      <p>Information is processed by KazeMenu and the providers needed to host, secure and operate the service. We do not make restaurant or guest data public except where it is necessary to provide the menu and ordering features or where required by law.</p>
      <h2>Retention and security</h2>
      <p>Information is kept for as long as needed to provide the service, meet operational needs and comply with legal obligations. We use reasonable safeguards, but no online service can guarantee absolute security.</p>
      <h2>Your choices</h2>
      <p>Restaurant account holders can update restaurant information through the management workspace. Guests should contact the restaurant about details submitted with an order. Contact KazeMenu support for account or privacy questions.</p>
      <p className="legal-related-link">Read the <Link to="/terms">Terms & Conditions</Link>.</p>
    </LegalPage>
  );
}

export function NotFoundPage() {
  usePageMeta({
    title: 'Page not found',
    description: 'The page you are looking for could not be found. Return to KazeMenu or explore the restaurant features.',
    noIndex: true,
  });

  return (
    <section className="mx-auto flex min-h-[55vh] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
      <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-black">We can’t find that page.</h1>
      <p className="mt-4 max-w-xl leading-7 text-muted">The link may be incorrect, or the page may have moved. Return home or explore the restaurant features.</p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link to="/" className="button-control button-primary inline-flex items-center justify-center">Go to home</Link>
        <Link to="/features" className="button-control button-secondary inline-flex items-center justify-center">Explore features</Link>
      </div>
    </section>
  );
}
