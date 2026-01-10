"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import axios from '../lib/axios';

// --- TIPE DATA ---
interface Province { id: string; name: string; }
interface Regency { id: string; name: string; }
interface Role { id: number; name: string; }
interface JenisDlh { id: number; name: string; }

export interface User {
  id: number;
  name: string;
  email: string;
  role_id: number;
  jenis_dlh_id?: number;
  role: Role;
  jenis_dlh?: JenisDlh;
  nomor_telepon?: string;
  province_id?: string;
  regency_id?: string;
  province_name?: string;
  regency_name?: string;
  pesisir?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  nomor_telepon: string;
  password: string;
  password_confirmation: string;
  role_id: number;
  jenis_dlh_id: number;
  province_id: string;
  regency_id?: string;
  pesisir: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  provinces: Province[];
  regencies: Regency[];
  jenisDlhs: JenisDlh[];
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- MOCK DATA ---
const MOCK_PROVINCES: Province[] = [
  { id: '1', name: 'Jawa Barat' },
  { id: '2', name: 'Jawa Tengah' },
  { id: '3', name: 'Jawa Timur' },
  { id: '4', name: 'DI Yogyakarta' },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  // Hapus 'pathname' karena tidak digunakan
  
  // State Utama
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Data Wilayah
  const [provinces, setProvinces] = useState<Province[]>([]);
  // Hapus setter yang belum dipakai agar ESLint senang
  const [regencies] = useState<Regency[]>([]); 
  const [jenisDlhs] = useState<JenisDlh[]>([]);

  // --- 1. CEK USER SAAT RELOAD (REHYDRATION) ---
  useEffect(() => {
    const rehydrateUser = () => {
      const token = localStorage.getItem('auth_token');
      const cached = localStorage.getItem('user_data');
      
      if (token && cached) {
        try {
          const userData = JSON.parse(cached);
          setUser(userData);
          console.log('✅ Auth Restored:', userData.email);
        } catch (e) {
          console.error('❌ Cache Corrupt:', e);
          localStorage.removeItem('user_data');
          localStorage.removeItem('auth_token');
        }
      }
      setIsLoading(false);
    };

    rehydrateUser();
  }, []);

  // --- 2. FETCH DATA PENDUKUNG ---
  useEffect(() => {
    if (isLoading) return;

    const initData = async () => {
        try {
             const res = await axios.get('/api/wilayah/provinces');
             setProvinces(res.data.data || res.data || MOCK_PROVINCES);
        } catch { 
             // Hapus variable 'error' di catch karena tidak dipakai
             if (process.env.NODE_ENV === 'development') setProvinces(MOCK_PROVINCES);
        }
    };
    
    initData();
  }, [isLoading]);

  // --- ACTIONS ---

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      
      const response = await axios.post('/api/login', credentials);
      
      const token = response.data.user.token;
      const userData = response.data.user;
      
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_data', JSON.stringify(userData));
      setUser(userData);

      const roleName = userData?.role?.name?.toLowerCase();
      console.log('🔐 Login Success. Redirecting role:', roleName);
      
      if (roleName === 'admin') router.push('/admin-dashboard');
      else if (roleName === 'pusdatin') router.push('/pusdatin-dashboard');
      else if (roleName === 'provinsi' || roleName === 'kabupaten/kota') router.push('/dlh-dashboard');
      else router.push('/');
      
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const response = await axios.post('/api/auth/register', data);
      const token = response.data.token;
      
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_data', JSON.stringify(response.data.user));
      setUser(response.data.user);
      
      const roleName = response.data.user.role.name.toLowerCase();
      if (roleName === 'admin') router.push('/admin-dashboard');
      else if (roleName === 'pusdatin') router.push('/pusdatin-dashboard');
      else router.push('/dlh-dashboard');

    } catch (error) {
      console.error("Register failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await axios.post('/api/logout');
    } catch {
      // Hapus variable 'e' di catch karena tidak dipakai
      console.warn("Logout API error, forcing local logout");
    } finally {
      localStorage.clear();
      setUser(null);
      router.push('/login');
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
        user, 
        isLoading, 
        provinces, 
        regencies, 
        jenisDlhs, 
        login, 
        register, 
        logout 
    }}> 
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthContext');
  return context;
};