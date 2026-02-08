export interface Ad {
  id: string;
  store_name: string;
  title: string;
  description: string;
  country: string;
  image_data: string; // Base64 encoded image
  email: string;
  status: 'pending' | 'approved';
  created_at: string;
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
