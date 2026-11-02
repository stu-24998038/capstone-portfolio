import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export default function SiteLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="fixed left-4 top-3 z-[200] -translate-y-20 rounded-full bg-ink px-4 py-2 text-sm text-cream transition focus:translate-y-0"
      >
        Skip to content
      </a>
      <Header />
      <main id="main" tabIndex="-1" className="flex-1 outline-none">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
