import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { 
  getPendingAds, 
  getApprovedAds, 
  approveAd, 
  deleteAd,
  changeAdminPassword 
} from '@/lib/database';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Ad } from '@/types';
import { cn } from '@/utils/cn';

type TabType = 'pending' | 'approved' | 'settings';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [pendingAds, setPendingAds] = useState<Ad[]>([]);
  const [approvedAds, setApprovedAds] = useState<Ad[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { logout, checkAuth } = useAuth();
  const navigate = useNavigate();

  const loadAds = useCallback(() => {
    setPendingAds(getPendingAds());
    setApprovedAds(getApprovedAds());
  }, []);

  useEffect(() => {
    if (!checkAuth()) {
      navigate('/admin/login');
      return;
    }
    loadAds();
  }, [checkAuth, navigate, loadAds]);

  const handleApprove = (id: string) => {
    if (approveAd(id)) {
      loadAds();
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this ad?')) {
      if (deleteAd(id)) {
        loadAds();
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
            className="flex items-center gap-2 rounded-lg bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-200"
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
              <path d="M23 4v6h-6" />
              <path d="M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Refresh
          </button>
        </header>

        <div className="p-6">
          {activeTab === 'pending' && (
            <PendingAdsSection ads={pendingAds} onApprove={handleApprove} onDelete={handleDelete} />
          )}
          {activeTab === 'approved' && (
            <ApprovedAdsSection ads={approvedAds} onDelete={handleDelete} />
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
}> = ({ ads, onApprove, onDelete }) => {
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
}> = ({ ads, onDelete }) => {
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
          <div className="flex items-center gap-2">
            <h3 className="truncate font-semibold text-neutral-900">{ad.title}</h3>
            {showApprovedBadge && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Approved
              </span>
            )}
          </div>
          <p className="truncate text-sm text-neutral-500">{ad.store_name} • {ad.country}</p>
          <p className="text-xs text-neutral-400">
            {format(new Date(ad.created_at), 'MMM d, yyyy • h:mm a')}
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
              <div>
                <label className="text-xs font-medium uppercase text-neutral-400">Country</label>
                <p className="text-sm text-neutral-700">{ad.country}</p>
              </div>
            </div>
          </div>
        </div>
      )}
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
    await new Promise((resolve) => setTimeout(resolve, 500));

    const result = changeAdminPassword(currentPassword, newPassword);
    setIsLoading(false);

    if (result) {
      setSuccess('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setError('Current password is incorrect');
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
