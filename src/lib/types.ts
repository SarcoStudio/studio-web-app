// User and Authentication Types
export interface User {
  username: string;
  email?: string;
  attributes?: Record<string, any>;
  signInDetails?: {
    loginId: string;
    authFlowType: string;
  };
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error?: string;
}

// Navigation Types
export interface NavigationItem {
  name: string;
  path: string;
  icon: string;
  description?: string;
  requiresAuth?: boolean;
}

export interface NavigationSection {
  title: string;
  showTitle: boolean;
  items: NavigationItem[];
}

// Equipment Types
export interface Equipment {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  location?: string;
  specifications?: Record<string, any>;
  lastMaintenance?: Date;
  nextMaintenance?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface EquipmentFormData {
  name: string;
  type: string;
  location?: string;
  specifications?: Record<string, any>;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  sku: string;
  description?: string;
  specifications?: Record<string, any>;
  category?: string;
  status: 'active' | 'inactive' | 'discontinued';
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductFormData {
  name: string;
  sku: string;
  description?: string;
  specifications?: Record<string, any>;
  category?: string;
}

// Production Types
export interface Production {
  id: string;
  name: string;
  productId: string;
  equipmentId: string;
  batchNumber: string;
  quantity: number;
  targetQuantity: number;
  status: 'planned' | 'in-progress' | 'completed' | 'paused' | 'cancelled';
  startDate?: Date;
  endDate?: Date;
  estimatedDuration?: number; // in minutes
  actualDuration?: number; // in minutes
  efficiency?: number; // percentage
  qualityScore?: number; // percentage
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductionFormData {
  name: string;
  productId: string;
  equipmentId: string;
  batchNumber: string;
  targetQuantity: number;
  startDate?: Date;
  estimatedDuration?: number;
}

// Shift Types
export interface Shift {
  id: string;
  name: string;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  supervisorId?: string;
  productionIds: string[];
  status: 'scheduled' | 'active' | 'completed';
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShiftFormData {
  name: string;
  startTime: string;
  endTime: string;
  supervisorId?: string;
  date: Date;
}

// Production Data Types
export interface ProductionData {
  id: string;
  productionId: string;
  timestamp: Date;
  quantity: number;
  qualityMetrics?: Record<string, number>;
  efficiency: number;
  downtime?: number; // in minutes
  notes?: string;
}

// Monitoring Types
export interface MonitoringAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  source: string; // equipment ID or system component
  timestamp: Date;
  acknowledged: boolean;
  resolvedAt?: Date;
}

export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  networkLatency: number;
  activeConnections: number;
  uptime: number; // in seconds
  lastUpdate: Date;
}

// Report Types
export interface Report {
  id: string;
  title: string;
  type: 'production' | 'equipment' | 'quality' | 'efficiency' | 'custom';
  generatedAt: Date;
  generatedBy: string; // user ID
  parameters?: Record<string, any>;
  data?: any;
  format: 'pdf' | 'csv' | 'json';
  filePath?: string;
}

export interface ReportConfig {
  type: Report['type'];
  title: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  filters?: Record<string, any>;
  groupBy?: string[];
  metrics?: string[];
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'date' | 'time' | 'checkbox';
  required?: boolean;
  options?: { label: string; value: string }[]; // for select fields
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: (value: any) => string | null;
  };
}

export interface FormState {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

// Table Types
export interface TableColumn<T = any> {
  key: keyof T | string;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, record: T) => React.ReactNode;
  width?: string | number;
}

export interface TableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  onFilter?: (filters: Record<string, any>) => void;
}

// Dashboard Types
export interface DashboardCard {
  id: string;
  title: string;
  value: string | number;
  change?: {
    value: string;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon?: string;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'gray';
}

export interface DashboardMetric {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'stable';
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

// Theme Types
export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  borderRadius: string;
  fontFamily: string;
}

// Environment Types
export interface EnvironmentConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  NEXT_PUBLIC_AWS_REGION: string;
  NEXT_PUBLIC_USER_POOL_ID: string;
  NEXT_PUBLIC_USER_POOL_WEB_CLIENT_ID: string;
  NEXT_PUBLIC_API_URL?: string;
  NEXT_PUBLIC_APP_VERSION?: string;
}