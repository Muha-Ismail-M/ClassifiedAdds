import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Footer: React.FC = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  if (isAdmin) return null;

  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900">
              <svg
                className="h-4 w-4 text-white"
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
            <span className="text-sm font-medium text-neutral-900">Classified Ads</span>
          </div>

          <div className="flex items-center gap-6 text-sm text-neutral-500">
            <Link to="/" className="transition-colors hover:text-neutral-900">
              Home
            </Link>
            <Link to="/submit" className="transition-colors hover:text-neutral-900">
              Submit Ad
            </Link>
          </div>

          <p className="text-sm text-neutral-400">
            © {new Date().getFullYear()} Classified Ads. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
