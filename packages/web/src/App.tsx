import { Link, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Today } from './screens/Today';
import { Workout } from './screens/Workout';
import { Library } from './screens/Library';
import { ExerciseDetail } from './screens/ExerciseDetail';
import { History } from './screens/History';
import { Settings } from './screens/Settings';

/**
 * Three-tab shell (design study variant 1A).
 *
 * Library gets a permanent slot because learning the machines is a stated goal
 * of its own, not just a utility for building workouts.
 */
const TABS = [
  { to: '/', label: 'Today', glyph: '◎' },
  { to: '/library', label: 'Library', glyph: '☰' },
  { to: '/history', label: 'History', glyph: '◷' },
];

const TITLES: Record<string, string> = {
  '/': 'Today',
  '/library': 'Library',
  '/history': 'History',
  '/settings': 'Settings',
};

export function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const isDetail =
    location.pathname.startsWith('/library/') || location.pathname.startsWith('/workout/');
  const title = TITLES[location.pathname] ?? '';

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          {isDetail ? (
            <button
              type="button"
              className="btn ghost sm"
              onClick={() => navigate(-1)}
              aria-label="Go back"
            >
              ‹ Back
            </button>
          ) : (
            <div>
              <h1>{title || 'Gym Copilot'}</h1>
              {location.pathname === '/' && <p className="sub">{today}</p>}
            </div>
          )}

          {!isDetail && location.pathname !== '/settings' && (
            <Link to="/settings" className="btn ghost sm" aria-label="Settings">
              ⚙
            </Link>
          )}
        </div>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Today />} />
          <Route path="/workout/:id" element={<Workout />} />
          <Route path="/library" element={<Library />} />
          <Route path="/library/:id" element={<ExerciseDetail />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>

      <nav className="tabbar">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}
          >
            <span className="glyph" aria-hidden="true">
              {tab.glyph}
            </span>
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
