import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import type { Ad, Admin } from '../types';

const DB_NAME = 'ClassifiedAdsDB';
const DB_VERSION = 1;
const ADS_STORE = 'ads';
const ADMIN_STORE = 'admin';

const AUTH_TOKEN_KEY = 'classified_ads_auth_token';

let dbInstance: IDBDatabase | null = null;

// Initialize IndexedDB
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Failed to open database:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create ads store
      if (!db.objectStoreNames.contains(ADS_STORE)) {
        const adsStore = db.createObjectStore(ADS_STORE, { keyPath: 'id' });
        adsStore.createIndex('status', 'status', { unique: false });
        adsStore.createIndex('created_at', 'created_at', { unique: false });
        adsStore.createIndex('category', 'category', { unique: false });
      }

      // Create admin store
      if (!db.objectStoreNames.contains(ADMIN_STORE)) {
        db.createObjectStore(ADMIN_STORE, { keyPath: 'id' });
      }
    };
  });
};

// Initialize database
export const initializeDatabase = async (): Promise<void> => {
  try {
    const db = await openDB();

    // Initialize admin if not exists
    const transaction = db.transaction([ADMIN_STORE], 'readwrite');
    const store = transaction.objectStore(ADMIN_STORE);

    const getRequest = store.get('admin-1');
    
    getRequest.onsuccess = () => {
      if (!getRequest.result) {
        const passwordHash = bcrypt.hashSync('admin123', 10);
        const admin: Admin = {
          id: 'admin-1',
          username: 'admin',
          password_hash: passwordHash,
        };
        store.add(admin);
      }
    };
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
};

// Ads CRUD operations
export const getAllAds = async (): Promise<Ad[]> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([ADS_STORE], 'readonly');
    const store = transaction.objectStore(ADS_STORE);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
};

export const getApprovedAds = async (): Promise<Ad[]> => {
  const ads = await getAllAds();
  const now = new Date();
  return ads
    .filter((ad) => {
      if (ad.status !== 'approved') return false;
      // Check if ad has expired
      if (ad.expires_at && new Date(ad.expires_at) < now) return false;
      return true;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

export const getPendingAds = async (): Promise<Ad[]> => {
  const ads = await getAllAds();
  return ads
    .filter((ad) => ad.status === 'pending')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

export const getAdById = async (id: string): Promise<Ad | undefined> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([ADS_STORE], 'readonly');
    const store = transaction.objectStore(ADS_STORE);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const createAd = async (adData: Omit<Ad, 'id' | 'status' | 'created_at' | 'expires_at'>): Promise<Ad> => {
  const db = await openDB();
  const createdAt = new Date();

  // Calculate expiration date based on duration
  const durationMap: Record<string, number> = {
    '1-week': 7,
    '2-weeks': 14,
    '1-month': 30,
    '2-months': 60,
    '3-months': 90,
  };

  const daysToAdd = durationMap[adData.duration] || 30;
  const expiresAt = new Date(createdAt);
  expiresAt.setDate(expiresAt.getDate() + daysToAdd);

  const newAd: Ad = {
    ...adData,
    id: uuidv4(),
    status: 'pending',
    created_at: createdAt.toISOString(),
    expires_at: expiresAt.toISOString(),
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([ADS_STORE], 'readwrite');
    const store = transaction.objectStore(ADS_STORE);
    const request = store.add(newAd);

    request.onsuccess = () => resolve(newAd);
    request.onerror = () => reject(request.error);
  });
};

export const updateAd = async (ad: Ad): Promise<void> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([ADS_STORE], 'readwrite');
    const store = transaction.objectStore(ADS_STORE);
    const request = store.put(ad);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const approveAd = async (id: string): Promise<boolean> => {
  const ad = await getAdById(id);
  if (!ad) return false;

  ad.status = 'approved';
  await updateAd(ad);
  return true;
};

export const deleteAd = async (id: string): Promise<boolean> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([ADS_STORE], 'readwrite');
    const store = transaction.objectStore(ADS_STORE);
    const request = store.delete(id);

    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
};

// Bulk operations for import/export
export const importAds = async (ads: Ad[], clearExisting: boolean = true): Promise<number> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([ADS_STORE], 'readwrite');
    const store = transaction.objectStore(ADS_STORE);

    const doImport = () => {
      let imported = 0;
      if (ads.length === 0) {
        resolve(0);
        return;
      }

      ads.forEach((ad, index) => {
        const request = store.put(ad);
        request.onsuccess = () => {
          imported++;
          if (index === ads.length - 1) {
            resolve(imported);
          }
        };
        request.onerror = () => reject(request.error);
      });
    };

    if (clearExisting) {
      const clearRequest = store.clear();
      clearRequest.onsuccess = doImport;
      clearRequest.onerror = () => reject(clearRequest.error);
    } else {
      doImport();
    }
  });
};

export const exportAllData = async (): Promise<{ ads: Ad[]; admin: Admin | null; exportedAt: string; version: string }> => {
  const ads = await getAllAds();
  const admin = await getAdmin();

  return {
    ads,
    admin: admin ? { ...admin, password_hash: '[REDACTED]' } : null,
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
  };
};

export const clearAllAds = async (): Promise<void> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([ADS_STORE], 'readwrite');
    const store = transaction.objectStore(ADS_STORE);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// Get database statistics
export const getDatabaseStats = async (): Promise<{
  totalAds: number;
  pendingAds: number;
  approvedAds: number;
  expiredAds: number;
  categoryCounts: Record<string, number>;
}> => {
  const ads = await getAllAds();
  const now = new Date();

  const stats = {
    totalAds: ads.length,
    pendingAds: 0,
    approvedAds: 0,
    expiredAds: 0,
    categoryCounts: {} as Record<string, number>,
  };

  ads.forEach((ad) => {
    if (ad.status === 'pending') stats.pendingAds++;
    if (ad.status === 'approved') stats.approvedAds++;
    if (ad.expires_at && new Date(ad.expires_at) < now) stats.expiredAds++;
    
    stats.categoryCounts[ad.category] = (stats.categoryCounts[ad.category] || 0) + 1;
  });

  return stats;
};

// Admin authentication
export const getAdmin = async (): Promise<Admin | null> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([ADMIN_STORE], 'readonly');
    const store = transaction.objectStore(ADMIN_STORE);
    const request = store.get('admin-1');

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
};

export const validateAdminCredentials = async (username: string, password: string): Promise<boolean> => {
  const admin = await getAdmin();
  if (!admin) return false;
  if (admin.username !== username) return false;
  return bcrypt.compareSync(password, admin.password_hash);
};

export const changeAdminPassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
  const admin = await getAdmin();
  if (!admin) return false;
  if (!bcrypt.compareSync(currentPassword, admin.password_hash)) return false;

  const db = await openDB();
  const newHash = bcrypt.hashSync(newPassword, 10);
  admin.password_hash = newHash;

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([ADMIN_STORE], 'readwrite');
    const store = transaction.objectStore(ADMIN_STORE);
    const request = store.put(admin);

    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
};

// Token management (simulated JWT)
export const generateToken = (): string => {
  const token = btoa(
    JSON.stringify({
      exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      admin: true,
    })
  );
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  return token;
};

export const validateToken = (): boolean => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!token) return false;

  try {
    const decoded = JSON.parse(atob(token));
    if (decoded.exp < Date.now()) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      return false;
    }
    return decoded.admin === true;
  } catch {
    return false;
  }
};

export const logout = (): void => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
};

export const getToken = (): string | null => {
  return localStorage.getItem(AUTH_TOKEN_KEY);
};
