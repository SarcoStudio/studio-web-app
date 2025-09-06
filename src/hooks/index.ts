// Re-export all custom hooks
// Usage: import { useAuth, useLocalStorage } from '@/hooks';

// Import useAuth from providers since it's defined there
export { useAuth } from '@/components/providers/AuthProvider';

// Add other custom hooks as you create them:
// export { useLocalStorage } from './useLocalStorage';
// export { useDebounce } from './useDebounce';
// export { useApi } from './useApi';