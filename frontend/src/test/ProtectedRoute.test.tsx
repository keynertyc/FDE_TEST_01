import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';

const mockUseAuthStore = vi.fn();

vi.mock('@/store/auth', () => ({
  useAuthStore: (selector: (state: { isAuthenticated: boolean; user: unknown; token: unknown }) => unknown) => mockUseAuthStore(selector),
}));

describe('ProtectedRoute', () => {
  it('should render children when user is authenticated', () => {
    // Arrange
    mockUseAuthStore.mockImplementation((selector) =>
      selector({ isAuthenticated: true, user: null, token: null })
    );

    // Act
    render(
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    );

    // Assert
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should redirect to login when user is not authenticated', () => {
    // Arrange
    mockUseAuthStore.mockImplementation((selector) =>
      selector({ isAuthenticated: false, user: null, token: null })
    );

    // Act
    render(
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </BrowserRouter>
    );

    // Assert
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
