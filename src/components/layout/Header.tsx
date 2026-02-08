import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/utils/cn';

export const Header: React.FC = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  if (isAdmin) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900">
            <svg
              className="h-5 w-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-xl font-semibold tracking-tight text-neutral-900">
            Classified Ads
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            to="/"
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition-all',
              location.pathname === '/'
                ? 'bg-neutral-100 text-neutral-900'
                : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
            )}
          >
            Browse Deals
          </Link>
          <Link
            to="/submit"
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition-all',
              location.pathname === '/submit'
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-900 text-white hover:bg-neutral-800'
            )}
          >
            Submit Your Ad
          </Link>
        </nav>
      </div>
    </header>
  );
};
