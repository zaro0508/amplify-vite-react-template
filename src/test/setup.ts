import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.alert
global.alert = vi.fn();

// Mock AWS Amplify Storage
vi.mock('aws-amplify/storage', () => ({
  uploadData: vi.fn(() => ({
    result: Promise.resolve({
      path: 'uploads/test-file.txt',
      key: 'test-file.txt',
    }),
  })),
}));

// Mock Amplify configure
vi.mock('aws-amplify', () => ({
  Amplify: {
    configure: vi.fn(),
  },
}));
