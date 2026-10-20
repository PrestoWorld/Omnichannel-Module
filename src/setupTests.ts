import '@testing-library/jest-dom';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn(() => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
});

vi.stubGlobal('scrollIntoView', vi.fn());
(HTMLElement.prototype as any).scrollIntoView = vi.fn();
