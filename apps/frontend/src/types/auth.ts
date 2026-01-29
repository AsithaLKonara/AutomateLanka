export interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

export interface Plan {
  id: string;
  name: string;
  slug: string;
  runsPerMonth: number;
  maxWorkflows: number;
  maxMembers: number;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  ownerId?: string;
  planId?: string;
  plan?: Plan;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    memberships: number;
    workflows: number;
    runs: number;
  };
  userRole?: string;
}

export interface AuthResponse {
  user: User;
  workspace: Workspace;
  accessToken: string;
  refreshToken: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  workspaceName?: string;
}

export interface AuthContextType {
  user: User | null;
  workspace: Workspace | null;
  workspaces: Workspace[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  switchWorkspace: (workspaceId: string) => void;
  refreshUser: () => Promise<void>;
}

