import { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../types/auth';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface RegisteredAccount {
  user: User;
  passwordHash: string;
}

export type PermissionAction =
  | 'view_map'
  | 'search_parcels'
  | 'view_parcel_details'
  | 'submit_request'
  | 'track_own_requests'
  | 'add_parcel'
  | 'edit_parcel'
  | 'verify_parcel'
  | 'review_citizen_requests'
  | 'upload_documents'
  | 'delete_parcel'
  | 'manage_users'
  | 'view_audit_logs';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (role: UserRole, identifier?: string, password?: string) => Promise<boolean>;
  signup: (userData: Omit<User, 'id'>, password?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
  clearError: () => void;
  hasPermission: (action: PermissionAction) => boolean;
}

export const DEMO_USERS: Record<UserRole, User> = {
  citizen: {
    id: 'CIT-2025-001',
    name: 'K. Aravind',
    email: 'aravind.k@example.com',
    phone: '+91 98401 23456',
    role: 'citizen',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    jurisdiction: 'Chennai / Mylapore',
  },
  officer: {
    id: 'OFF-TN-8821',
    name: 'Dr. M. Sundaram',
    email: 'sundaram.m@tn.gov.in',
    phone: '+91 94432 78901',
    role: 'officer',
    designation: 'Tahsildar / Revenue Divisional Officer',
    department: 'Revenue & Land Records (Erode)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    jurisdiction: 'Erode West Taluk',
  },
  admin: {
    id: 'ADM-SYS-001',
    name: 'S. Rajendran, IAS',
    email: 'rajendran.sec@tn.gov.in',
    phone: '+91 94440 11223',
    role: 'admin',
    designation: 'State System Administrator & Land Commissioner',
    department: 'Department of Land Administration, Govt. of Tamil Nadu',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    jurisdiction: 'All Tamil Nadu Districts',
  },
};

const LOCAL_STORAGE_KEY = 'landstack_registered_users_v3';
const SESSION_STORAGE_KEY = 'landstack_active_session_v3';

