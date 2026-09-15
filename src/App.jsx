import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { LanguageProvider, ThemeProvider } from './context/LanguageContext';
import { ADMIN_ONLY } from './config';
import { startLockSync, stopLockSync, serverReachable, subscribeServer } from './utils/lockSync';
import { startTgLockPolling, stopTgLockPolling } from './utils/tgLockCommands';
import Navbar from './components/Navbar';
import Splash from './pages/Splash';

const Home = lazy(() => import('./pages/Home'));
const VIPBooking = lazy(() => import('./pages/VIPBooking'));
const TableBooking = lazy(() => import('./pages/TableBooking'));
const Admin = lazy(() => import('./pages/Admin'));

const ROUTES = ['home', 'vip', 'table', 'admin'];

function pageFromHash() {
  const h = window.location.hash.replace(/^#\/?/, '').split(/[?#]/)[0].trim().toLowerCase();
  return ROUTES.includes(h) ? h : 'home';
}

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center dark:bg-gray-950 bg-stone-50">
      <div className="w-10 h-10 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
    </div>
  );
}

function AppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const [page, setPage] = useState(() => (ADMIN_ONLY ? 'admin' : pageFromHash()));

  useEffect(() => {
    startLockSync();
    const check = (online = serverReachable()) => {
      if (online) stopTgLockPolling();
      else startTgLockPolling();
    };
    check();
    const unsub = subscribeServer(check);
    return () => {
      unsub();
      stopLockSync();
      stopTgLockPolling();
    };
  }, []);

  useEffect(() => {
    if (ADMIN_ONLY) return;
    const onHash = () => setPage(pageFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const handleSplash = useCallback(() => setShowSplash(false), []);

  const navigate = useCallback((p) => {
    if (!ADMIN_ONLY) {
      if (p === 'home') {
        if (window.location.hash) {
          history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      } else {
        window.location.hash = `/${p}`;
      }
    }
    setPage(p);
    window.scrollTo(0, 0);
  }, []);

  if (ADMIN_ONLY) {
    return (
      <div className="min-h-screen dark:bg-gray-950 bg-stone-50 dark:text-gray-100 text-gray-900 pb-16 md:pb-0 transition-colors duration-200">
        <Suspense fallback={<PageLoader />}>
          <Admin />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="min-h-screen dark:bg-gray-950 bg-stone-50 dark:text-gray-100 text-gray-900 pb-16 md:pb-0 transition-colors duration-200">
      {showSplash ? (
        <Splash onEnter={handleSplash} />
      ) : (
        <>
          <Navbar current={page} onNavigate={navigate} />
          <main>
            <Suspense fallback={<PageLoader />}>
              {page === 'home' && <Home onNavigate={navigate} />}
              {page === 'vip' && <VIPBooking />}
              {page === 'table' && <TableBooking />}
              {page === 'admin' && <Admin />}
            </Suspense>
          </main>
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AppContent />
        <Analytics />
      </ThemeProvider>
    </LanguageProvider>
  );
}
