// API Service - Communicates with the backend
const API_URL = import.meta.env.VITE_API_URL || 'https://your-backend-url.onrender.com/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('classified_ads_auth_token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Request failed' };
    }

    return { success: true, data };
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
}

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
  email: string;
  status: 'pending' | 'approved';
  created_at: string;
  expires_at: string;
}

export interface AdSubmission {
  store_name: string;
  title: string;
  description: string;
  country: string;
  category: string;
  duration: string;
  email: string;
  image: File;
}

export interface DatabaseStats {
  totalAds: number;
  pendingAds: number;
  approvedAds: number;
  expiredAds: number;
}

// Public API
export const api = {
  // Get all approved ads (public)
  async getApprovedAds(): Promise<Ad[]> {
    const response = await apiCall<{ ads: Ad[] }>('/ads');
    return response.data?.ads || [];
  },

  // Submit a new ad (public)
  async submitAd(formData: FormData): Promise<{ success: boolean; error?: string }> {
    const token = localStorage.getItem('classified_ads_auth_token');
    
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_URL}/ads`, {
        method: 'POST',
        headers,
        body: formData, // FormData for file upload
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Submission failed' };
      }

      return { success: true };
    } catch (error) {
      console.error('Submit Ad Error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  },

  // Admin login
  async login(username: string, password: string): Promise<{ success: boolean; token?: string; error?: string }> {
    const response = await apiCall<{ token: string }>('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (response.success && response.data?.token) {
      localStorage.setItem('classified_ads_auth_token', response.data.token);
      return { success: true, token: response.data.token };
    }

    return { success: false, error: response.error || 'Login failed' };
  },

  // Admin logout
  logout(): void {
    localStorage.removeItem('classified_ads_auth_token');
  },

  // Validate token
  async validateToken(): Promise<boolean> {
    const token = localStorage.getItem('classified_ads_auth_token');
    if (!token) return false;

    const response = await apiCall<{ valid: boolean }>('/admin/validate');
    return response.success && response.data?.valid === true;
  },

  // Get all ads (admin)
  async getAllAds(): Promise<{ pending: Ad[]; approved: Ad[] }> {
    const response = await apiCall<{ pending: Ad[]; approved: Ad[] }>('/admin/ads');
    return response.data || { pending: [], approved: [] };
  },

  // Get pending ads (admin)
  async getPendingAds(): Promise<Ad[]> {
    const response = await apiCall<{ ads: Ad[] }>('/admin/ads/pending');
    return response.data?.ads || [];
  },

  // Approve ad (admin)
  async approveAd(id: string): Promise<boolean> {
    const response = await apiCall<{ success: boolean }>(`/admin/ads/${id}/approve`, {
      method: 'PUT',
    });
    return response.success;
  },

  // Delete ad (admin)
  async deleteAd(id: string): Promise<boolean> {
    const response = await apiCall<{ success: boolean }>(`/admin/ads/${id}`, {
      method: 'DELETE',
    });
    return response.success;
  },

  // Change password (admin)
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    const response = await apiCall<{ success: boolean }>('/admin/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return { success: response.success, error: response.error };
  },

  // Get database stats (admin)
  async getStats(): Promise<DatabaseStats | null> {
    const response = await apiCall<DatabaseStats>('/admin/stats');
    return response.data || null;
  },

  // Export data (admin)
  async exportData(): Promise<{ ads: Ad[]; exportedAt: string } | null> {
    const response = await apiCall<{ ads: Ad[]; exportedAt: string }>('/admin/export');
    return response.data || null;
  },

  // Clear all ads (admin)
  async clearAllAds(): Promise<boolean> {
    const response = await apiCall<{ success: boolean }>('/admin/ads/clear', {
      method: 'DELETE',
    });
    return response.success;
  },
};
