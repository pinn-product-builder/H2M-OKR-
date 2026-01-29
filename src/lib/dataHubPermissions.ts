import { DataHubPermissions } from '@/types/dataHub';

/**
 * Check Data Hub access permissions based on user role.
 * Only 'admin' and 'gestor' roles have full access.
 * 'analista' can import but not delete or manage mappings.
 * 'visualizador' cannot access the Data Hub at all.
 */
export function checkDataHubAccess(userRole?: string): DataHubPermissions {
  switch (userRole) {
    case 'admin':
      return {
        canView: true,
        canImport: true,
        canDelete: true,
        canExport: true,
        canManageMappings: true,
      };
    case 'gestor':
      return {
        canView: true,
        canImport: true,
        canDelete: false,
        canExport: true,
        canManageMappings: true,
      };
    case 'analista':
      // Analistas cannot access Data Hub (restricted to admin/gestor)
      return {
        canView: false,
        canImport: false,
        canDelete: false,
        canExport: false,
        canManageMappings: false,
      };
    case 'visualizador':
      // Visualizadores cannot access Data Hub
      return {
        canView: false,
        canImport: false,
        canDelete: false,
        canExport: false,
        canManageMappings: false,
      };
    default:
      // Default to admin for backward compatibility (mock uses 'admin' role)
      return {
        canView: true,
        canImport: true,
        canDelete: true,
        canExport: true,
        canManageMappings: true,
      };
  }
}
