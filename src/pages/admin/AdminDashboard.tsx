import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { 
  getPendingAds, 
  getApprovedAds, 
  approveAd, 
  deleteAd,
  changeAdminPassword,
  exportAllData,
  importAds,
  clearAllAds,
  getDatabaseStats
} from '@/lib/database';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Ad, AdCategory, AdDuration } from '@/types';
import { cn } from '@/utils/cn';

type TabType = 'pending' | 'approved' | 'settings' | 'data';

const CATEGORY_INFO: Record<AdCategory, { label: string }> = {
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

const DURATION_LABELS: Record<AdDuration, string> = {
  '1-week': '1 Week',
  '2-weeks': '2 Weeks',
  '1-month': '1 Month',
  '2-months': '2 Months',
  '3-months': '3 Months',
};

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [pendingAds, setPendingAds] = useState<Ad[]>([]);
  const [approvedAds, setApprovedAds] = useState<Ad[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const { logout, checkAuth } = useAuth();
  const navigate = useNavigate();

  const loadAds = useCallback(async () => {
    setLoading(true);
    try {
      const [pending, approved] = await Promise.all([
        getPendingAds(),
        getApprovedAds()
      ]);
      setPendingAds(pending);
      setApprovedAds(approved);
    } catch (error) {
      console.error('Failed to load ads:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!checkAuth()) {
      navigate('/admin/login');
      return;
    }
    loadAds();
  }, [checkAuth, navigate, loadAds]);

  const handleApprove = async (id: string) => {
    const success = await approveAd(id);
    if (success) {
      await loadAds();
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this ad?')) {
      const success = await deleteAd(id);
      if (success) {
        await loadAds();
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const tabs = [
    { id: 'pending' as const, label: 'Pending Ads', count: pendingAds.length, icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    )},
    { id: 'approved' as const, label: 'Approved Ads', count: approvedAds.length, icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    )},
    { id: 'data' as const, label: 'Data Management', icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>
    )},
    { id: 'settings' as const, label: 'Settings', icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    )},
  ];

  return (
    <div className="flex min-h-screen bg-neutral-100">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-neutral-900 transition-transform lg:static lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
            <svg
              className="h-4 w-4 text-neutral-900"
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
          <span className="text-lg font-semibold text-white">Admin Panel</span>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-all",
                activeTab === tab.id
                  ? "bg-white text-neutral-900"
                  : "text-neutral-400 hover:bg-white/10 hover:text-white"
              )}
            >
              {tab.icon}
              <span className="flex-1">{tab.label}</span>
              {tab.count !== undefined && (
                <span className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-medium",
                  activeTab === tab.id
                    ? "bg-neutral-100 text-neutral-600"
                    : "bg-white/10 text-neutral-400"
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-400 transition-all hover:bg-red-500/10"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 text-white shadow-lg lg:hidden"
      >
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {sidebarOpen ? (
            <path d="M18 6L6 18M6 6l12 12" />
          ) : (
            <>
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </>
          )}
        </svg>
      </button>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-6">
          <h1 className="text-xl font-semibold text-neutral-900">
            {tabs.find((t) => t.id === activeTab)?.label}
          </h1>
          <button
            onClick={loadAds}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-200 disabled:opacity-50"
          >
            <svg
              className={cn("h-4 w-4", loading && "animate-spin")}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M23 4v6h-6" />
              <path d="M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Refresh
          </button>
        </header>

        <div className="p-6">
          {activeTab === 'pending' && (
            <PendingAdsSection ads={pendingAds} onApprove={handleApprove} onDelete={handleDelete} loading={loading} />
          )}
          {activeTab === 'approved' && (
            <ApprovedAdsSection ads={approvedAds} onDelete={handleDelete} loading={loading} />
          )}
          {activeTab === 'data' && (
            <DataManagementSection onDataChange={loadAds} />
          )}
          {activeTab === 'settings' && (
            <SettingsSection />
          )}
        </div>
      </main>
    </div>
  );
};

const PendingAdsSection: React.FC<{
  ads: Ad[];
  onApprove: (id: string) => void;
  onDelete: (id: string) => void;
  loading: boolean;
}> = ({ ads, onApprove, onDelete, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-900" />
      </div>
    );
  }

  if (ads.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100">
          <svg
            className="h-6 w-6 text-neutral-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <h3 className="mb-1 text-lg font-medium text-neutral-900">No pending ads</h3>
        <p className="text-neutral-500">All ads have been reviewed</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {ads.map((ad) => (
        <AdListItem
          key={ad.id}
          ad={ad}
          actions={
            <>
              <Button
                size="sm"
                variant="success"
                onClick={() => onApprove(ad.id)}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => onDelete(ad.id)}
              >
                Reject
              </Button>
            </>
          }
        />
      ))}
    </div>
  );
};

