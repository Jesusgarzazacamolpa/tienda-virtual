import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';

import { useCartStore } from '@/store/cart-store';
import { useToastStore } from '@/store/toast-store';

beforeEach(() => {
  localStorage.clear();
  useCartStore.setState({ lines: [] });
  useToastStore.setState({ toasts: [] });
});

afterEach(() => {
  cleanup();
});
