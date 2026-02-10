const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
    private accessToken: string | null = null;
    private refreshToken: string | null = null;

    constructor() {
        if (typeof window !== 'undefined') {
            this.accessToken = localStorage.getItem('accessToken');
            this.refreshToken = localStorage.getItem('refreshToken');
        }
    }

    isAuthenticated(): boolean {
        return !!this.accessToken;
    }

    setAccessToken(token: string) {
        this.accessToken = token;
        if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', token);
        }
    }

    setRefreshToken(token: string) {
        this.refreshToken = token;
        if (typeof window !== 'undefined') {
            localStorage.setItem('refreshToken', token);
        }
    }

    getRefreshToken(): string | null {
        return this.refreshToken;
    }

    clearTokens() {
        this.accessToken = null;
        this.refreshToken = null;
        if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            localStorage.removeItem('workspaceId');
        }
    }

    async get<T>(url: string, config: any = {}): Promise<T> {
        return this.request<T>(url, { ...config, method: 'GET' });
    }

    async post<T>(url: string, data: any, config: any = {}): Promise<T> {
        return this.request<T>(url, {
            ...config,
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async put<T>(url: string, data: any, config: any = {}): Promise<T> {
        return this.request<T>(url, {
            ...config,
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async patch<T>(url: string, data: any, config: any = {}): Promise<T> {
        return this.request<T>(url, {
            ...config,
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async delete<T>(url: string, config: any = {}): Promise<T> {
        return this.request<T>(url, { ...config, method: 'DELETE' });
    }

    private isRefreshing = false;
    private refreshSubscribers: ((token: string) => void)[] = [];

    private onRefreshed(token: string) {
        this.refreshSubscribers.map((cb) => cb(token));
        this.refreshSubscribers = [];
    }

    private subscribeTokenRefresh(cb: (token: string) => void) {
        this.refreshSubscribers.push(cb);
    }

    private async request<T>(endpoint: string, config: RequestInit & { requiresAuth?: boolean }): Promise<T> {
        const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;

        // Default headers
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...config.headers,
        };

        // Add Auth token if needed (default to true unless explicitly false)
        if (config.requiresAuth !== false && this.accessToken) {
            (headers as any)['Authorization'] = `Bearer ${this.accessToken}`;
        }

        let response = await fetch(url, {
            ...config,
            headers,
        });

        // Handle token expiration / 401 Unauthorized
        if (response.status === 401 && config.requiresAuth !== false && this.refreshToken) {
            if (!this.isRefreshing) {
                this.isRefreshing = true;
                try {
                    const refreshResponse = await fetch(`${API_URL}/api/auth/refresh`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ refreshToken: this.refreshToken }),
                    });

                    if (refreshResponse.ok) {
                        const { accessToken } = await refreshResponse.json();
                        this.setAccessToken(accessToken);
                        this.onRefreshed(accessToken);
                        this.isRefreshing = false;
                    } else {
                        this.clearTokens();
                        this.isRefreshing = false;
                        if (typeof window !== 'undefined') {
                            window.location.href = '/login';
                        }
                        throw new Error('Session expired');
                    }
                } catch (error) {
                    this.isRefreshing = false;
                    throw error;
                }
            }

            // Wait for refresh to complete and retry
            const newToken = await new Promise<string>((resolve) => {
                this.subscribeTokenRefresh((token) => resolve(token));
            });

            (headers as any)['Authorization'] = `Bearer ${newToken}`;
            response = await fetch(url, {
                ...config,
                headers,
            });
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }

        return data as T;
    }
}

export const apiClient = new ApiClient();
