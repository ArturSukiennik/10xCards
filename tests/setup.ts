/* eslint-disable */
import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Automatically cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock ResizeObserver which is not available in jsdom
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock Intersection Observer
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  root: null,
  rootMargin: "",
  thresholds: [],
}));

// Suppress console errors during tests
console.error = vi.fn();

// Configure fetch API for tests
global.fetch = vi.fn();

// Configure AbortController for tests
vi.stubGlobal(
  "AbortController",
  vi.fn(() => ({
    signal: { aborted: false },
    abort: vi.fn(),
  })),
);

// Configure crypto for tests
Object.defineProperty(global, "crypto", {
  value: {
    getRandomValues: vi.fn((buffer) => buffer),
    subtle: {},
    randomUUID: vi.fn(() => "test-uuid"),
  },
  configurable: true,
});
