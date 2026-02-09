// View Types for OKRs and Dashboards

export type ViewType = 'okr' | 'dashboard';

export type WidgetType = 
  | 'metric_card'
  | 'okr_list'
  | 'sector_overview'
  | 'progress_chart'
  | 'quick_stats'
  | 'task_summary';

export type WidgetSize = 'small' | 'medium' | 'large' | 'full';

// OKR View Filters
export interface OKRViewFilters {
  cycleId?: string;
  sectorIds?: string[];
  status?: ('on-track' | 'attention' | 'critical' | 'completed')[];
  ownerIds?: string[];
  search?: string;
  viewMode?: 'grid' | 'list';
  sortBy?: 'progress' | 'created_at' | 'updated_at' | 'title';
  sortOrder?: 'asc' | 'desc';
}

// Dashboard Layout Config
export interface DashboardLayout {
  columns?: number;
  globalFilters?: {
    cycleId?: string;
    sectorId?: string;
  };
}

// Widget Configuration
export interface WidgetConfig {
  metricType?: string;
  showTrend?: boolean;
  limit?: number;
  sectorId?: string;
  statusFilter?: string[];
  [key: string]: unknown;
}

// User View (from database)
export interface UserView {
  id: string;
  user_id: string;
  name: string;
  type: ViewType;
  filters: OKRViewFilters | DashboardLayout;
  layout: DashboardLayout;
  is_default: boolean;
  is_shared: boolean;
  shared_with: string[];
  created_at: string;
  updated_at: string;
}

// Dashboard Widget (from database)
export interface DashboardWidget {
  id: string;
  view_id: string;
  type: WidgetType;
  title?: string;
  config: WidgetConfig;
  position: number;
  size: WidgetSize;
  created_at: string;
}

// Input types for mutations
export interface CreateViewInput {
  name: string;
  type: ViewType;
  filters?: OKRViewFilters | DashboardLayout;
  layout?: DashboardLayout;
  is_default?: boolean;
  is_shared?: boolean;
  shared_with?: string[];
}

export interface UpdateViewInput {
  id: string;
  name?: string;
  filters?: OKRViewFilters | DashboardLayout;
  layout?: DashboardLayout;
  is_default?: boolean;
  is_shared?: boolean;
  shared_with?: string[];
}

export interface CreateWidgetInput {
  view_id: string;
  type: WidgetType;
  title?: string;
  config?: WidgetConfig;
  position?: number;
  size?: WidgetSize;
}

export interface UpdateWidgetInput {
  id: string;
  title?: string;
  config?: WidgetConfig;
  position?: number;
  size?: WidgetSize;
}
