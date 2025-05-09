import "@testing-library/jest-dom";
import { vi, beforeAll, afterEach, afterAll } from "vitest";
import { setupServer } from "msw/node";

// Mock global fetch and other APIs if needed
globalThis.fetch = vi.fn();

// Setup MSW server to intercept requests
export const server = setupServer();

// Start MSW server before all tests
beforeAll(() => server.listen());

// Reset request handlers between tests
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});

// Clean up after all tests are done
afterAll(() => server.close());
