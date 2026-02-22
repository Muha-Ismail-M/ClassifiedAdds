import React from 'react';
import { format } from 'date-fns';

interface AdCardProps {
  ad: {
    id: string;
    store_name: string;
    title: string;
    description: string;
    country: string;
    category: string;
    image_url?: string;
    image_data?: string;
    created_at: string;
  };
}

const CATEGORY_INFO: Record<string, { label: string }> = {
  'electronics': { label: 'Electronics' },
  'fashion': { label: 'Fashion' },
  'home-garden': { label: 'Home & Garden' },
  'beauty': { label: 'Beauty' },
  'sports': { label: 'Sports' },
  'automotive': { label: 'Automotive' },
  'entertainment': { label: 'Entertainment' },
  'food-dining': { label: 'Food & Dining' },
  'travel': { label: 'Travel' },
  'services': { label: 'Services' },
  'real-estate': { label: 'Real Estate' },
  'jobs': { label: 'Jobs' },
  'education': { label: 'Education' },
  'health': { label: 'Health' },
  'pets': { label: 'Pets' },
  'other': { label: 'Other' },
};

export const AdCard: React.FC<AdCardProps> = ({ ad }) => {
  const categoryInfo = ad.category ? CATEGORY_INFO[ad.category] : null;
  const imageSource = ad.image_url || ad.image_data;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="aspect-[4/3] overflow-hidden bg-neutral-100">
        <img
          src={imageSource}
          alt={ad.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {categoryInfo && (
          <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-sm">
            <span>{categoryInfo.label}</span>
          </div>
        )}
      </div>
      
      <div className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {ad.country}
          </span>
          <span className="text-xs text-neutral-400">
            {format(new Date(ad.created_at), 'MMM d, yyyy')}
          </span>
        </div>

        <h3 className="mb-2 text-lg font-semibold text-neutral-900 line-clamp-1">
          {ad.title}
        </h3>
        
        <p className="mb-4 text-sm text-neutral-500 line-clamp-2">
          {ad.description}
        </p>

        <div className="flex items-center gap-2 border-t border-neutral-100 pt-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-xs font-medium text-white">
            {ad.store_name.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium text-neutral-700 line-clamp-1">
            {ad.store_name}
          </span>
        </div>
      </div>
    </div>
  );
};
