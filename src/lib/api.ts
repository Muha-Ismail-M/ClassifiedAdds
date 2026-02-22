// =============================================================================
// BACKEND API CLIENT
// Set VITE_API_URL in your .env file or Vercel environment variables
// Example: VITE_API_URL=https://your-ngrok-url.ngrok-free.app/api
// =============================================================================

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Types
export interface Ad {
  id: string;
  store_name: string;
  title: string;
  description: string;
  country: string;
  category: string;
  duration: string;
  image_url: string;
  image_path?: string;
  email: string;
  status: 'pending' | 'approved';
  created_at: string;
  expires_at: string;
}

export interface DatabaseStats {
  totalAds: number;
  pendingAds: number;
  approvedAds: number;
  expiredAds: number;
}

// Token management
function getToken(): string | null {
  return localStorage.getItem('classified_ads_token');
}

function setToken(token: string): void {
  localStorage.setItem('classified_ads_token', token);
}

function removeToken(): void {
  localStorage.removeItem('classified_ads_token');
}

// Authenticated fetch helper
async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Don't set Content-Type for FormData (browser sets it with boundary)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

// API methods
export const api = {
  // ========== PUBLIC ENDPOINTS ==========

  // Get all approved ads (public)
  async getApprovedAds(): Promise<Ad[]> {
    try {
      const res = await fetch(`${API_BASE}/ads`);
      if (!res.ok) throw new Error('Failed to fetch ads');
      const data = await res.json();
      return data.ads || [];
    } catch (error) {
      console.error('Error fetching ads:', error);
      return [];
    }
  },

  // Submit a new ad (public)
  async submitAd(formData: FormData): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/ads`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to submit ad' };
      }

      return { success: true };
    } catch (error) {
      console.error('Submit error:', error);
      return { success: false, error: 'Failed to connect to server. Please try again later.' };
    }
  },

  // ========== AUTH ENDPOINTS ==========

  // Admin login
  async login(username: string, password: string): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
      const res = await authFetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Invalid credentials' };
      }

      if (data.token) {
        setToken(data.token);
      }

      return { success: true, token: data.token };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Failed to connect to server.' };
    }
  },

  // Admin logout
  logout(): void {
    removeToken();
  },

  // Validate token
  async validateToken(): Promise<boolean> {
    const token = getToken();
    if (!token) return false;

    try {
      const res = await authFetch(`${API_BASE}/admin/validate`);
      const data = await res.json();
      return data.valid === true;
    } catch {
      return false;
    }
  },

  // ========== ADMIN ENDPOINTS ==========

  // Get all ads (admin)
  async getAllAds(): Promise<{ pending: Ad[]; approved: Ad[] }> {
    try {
      const res = await authFetch(`${API_BASE}/admin/ads`);
      if (!res.ok) throw new Error('Failed to fetch ads');
      const data = await res.json();
      return { pending: data.pending || [], approved: data.approved || [] };
    } catch (error) {
      console.error('Error fetching all ads:', error);
      return { pending: [], approved: [] };
    }
  },

  // Get pending ads (admin)
  async getPendingAds(): Promise<Ad[]> {
    try {
      const res = await authFetch(`${API_BASE}/admin/ads/pending`);
      if (!res.ok) throw new Error('Failed to fetch pending ads');
      const data = await res.json();
      return data.ads || [];
    } catch (error) {
      console.error('Error fetching pending ads:', error);
      return [];
    }
  },

  // Approve ad (admin)
  async approveAd(id: string): Promise<boolean> {
    try {
      const res = await authFetch(`${API_BASE}/admin/ads/${id}/approve`, {
        method: 'PUT',
      });
      return res.ok;
    } catch (error) {
      console.error('Error approving ad:', error);
      return false;
    }
  },

  // Delete ad (admin)
  async deleteAd(id: string): Promise<boolean> {
    try {
      const res = await authFetch(`${API_BASE}/admin/ads/${id}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch (error) {
      console.error('Error deleting ad:', error);
      return false;
    }
  },

  // Change password (admin)
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await authFetch(`${API_BASE}/admin/password`, {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to change password' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error changing password:', error);
      return { success: false, error: 'Failed to connect to server.' };
    }
  },

  // Get database stats (admin)
  async getStats(): Promise<DatabaseStats | null> {
    try {
      const res = await authFetch(`${API_BASE}/admin/stats`);
      if (!res.ok) throw new Error('Failed to fetch stats');
      return await res.json();
    } catch (error) {
      console.error('Error fetching stats:', error);
      return null;
    }
  },

  // Export data (admin)
  async exportData(): Promise<{ ads: Ad[]; exportedAt: string } | null> {
    try {
      const res = await authFetch(`${API_BASE}/admin/export`);
      if (!res.ok) throw new Error('Failed to export data');
      return await res.json();
    } catch (error) {
      console.error('Error exporting data:', error);
      return null;
    }
  },

  // Clear all ads (admin)
  async clearAllAds(): Promise<boolean> {
    try {
      const res = await authFetch(`${API_BASE}/admin/ads/clear`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch (error) {
      console.error('Error clearing ads:', error);
      return false;
    }
  },
};
