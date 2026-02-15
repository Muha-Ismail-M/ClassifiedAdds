export type AdCategory = 
  | 'electronics'
  | 'fashion'
  | 'home-garden'
  | 'beauty'
  | 'sports'
  | 'automotive'
  | 'entertainment'
  | 'food-dining'
  | 'travel'
  | 'services'
  | 'real-estate'
  | 'jobs'
  | 'education'
  | 'health'
  | 'pets'
  | 'other';

export type AdDuration = '1-week' | '2-weeks' | '1-month' | '2-months' | '3-months';

export interface Ad {
  id: string;
  store_name: string;
  title: string;
  description: string;
  country: string;
  category: AdCategory;
  duration: AdDuration;
  image_data: string; // Base64 encoded image
  email: string;
  status: 'pending' | 'approved';
  created_at: string;
  expires_at: string;
}

export interface Admin {
  id: string;
  username: string;
  password_hash: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
}