// Helper to normalize phone numbers (strip +91, spaces, hyphens)
const normalizePhone = (p?: string): string => {
  if (!p) return '';
  return p.replace(/[^0-9]/g, '').slice(-10);
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // Helper to load registered users from localStorage
  const getRegisteredAccounts = (): Record<string, RegisteredAccount> => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  };

  // Helper to save registered users to localStorage
  const saveRegisteredAccount = (account: RegisteredAccount) => {
    try {
      const accounts = getRegisteredAccounts();
      const emailKey = account.user.email.toLowerCase().trim();
      const phoneKey = normalizePhone(account.user.phone);
      
      if (emailKey) accounts[emailKey] = account;
      if (phoneKey) accounts[`phone_${phoneKey}`] = account;
      
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(accounts));
    } catch (e) {
      console.warn('Could not save account to localStorage:', e);
    }
  };

  // Helper to construct User object from Supabase Auth User + Profile
  const buildUserFromSupabase = (
    authUser: { id: string; email?: string; user_metadata?: Record<string, any> },
    profile?: Record<string, any> | null
  ): User => {
    const meta = authUser.user_metadata || {};
    const role: UserRole = (profile?.role || meta.role || 'citizen') as UserRole;
    const name = profile?.full_name || meta.full_name || meta.name || (authUser.email ? authUser.email.split('@')[0] : 'User');
    const phone = profile?.phone || meta.phone || '';
    const department = profile?.department || meta.department || DEMO_USERS[role]?.department;
    const designation = profile?.designation || meta.designation || DEMO_USERS[role]?.designation;
    const jurisdiction = profile?.jurisdiction || meta.jurisdiction || DEMO_USERS[role]?.jurisdiction;
    const avatar = profile?.avatar_url || meta.avatar || DEMO_USERS[role]?.avatar;

    return {
      id: authUser.id,
      name,
      email: authUser.email || '',
      phone,
      role,
      department,
      designation,
      jurisdiction,
      avatar,
    };
  };

  // Check saved session on mount
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      // 1. Check Supabase session first
      if (isSupabaseConfigured) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && isMounted) {
            let profileData = null;
            try {
              const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle();
              profileData = data;
            } catch (pErr) {
              console.warn('Profile fetch notice:', pErr);
            }

            if (isMounted) {
              const u = buildUserFromSupabase(session.user, profileData);
              setUser(u);
              setLoading(false);
              return;
            }
          }
        } catch (err) {
          console.warn('Session verification caught error:', err);
        }
      }

      // 2. Check local active session
      try {
        const savedSession = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (savedSession && isMounted) {
          setUser(JSON.parse(savedSession));
        }
      } catch (e) {
        console.warn('Could not read session storage:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    restoreSession();

    // Supabase auth change listener
    const { data: authListener } = isSupabaseConfigured
      ? supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_OUT' || !session) {
            setUser((curr) => (curr && !curr.id.startsWith('AUTH-') ? curr : null));
          } else if (session?.user) {
            let profileData = null;
            try {
              const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle();
              profileData = data;
            } catch (err) {
              console.warn('Auth state change profile fetch:', err);
            }
            setUser(buildUserFromSupabase(session.user, profileData));
          }
        })
      : { data: { subscription: { unsubscribe: () => {} } } };

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const setUserSession = (newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      try {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newUser));
      } catch (e) {
        console.warn('Could not save session:', e);
      }
    } else {
      try {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      } catch (e) {
        console.warn('Could not remove session:', e);
      }
    }
  };

  // ── STRICT LOGIN (Supports Email OR Mobile Number) ───────────────────────────
  const login = async (role: UserRole, identifier?: string, password?: string): Promise<boolean> => {
    setError(null);

    const cleanInput = (identifier || '').trim();
    const cleanPassword = (password || '').trim();

    // 1. Validation: required fields
    if (!cleanInput) {
      setError('Please enter your Email Address or Mobile Number.');
      return false;
    }
    if (!cleanPassword) {
      setError('Please enter your password.');
      return false;
    }

    const isEmail = cleanInput.includes('@');
    const isPhone = !isEmail && /^[0-9+\s-]{7,15}$/.test(cleanInput);

    if (!isEmail && !isPhone) {
      setError('Please enter a valid Email Address (e.g. name@domain.com) or Mobile Number.');
      return false;
    }

    const cleanEmail = isEmail ? cleanInput.toLowerCase() : '';
    const cleanPhoneDigits = isPhone ? normalizePhone(cleanInput) : '';

    setLoading(true);

    // 2. Try Supabase Auth if it's an email
    if (isSupabaseConfigured && isEmail) {
      try {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword,
        });

        if (data?.user && !signInError) {
          let profile = null;
          try {
            const { data: pData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .maybeSingle();
            profile = pData;
          } catch (e) {
            console.warn('Profile fetch after login:', e);
          }

          const loggedInUser = buildUserFromSupabase(data.user, profile);
          setUserSession(loggedInUser);
          setLoading(false);
          return true;
        }
      } catch (err) {
        console.warn('Supabase signIn notice:', err);
      }
    }

    // 3. Look up registered accounts by Email OR Phone
    const accounts = getRegisteredAccounts();
    let existingAccount: RegisteredAccount | undefined;

    if (isEmail && accounts[cleanEmail]) {
      existingAccount = accounts[cleanEmail];
    } else if (isPhone) {
      if (accounts[`phone_${cleanPhoneDigits}`]) {
        existingAccount = accounts[`phone_${cleanPhoneDigits}`];
      } else {
        // Search through all accounts for matching phone
        existingAccount = Object.values(accounts).find(
          a => normalizePhone(a.user.phone) === cleanPhoneDigits
        );
      }
    }

    if (existingAccount) {
      // Role match check
      if (existingAccount.user.role !== role) {
        setError(`This account is registered as "${existingAccount.user.role.toUpperCase()}". Please select the ${existingAccount.user.role.toUpperCase()} tab to sign in.`);
        setLoading(false);
        return false;
      }

      // Password verification
      if (existingAccount.passwordHash !== cleanPassword) {
        setError('Incorrect password. Please check your credentials and try again.');
        setLoading(false);
        return false;
      }

      // Successful login
      setUserSession(existingAccount.user);
      setLoading(false);
      return true;
    }

    // 4. Check Demo Users by Email OR Phone
    const demoRoleUser = DEMO_USERS[role];
    const matchesDemoEmail = isEmail && demoRoleUser.email.toLowerCase() === cleanEmail;
    const matchesDemoPhone = isPhone && normalizePhone(demoRoleUser.phone) === cleanPhoneDigits;

    if (matchesDemoEmail || matchesDemoPhone) {
      setUserSession(demoRoleUser);
      setLoading(false);
      return true;
    }

    // Check if entered demo belongs to a different role
    const anyDemoMatch = Object.values(DEMO_USERS).find(d => 
      (isEmail && d.email.toLowerCase() === cleanEmail) ||
      (isPhone && normalizePhone(d.phone) === cleanPhoneDigits)
    );

    if (anyDemoMatch) {
      setError(`This account is registered as "${anyDemoMatch.role.toUpperCase()}". Please switch to the ${anyDemoMatch.role.toUpperCase()} tab.`);
      setLoading(false);
      return false;
    }

    // 5. No match found
    setError(
      isPhone
        ? `No account registered with mobile number "${cleanInput}". Please create an account first.`
        : `No account found with email "${cleanEmail}". Please click "Create New Account" to register.`
    );
    setLoading(false);
    return false;
  };

  // ── STRICT SIGNUP (Supports Mobile & Email) ──────────────────────────────────
  const signup = async (userData: Omit<User, 'id'>, password?: string): Promise<boolean> => {
    setError(null);

    const rawEmailOrPhone = (userData.email || '').trim();
    const rawPhone = (userData.phone || '').trim();
    const cleanPassword = (password || '').trim();
    const cleanName = (userData.name || '').trim();

    // 1. Validate name
    if (!cleanName) {
      setError('Please enter your Full Name.');
      return false;
    }

    // Determine email & phone
    let cleanEmail = '';
    let cleanPhone = rawPhone;

    if (rawEmailOrPhone.includes('@')) {
      cleanEmail = rawEmailOrPhone.toLowerCase();
    } else if (/^[0-9+\s-]{7,15}$/.test(rawEmailOrPhone)) {
      if (!cleanPhone) cleanPhone = rawEmailOrPhone;
    }

    if (!cleanEmail && !cleanPhone) {
      setError('Please provide at least a valid Email Address or Mobile Number.');
      return false;
    }

    if (cleanEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        setError('Please enter a valid email address (e.g. name@domain.com).');
        return false;
      }
    }

    if (cleanPhone) {
      const digits = cleanPhone.replace(/[^0-9]/g, '');
      if (digits.length < 7 || digits.length > 15) {
        setError('Please enter a valid mobile number (e.g. 9876543210).');
        return false;
      }
    }

    if (!cleanPassword || cleanPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }

    // Check existing accounts
    const accounts = getRegisteredAccounts();
    const cleanPhoneDigits = normalizePhone(cleanPhone);

    if (cleanEmail && accounts[cleanEmail]) {
      setError('An account with this email address already exists. Please sign in.');
      return false;
    }
    if (cleanPhoneDigits && accounts[`phone_${cleanPhoneDigits}`]) {
      setError('An account with this mobile number already exists. Please sign in.');
      return false;
    }

    setLoading(true);

    const primaryEmail = cleanEmail || `${cleanPhoneDigits}@mobile.landstack.tn.gov.in`;

    const newUser: User = {
      id: `USR-${Date.now().toString().slice(-6)}`,
      name: cleanName,
      email: primaryEmail,
      phone: cleanPhone || '',
      role: userData.role,
      department: userData.department || DEMO_USERS[userData.role]?.department,
      designation: userData.designation || DEMO_USERS[userData.role]?.designation,
      jurisdiction: userData.jurisdiction || DEMO_USERS[userData.role]?.jurisdiction,
      avatar: DEMO_USERS[userData.role]?.avatar,
    };

    // Attempt Supabase sync
    if (isSupabaseConfigured && cleanEmail) {
      try {
        const { data } = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
          options: {
            data: {
              full_name: cleanName,
              phone: cleanPhone,
              role: userData.role,
              department: userData.department || '',
              designation: userData.designation || '',
              jurisdiction: userData.jurisdiction || '',
            },
          },
        });

        if (data?.user) {
          newUser.id = data.user.id;
          try {
            await supabase.from('profiles').upsert({
              id: data.user.id,
              full_name: cleanName,
              phone: cleanPhone,
              role: userData.role,
              department: userData.department || null,
              designation: userData.designation || null,
              jurisdiction: userData.jurisdiction || null,
              avatar_url: DEMO_USERS[userData.role]?.avatar,
              updated_at: new Date().toISOString(),
            });
          } catch (pErr) {
            console.warn('Profile sync note:', pErr);
          }
        }
      } catch (err) {
        console.warn('Supabase signup notice:', err);
      }
    }

    // Save account strictly in registered database (indexed by email & phone)
    saveRegisteredAccount({
      user: newUser,
      passwordHash: cleanPassword,
    });

    setUserSession(newUser);
    setLoading(false);
    return true;
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase signout notice:', e);
      }
    }
    setUserSession(null);
    setError(null);
  };

  const switchRole = (role: UserRole) => {
    setUserSession(DEMO_USERS[role]);
    setError(null);
  };

  const hasPermission = (action: PermissionAction): boolean => {
    if (!user) return false;
    const role = user.role;

    switch (action) {
      case 'view_map':
      case 'search_parcels':
      case 'view_parcel_details':
      case 'submit_request':
      case 'track_own_requests':
        return true; // All roles

      case 'add_parcel':
      case 'edit_parcel':
      case 'verify_parcel':
      case 'review_citizen_requests':
      case 'upload_documents':
      case 'view_audit_logs':
        return role === 'officer' || role === 'admin';

      case 'delete_parcel':
      case 'manage_users':
        return role === 'admin';

      default:
        return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        error,
        login,
        signup,
        logout,
        switchRole,
        clearError,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
