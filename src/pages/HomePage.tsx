import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getApprovedAds } from '@/lib/database';
import { AdCard } from '@/components/ui/AdCard';
import type { Ad, AdCategory } from '@/types';
import { cn } from '@/utils/cn';

type SortOption = 'newest' | 'oldest' | 'title-asc' | 'title-desc' | 'store-asc' | 'store-desc';

const CATEGORIES: { value: AdCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Categories' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'home-garden', label: 'Home & Garden' },
  { value: 'beauty', label: 'Beauty' },
  { value: 'sports', label: 'Sports' },
  { value: 'automotive', label: 'Automotive' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'food-dining', label: 'Food & Dining' },
  { value: 'travel', label: 'Travel' },
  { value: 'services', label: 'Services' },
  { value: 'real-estate', label: 'Real Estate' },
  { value: 'jobs', label: 'Jobs' },
  { value: 'education', label: 'Education' },
  { value: 'health', label: 'Health' },
  { value: 'pets', label: 'Pets' },
  { value: 'other', label: 'Other' },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'title-asc', label: 'Title (A-Z)' },
  { value: 'title-desc', label: 'Title (Z-A)' },
  { value: 'store-asc', label: 'Store (A-Z)' },
  { value: 'store-desc', label: 'Store (Z-A)' },
];

export const HomePage: React.FC = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<AdCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const loadAds = async () => {
      try {
        const approvedAds = await getApprovedAds();
        setAds(approvedAds);
      } catch (error) {
        console.error('Failed to load ads:', error);
      } finally {
        setLoading(false);
      }
    };
    loadAds();
  }, []);

  const filteredAndSortedAds = useMemo(() => {
    let result = [...ads];

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter((ad) => ad.category === selectedCategory);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        case 'store-asc':
          return a.store_name.localeCompare(b.store_name);
        case 'store-desc':
          return b.store_name.localeCompare(a.store_name);
        default:
          return 0;
      }
    });

    return result;
  }, [ads, selectedCategory, sortBy]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: ads.length };
    ads.forEach((ad) => {
      if (ad.category) {
        counts[ad.category] = (counts[ad.category] || 0) + 1;
      }
    });
    return counts;
  }, [ads]);

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
        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 sm:text-3xl">
                Latest Deals
              </h2>
              <p className="mt-1 text-neutral-500">
                {filteredAndSortedAds.length > 0 
                  ? `Showing ${filteredAndSortedAds.length} ${filteredAndSortedAds.length === 1 ? 'deal' : 'deals'}${selectedCategory !== 'all' ? ` in ${CATEGORIES.find(c => c.value === selectedCategory)?.label}` : ''}`
                  : 'No deals available yet'}
              </p>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all",
                showFilters
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
              )}
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
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              Filters & Sort
              {selectedCategory !== 'all' && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs">
                  1
                </span>
              )}
            </button>
          </div>

          {/* Filters Panel */}
          <div className={cn(
            "mt-6 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-lg transition-all duration-300",
            showFilters ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0 border-transparent"
          )}>
            <div className="p-6">
              {/* Category Filters */}
              <div className="mb-6">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-neutral-900">
                  <svg
                    className="h-4 w-4 text-neutral-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                  Filter by Category
                </h3>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => {
                    const count = categoryCounts[cat.value] || 0;
                    const isActive = selectedCategory === cat.value;
                    return (
                      <button
                        key={cat.value}
                        onClick={() => setSelectedCategory(cat.value)}
                        disabled={cat.value !== 'all' && count === 0}
                        className={cn(
                          "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all",
                          isActive
                            ? "bg-neutral-900 text-white"
                            : cat.value !== 'all' && count === 0
                            ? "bg-neutral-50 text-neutral-300 cursor-not-allowed"
                            : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                        )}
                      >
                        <span>{cat.label}</span>
                        {count > 0 && (
                          <span className={cn(
                            "rounded-full px-1.5 py-0.5 text-xs",
                            isActive ? "bg-white/20" : "bg-neutral-200"
                          )}>
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-neutral-900">
                  <svg
                    className="h-4 w-4 text-neutral-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="4" y1="6" x2="16" y2="6" />
                    <line x1="4" y1="12" x2="12" y2="12" />
                    <line x1="4" y1="18" x2="8" y2="18" />
                    <polyline points="15 15 18 18 21 15" />
                    <line x1="18" y1="12" x2="18" y2="18" />
                  </svg>
                  Sort By
                </h3>
                <div className="flex flex-wrap gap-2">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={cn(
                        "rounded-lg px-4 py-2 text-sm font-medium transition-all",
                        sortBy === option.value
                          ? "bg-neutral-900 text-white"
                          : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Filters Summary */}
              {(selectedCategory !== 'all' || sortBy !== 'newest') && (
                <div className="mt-6 flex items-center justify-between border-t border-neutral-100 pt-4">
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <span>Active filters:</span>
                    {selectedCategory !== 'all' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-neutral-900 px-2.5 py-1 text-xs text-white">
                        {CATEGORIES.find(c => c.value === selectedCategory)?.label}
                        <button
                          onClick={() => setSelectedCategory('all')}
                          className="ml-1 rounded-full hover:bg-white/20"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 rounded-full bg-neutral-200 px-2.5 py-1 text-xs text-neutral-700">
                      {SORT_OPTIONS.find(s => s.value === sortBy)?.label}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSortBy('newest');
                    }}
                    className="text-sm font-medium text-neutral-500 hover:text-neutral-900"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Category Pills (Always visible) */}
        {!showFilters && ads.length > 0 && (
          <div className="mb-8 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.slice(0, 8).map((cat) => {
              const count = categoryCounts[cat.value] || 0;
              const isActive = selectedCategory === cat.value;
              if (cat.value !== 'all' && count === 0) return null;
              return (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all",
                    isActive
                      ? "bg-neutral-900 text-white shadow-md"
                      : "bg-white text-neutral-700 border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
                  )}
                >
                  <span>{cat.label}</span>
                </button>
              );
            })}
            {ads.length > 0 && (
              <button
                onClick={() => setShowFilters(true)}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-dashed border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-500 transition-all hover:border-neutral-400 hover:text-neutral-700"
              >
                <span>More filters...</span>
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-900" />
          </div>
        ) : filteredAndSortedAds.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedAds.map((ad) => (
              <AdCard key={ad.id} ad={ad} />
            ))}
          </div>
        ) : ads.length > 0 ? (
          // No results for current filter
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
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-medium text-neutral-900">
              No deals found
            </h3>
            <p className="mb-6 text-neutral-500">
              No deals match your current filters. Try adjusting your selection.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSortBy('newest');
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-neutral-800"
            >
              Clear Filters
            </button>
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
