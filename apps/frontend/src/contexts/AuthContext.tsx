'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import type {
  User,
  Workspace,
  AuthContextType,
  LoginInput,
  RegisterInput,
  AuthResponse,
} from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load user from localStorage on mount
   */
  useEffect(() => {
    const loadUser = () => {
      if (typeof window === 'undefined') return;

      const storedUser = localStorage.getItem('user');
      const storedWorkspace = localStorage.getItem('workspaceId');

      if (storedUser && apiClient.isAuthenticated()) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          
          if (storedWorkspace) {
            // Load workspace details
            loadWorkspaceDetails(storedWorkspace);
          }
        } catch (error) {
          console.error('Error loading user:', error);
          apiClient.clearTokens();
        }
      }

      setIsLoading(false);
    };

    loadUser();
  }, []);

  /**
   * Load workspace details
   */
  const loadWorkspaceDetails = async (workspaceId: string) => {
    try {
      const response = await apiClient.get<{ success: boolean; data: Workspace }>(
        `/api/workspaces/${workspaceId}`
      );
      setWorkspace(response.data);
    } catch (error) {
      console.error('Error loading workspace:', error);
    }
  };

  /**
   * Load user's workspaces
   */
  const loadWorkspaces = async () => {
    try {
      const response = await apiClient.get<{ success: boolean; data: Workspace[] }>(
        '/api/workspaces'
      );
      setWorkspaces(response.data);
    } catch (error) {
      console.error('Error loading workspaces:', error);
    }
  };

  /**
   * Login user
   */
  const login = async (credentials: LoginInput) => {
    try {
      const response = await apiClient.post<{ success: boolean; data: AuthResponse }>(
        '/api/auth/login',
        credentials,
        { requiresAuth: false }
      );

      const { user, workspace, accessToken, refreshToken } = response.data;

      // Store tokens
      apiClient.setAccessToken(accessToken);
      apiClient.setRefreshToken(refreshToken);
      localStorage.setItem('workspaceId', workspace.id);
      localStorage.setItem('user', JSON.stringify(user));

      // Update state
      setUser(user);
      setWorkspace(workspace);

      // Load all workspaces
      await loadWorkspaces();

      // Redirect to dashboard
      router.push(`/w/${workspace.id}/dashboard`);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  /**
   * Register new user
   */
  const register = async (data: RegisterInput) => {
    try {
      const response = await apiClient.post<{ success: boolean; data: AuthResponse }>(
        '/api/auth/register',
        data,
        { requiresAuth: false }
      );

      const { user, workspace, accessToken, refreshToken } = response.data;

      // Store tokens
      apiClient.setAccessToken(accessToken);
      apiClient.setRefreshToken(refreshToken);
      localStorage.setItem('workspaceId', workspace.id);
      localStorage.setItem('user', JSON.stringify(user));

      // Update state
      setUser(user);
      setWorkspace(workspace);
      setWorkspaces([workspace]);

      // Redirect to dashboard
      router.push(`/w/${workspace.id}/dashboard`);
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      const refreshToken = apiClient.getRefreshToken();
      
      if (refreshToken) {
        await apiClient.post('/api/auth/logout', { refreshToken }, { requiresAuth: false });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state regardless of API call result
      apiClient.clearTokens();
      setUser(null);
      setWorkspace(null);
      setWorkspaces([]);
      router.push('/auth/login');
    }
  };

  /**
   * Switch workspace
   */
  const switchWorkspace = useCallback(async (workspaceId: string) => {
    try {
      localStorage.setItem('workspaceId', workspaceId);
      await loadWorkspaceDetails(workspaceId);
      router.push(`/w/${workspaceId}/dashboard`);
    } catch (error) {
      console.error('Switch workspace error:', error);
      throw error;
    }
  }, [router]);

  /**
   * Refresh user data
   */
  const refreshUser = async () => {
    try {
      const response = await apiClient.get<{ success: boolean; data: User }>(
        '/api/auth/me'
      );
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (error) {
      console.error('Refresh user error:', error);
      // If refresh fails, user might be logged out
      if (apiClient.isAuthenticated()) {
        throw error;
      }
    }
  };

  const value: AuthContextType = {
    user,
    workspace,
    workspaces,
    isAuthenticated: !!user && apiClient.isAuthenticated(),
    isLoading,
    login,
    register,
    logout,
    switchWorkspace,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth hook
 * Access authentication context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

export { AuthContext };

