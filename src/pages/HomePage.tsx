import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getApprovedAds } from '@/lib/database';
import { AdCard } from '@/components/ui/AdCard';
import type { Ad } from '@/types';

export const HomePage: React.FC = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAds = () => {
      const approvedAds = getApprovedAds();
      setAds(approvedAds);
      setLoading(false);
    };
    loadAds();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,0,0,0.02)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(0,0,0,0.02)_0%,transparent_50%)]" />
        
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-sm text-neutral-600 shadow-sm">
              <span className="flex h-2 w-2">
                <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Global marketplace
            </div>
            
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-neutral-900 sm:text-6xl">
              Discover the{' '}
              <span className="relative">
                <span className="relative z-10">Latest Deals</span>
                <span className="absolute bottom-2 left-0 right-0 h-3 bg-neutral-200/60" />
              </span>{' '}
              Around the World
            </h1>
            
            <p className="mb-10 text-lg text-neutral-500 sm:text-xl">
              Browse exclusive promotional offers from trusted stores worldwide. 
              Find amazing deals curated just for you.
            </p>
            
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/submit"
                className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-neutral-900/20 transition-all hover:bg-neutral-800 hover:shadow-xl"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Submit Your Ad
              </Link>
              <a
                href="#deals"
                className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-6 py-3 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-50"
              >
                Browse Deals
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 14l-7 7-7-7M19 5l-7 7-7-7" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />
      </section>

      {/* Deals Section */}
      <section id="deals" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 sm:text-3xl">
              Latest Deals
            </h2>
            <p className="mt-1 text-neutral-500">
              {ads.length > 0 
                ? `Showing ${ads.length} approved ${ads.length === 1 ? 'deal' : 'deals'}`
                : 'No deals available yet'}
            </p>
          </div>
          
          {ads.length > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 shadow-sm border border-neutral-200">
              <svg
                className="h-4 w-4 text-neutral-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span className="text-sm text-neutral-600">Sorted by newest</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-900" />
          </div>
        ) : ads.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ads.map((ad) => (
              <AdCard key={ad.id} ad={ad} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-20 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
              <svg
                className="h-8 w-8 text-neutral-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-medium text-neutral-900">
              No deals yet
            </h3>
            <p className="mb-6 text-neutral-500">
              Be the first to submit a promotional ad for your store.
            </p>
            <Link
              to="/submit"
              className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-neutral-800"
            >
              Submit Your Ad
            </Link>
          </div>
        )}
      </section>
    </div>
  );
};
