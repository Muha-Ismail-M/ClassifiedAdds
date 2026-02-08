import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import type { Ad, Admin } from '../types';

const ADS_KEY = 'classified_ads_db';
const ADMIN_KEY = 'classified_ads_admin';
const AUTH_TOKEN_KEY = 'classified_ads_auth_token';

// Initialize database
export const initializeDatabase = (): void => {
  // Initialize admin if not exists
  const existingAdmin = localStorage.getItem(ADMIN_KEY);
  if (!existingAdmin) {
    const passwordHash = bcrypt.hashSync('admin123', 10);
    const admin: Admin = {
      id: uuidv4(),
      username: 'admin',
      password_hash: passwordHash,
    };
    localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
  }

  // Initialize ads array if not exists
  if (!localStorage.getItem(ADS_KEY)) {
    localStorage.setItem(ADS_KEY, JSON.stringify([]));
  }
};

// Ads CRUD operations
export const getAllAds = (): Ad[] => {
  const ads = localStorage.getItem(ADS_KEY);
  return ads ? JSON.parse(ads) : [];
};

export const getApprovedAds = (): Ad[] => {
  return getAllAds()
    .filter((ad) => ad.status === 'approved')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

export const getPendingAds = (): Ad[] => {
  return getAllAds()
    .filter((ad) => ad.status === 'pending')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

export const getAdById = (id: string): Ad | undefined => {
  return getAllAds().find((ad) => ad.id === id);
};

export const createAd = (adData: Omit<Ad, 'id' | 'status' | 'created_at'>): Ad => {
  const ads = getAllAds();
  const newAd: Ad = {
    ...adData,
    id: uuidv4(),
    status: 'pending',
    created_at: new Date().toISOString(),
  };
  ads.push(newAd);
  localStorage.setItem(ADS_KEY, JSON.stringify(ads));
  return newAd;
};

export const approveAd = (id: string): boolean => {
  const ads = getAllAds();
  const index = ads.findIndex((ad) => ad.id === id);
  if (index === -1) return false;
  ads[index].status = 'approved';
  localStorage.setItem(ADS_KEY, JSON.stringify(ads));
  return true;
};

export const deleteAd = (id: string): boolean => {
  const ads = getAllAds();
  const filtered = ads.filter((ad) => ad.id !== id);
  if (filtered.length === ads.length) return false;
  localStorage.setItem(ADS_KEY, JSON.stringify(filtered));
  return true;
};

// Admin authentication
export const getAdmin = (): Admin | null => {
  const admin = localStorage.getItem(ADMIN_KEY);
  return admin ? JSON.parse(admin) : null;
};

export const validateAdminCredentials = (username: string, password: string): boolean => {
  const admin = getAdmin();
  if (!admin) return false;
  if (admin.username !== username) return false;
  return bcrypt.compareSync(password, admin.password_hash);
};

export const changeAdminPassword = (currentPassword: string, newPassword: string): boolean => {
  const admin = getAdmin();
  if (!admin) return false;
  if (!bcrypt.compareSync(currentPassword, admin.password_hash)) return false;
  
  const newHash = bcrypt.hashSync(newPassword, 10);
  admin.password_hash = newHash;
  localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
  return true;
};

// Token management (simulated JWT)
export const generateToken = (): string => {
  const token = btoa(JSON.stringify({ 
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    admin: true 
  }));
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
