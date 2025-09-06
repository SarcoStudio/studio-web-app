// Navigation configuration
export const navigationConfig = [
  {
    title: 'Operations',
    showTitle: false, // Set to true if you want section headers
    items: [
      { 
        name: 'Dashboard', 
        path: '/', 
        icon: '🏠' 
      },
      { 
        name: 'Production', 
        path: '/production', 
        icon: '🏭' 
      },
      { 
        name: 'Monitoring', 
        path: '/monitoring', 
        icon: '📊' 
      },
      { 
        name: 'Reports', 
        path: '/reports', 
        icon: '📈' 
      },
    ]
  },
  {
    title: 'System',
    showTitle: false,
    items: [
      { 
        name: 'Equipment Setup', 
        path: '/equipment-setup', 
        icon: '⚙️' 
      },
      { 
        name: 'Product Setup', 
        path: '/product-setup', 
        icon: '📦' 
      },
      { 
        name: 'Production Setup', 
        path: '/production-setup', 
        icon: '🔧' 
      },
    ]
  }
];

// App constants
export const APP_CONFIG = {
  name: 'Sarco Studio',
  version: '0.1.0',
  description: 'Production Management System',
  author: 'Sarco Studio Team',
} as const;

// API endpoints (if using custom API)
export const API_ENDPOINTS = {
  equipment: '/api/equipment',
  product: '/api/product',
  production: '/api/production',
  'production-data': '/api/production-data',
  'shift-info': '/api/shift-info',
  'test-db': '/api/test-db',
} as const;

// Theme colors
export const THEME_COLORS = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    900: '#1e3a8a',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  sidebar: '#2A3142',
  accent: '#A0A5B0',
} as const;

// Status types for production/equipment
export const STATUS_TYPES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  MAINTENANCE: 'maintenance',
  ERROR: 'error',
} as const;

// Form validation messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  PASSWORD_MIN_LENGTH: 'Password must be at least 8 characters',
  PASSWORDS_NOT_MATCH: 'Passwords do not match',
} as const;

// Time formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  INPUT: 'yyyy-MM-dd',
  DATETIME: 'MMM dd, yyyy HH:mm',
  TIME: 'HH:mm',
} as const;