const ApprovedAdsSection: React.FC<{
  ads: Ad[];
  onDelete: (id: string) => void;
  loading: boolean;
}> = ({ ads, onDelete, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-900" />
      </div>
    );
  }

  if (ads.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100">
          <svg
            className="h-6 w-6 text-neutral-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h3 className="mb-1 text-lg font-medium text-neutral-900">No approved ads</h3>
        <p className="text-neutral-500">Approved ads will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {ads.map((ad) => (
        <AdListItem
          key={ad.id}
          ad={ad}
          showApprovedBadge
          actions={
            <Button
              size="sm"
              variant="danger"
              onClick={() => onDelete(ad.id)}
            >
              Delete
            </Button>
          }
        />
      ))}
    </div>
  );
};

const AdListItem: React.FC<{
  ad: Ad;
  showApprovedBadge?: boolean;
  actions: React.ReactNode;
}> = ({ ad, showApprovedBadge, actions }) => {
  const [expanded, setExpanded] = useState(false);
  const categoryInfo = ad.category ? CATEGORY_INFO[ad.category] : null;
  const durationLabel = ad.duration ? DURATION_LABELS[ad.duration] : null;

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div
        className="flex cursor-pointer items-center gap-4 p-4"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100">
          <img
            src={ad.image_data}
            alt={ad.title}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="truncate font-semibold text-neutral-900">{ad.title}</h3>
            {showApprovedBadge && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Approved
              </span>
            )}
            {categoryInfo && (
              <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
                {categoryInfo.label}
              </span>
            )}
          </div>
          <p className="truncate text-sm text-neutral-500">{ad.store_name} • {ad.country}</p>
          <p className="text-xs text-neutral-400">
            {format(new Date(ad.created_at), 'MMM d, yyyy • h:mm a')}
            {durationLabel && <span className="ml-2">• Duration: {durationLabel}</span>}
          </p>
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {actions}
        </div>

        <svg
          className={cn(
            "h-5 w-5 text-neutral-400 transition-transform",
            expanded && "rotate-180"
          )}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {expanded && (
        <div className="border-t border-neutral-100 bg-neutral-50 p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <img
                src={ad.image_data}
                alt={ad.title}
                className="w-full rounded-lg"
              />
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium uppercase text-neutral-400">Description</label>
                <p className="text-sm text-neutral-700">{ad.description}</p>
              </div>
              <div>
                <label className="text-xs font-medium uppercase text-neutral-400">Contact Email</label>
                <p className="text-sm text-neutral-700">{ad.email}</p>
              </div>
              <div>
                <label className="text-xs font-medium uppercase text-neutral-400">Store Name</label>
                <p className="text-sm text-neutral-700">{ad.store_name}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium uppercase text-neutral-400">Country</label>
                  <p className="text-sm text-neutral-700">{ad.country}</p>
                </div>
                <div>
                  <label className="text-xs font-medium uppercase text-neutral-400">Category</label>
                  <p className="text-sm text-neutral-700">
                    {categoryInfo ? categoryInfo.label : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium uppercase text-neutral-400">Duration</label>
                  <p className="text-sm text-neutral-700">{durationLabel || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium uppercase text-neutral-400">Expires</label>
                  <p className="text-sm text-neutral-700">
                    {ad.expires_at ? format(new Date(ad.expires_at), 'MMM d, yyyy') : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DataManagementSection: React.FC<{ onDataChange: () => void }> = ({ onDataChange }) => {
  const [stats, setStats] = useState<{
    totalAds: number;
    pendingAds: number;
    approvedAds: number;
    expiredAds: number;
    categoryCounts: Record<string, number>;
  } | null>(null);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const data = await getDatabaseStats();
    setStats(data);
  };

  const handleExport = async () => {
    setExporting(true);
    setMessage(null);
    try {
      const data = await exportAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `classified-ads-backup-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setMessage({ type: 'success', text: 'Data exported successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to export data.' });
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setMessage(null);

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (!data.ads || !Array.isArray(data.ads)) {
        throw new Error('Invalid backup file format');
      }

      const count = await importAds(data.ads, true);
      setMessage({ type: 'success', text: `Successfully imported ${count} ads!` });
      onDataChange();
      loadStats();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to import data. Please check the file format.' });
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to delete ALL ads? This action cannot be undone!')) {
      return;
    }
    if (!window.confirm('This will permanently delete all pending and approved ads. Continue?')) {
      return;
    }

    try {
      await clearAllAds();
      setMessage({ type: 'success', text: 'All ads have been deleted.' });
      onDataChange();
      loadStats();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to clear ads.' });
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className={cn(
          "rounded-lg px-4 py-3 text-sm",
          message.type === 'success' ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
        )}>
          {message.text}
        </div>
      )}

      {/* Statistics */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-neutral-900">Database Statistics</h2>
        {stats ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-neutral-50 p-4">
              <p className="text-sm text-neutral-500">Total Ads</p>
              <p className="text-2xl font-bold text-neutral-900">{stats.totalAds}</p>
            </div>
            <div className="rounded-lg bg-amber-50 p-4">
              <p className="text-sm text-amber-600">Pending</p>
              <p className="text-2xl font-bold text-amber-700">{stats.pendingAds}</p>
            </div>
            <div className="rounded-lg bg-emerald-50 p-4">
              <p className="text-sm text-emerald-600">Approved</p>
              <p className="text-2xl font-bold text-emerald-700">{stats.approvedAds}</p>
            </div>
            <div className="rounded-lg bg-red-50 p-4">
              <p className="text-sm text-red-600">Expired</p>
              <p className="text-2xl font-bold text-red-700">{stats.expiredAds}</p>
            </div>
          </div>
        ) : (
          <div className="h-20 animate-pulse rounded-lg bg-neutral-100" />
        )}
      </div>

      {/* Export/Import */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold text-neutral-900">Export Data</h2>
          <p className="mb-4 text-sm text-neutral-500">
            Download all ads as a JSON backup file. This includes all pending and approved ads with their images.
          </p>
          <Button onClick={handleExport} loading={exporting}>
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export Backup
          </Button>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold text-neutral-900">Import Data</h2>
          <p className="mb-4 text-sm text-neutral-500">
            Restore ads from a backup file. This will replace all existing ads with the imported data.
          </p>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-neutral-800">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            {importing ? 'Importing...' : 'Import Backup'}
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              disabled={importing}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="mb-2 text-lg font-semibold text-red-900">Danger Zone</h2>
        <p className="mb-4 text-sm text-red-700">
          Permanently delete all ads from the database. This action cannot be undone.
        </p>
        <Button variant="danger" onClick={handleClearAll}>
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          Delete All Ads
        </Button>
      </div>
    </div>
  );
};

const SettingsSection: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const result = await changeAdminPassword(currentPassword, newPassword);

      if (result) {
        setSuccess('Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError('Current password is incorrect');
      }
    } catch (err) {
      setError('Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-semibold text-neutral-900">Change Password</h2>

        <form onSubmit={handleChangePassword} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
              {success}
            </div>
          )}

          <Input
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter current password"
          />

          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
          />

          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
          />

          <Button
            type="submit"
            loading={isLoading}
            className="w-full"
          >
            Update Password
          </Button>
        </form>
      </div>
    </div>
  );
};
