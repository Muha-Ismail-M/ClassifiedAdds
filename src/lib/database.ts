import type { Ad } from '../types';

const API_BASE = "https://algorithm-somehow-refuse-jill.trycloudflare.com";

// =======================
// ADS API
// =======================

export const getAllAds = async (): Promise<Ad[]> => {
  const response = await fetch(`${API_BASE}/ads`);
  if (!response.ok) {
    throw new Error("Failed to fetch ads");
  }
  return response.json();
};

export const getApprovedAds = async (): Promise<Ad[]> => {
  // For now backend does not handle approval,
  // so we just return all ads
  return getAllAds();
};

export const getPendingAds = async (): Promise<Ad[]> => {
  // No approval system yet
  return [];
};

export const getAdById = async (id: string): Promise<Ad | undefined> => {
  const ads = await getAllAds();
  return ads.find((ad) => ad.id === id);
};

export const createAd = async (
  adData: Omit<Ad, 'id' | 'status' | 'created_at' | 'expires_at'>
): Promise<Ad> => {
  const response = await fetch(`${API_BASE}/ads`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(adData),
  });

  if (!response.ok) {
    throw new Error("Failed to create ad");
  }

  return response.json();
};

export const updateAd = async (): Promise<void> => {
  console.warn("updateAd not implemented yet");
};

export const approveAd = async (): Promise<boolean> => {
  console.warn("approveAd not implemented yet");
  return false;
};

export const deleteAd = async (): Promise<boolean> => {
  console.warn("deleteAd not implemented yet");
  return false;
};

// =======================
// DATABASE STATS
// =======================

export const getDatabaseStats = async () => {
  const ads = await getAllAds();

  return {
    totalAds: ads.length,
    pendingAds: 0,
    approvedAds: ads.length,
    expiredAds: 0,
    categoryCounts: {},
  };
};

// =======================
// ADMIN (Disabled for now)
// =======================

export const initializeDatabase = async (): Promise<void> => {
  console.log("Backend API mode - no IndexedDB initialization needed");
};

export const getAdmin = async () => {
  return null;
};

export const validateAdminCredentials = async (): Promise<boolean> => {
  return false;
};

export const changeAdminPassword = async (): Promise<boolean> => {
  return false;
};

export const generateToken = (): string => {
  return "";
};

export const validateToken = (): boolean => {
  return false;
};

export const logout = (): void => {};

export const getToken = (): string | null => {
  return null;
};

export const importAds = async (): Promise<number> => {
  return 0;
};

export const exportAllData = async () => {
  return {
    ads: [],
    admin: null,
    exportedAt: new Date().toISOString(),
    version: "2.0.0-backend-mode",
  };
};

export const clearAllAds = async (): Promise<void> => {
  console.warn("clearAllAds not implemented");
};