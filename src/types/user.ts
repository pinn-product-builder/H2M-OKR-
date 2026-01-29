export type AppRole = 'admin' | 'gestor' | 'analista' | 'visualizador';

export interface UserRole {
  id: string;
  userId: string;
  role: AppRole;
  createdAt?: string;
}

export interface RolePermissions {
  canManageUsers: boolean;
  canAccessDataHub: boolean;
  canImportData: boolean;
  canDeleteData: boolean;
  canManageOKRs: boolean;
  canEditOKRs: boolean;
  canViewDashboard: boolean;
  canManageSettings: boolean;
}

export interface RoleConfig {
  role: AppRole;
  label: string;
  description: string;
  color: string;
  permissions: RolePermissions;
}

export const ROLE_CONFIGS: RoleConfig[] = [
  {
    role: 'admin',
    label: 'Administrador',
    description: 'Acesso total ao sistema, gestão de usuários e configurações',
    color: 'hsl(var(--primary))',
    permissions: {
      canManageUsers: true,
      canAccessDataHub: true,
      canImportData: true,
      canDeleteData: true,
      canManageOKRs: true,
      canEditOKRs: true,
      canViewDashboard: true,
      canManageSettings: true,
    },
  },
  {
    role: 'gestor',
    label: 'Gestor',
    description: 'Gerencia OKRs do setor, edita KRs e acompanha indicadores',
    color: 'hsl(var(--accent))',
    permissions: {
      canManageUsers: false,
      canAccessDataHub: true,
      canImportData: true,
      canDeleteData: false,
      canManageOKRs: true,
      canEditOKRs: true,
      canViewDashboard: true,
      canManageSettings: false,
    },
  },
  {
    role: 'analista',
    label: 'Analista',
    description: 'Atualiza progresso de KRs e adiciona observações',
    color: 'hsl(var(--muted-foreground))',
    permissions: {
      canManageUsers: false,
      canAccessDataHub: false,
      canImportData: false,
      canDeleteData: false,
      canManageOKRs: false,
      canEditOKRs: true,
      canViewDashboard: true,
      canManageSettings: false,
    },
  },
  {
    role: 'visualizador',
    label: 'Visualizador',
    description: 'Apenas visualização de dashboards e relatórios',
    color: 'hsl(var(--muted))',
    permissions: {
      canManageUsers: false,
      canAccessDataHub: false,
      canImportData: false,
      canDeleteData: false,
      canManageOKRs: false,
      canEditOKRs: false,
      canViewDashboard: true,
      canManageSettings: false,
    },
  },
];

export function getRoleConfig(role: AppRole): RoleConfig {
  return ROLE_CONFIGS.find(r => r.role === role) || ROLE_CONFIGS[3];
}

export function getRolePermissions(role?: string): RolePermissions {
  const config = ROLE_CONFIGS.find(r => r.role === role);
  if (config) {
    return config.permissions;
  }
  // Default to admin permissions for backward compatibility (mock uses 'admin')
  return ROLE_CONFIGS[0].permissions;
}
