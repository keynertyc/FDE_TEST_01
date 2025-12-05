import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RoleProtectedRoute } from '../components/RoleProtectedRoute';
import { UserRole } from '@/types';

let mockAuthState = {
  isAuthenticated: false,
  user: null as { id: string; email: string; role: UserRole } | null,
};

vi.mock('@/store/auth', () => ({
  useAuthStore: () => mockAuthState,
}));

describe('RoleProtectedRoute', () => {
  beforeEach(() => {
    mockAuthState = {
      isAuthenticated: false,
      user: null,
    };
  });

  it('should render children when user has allowed role', () => {
    // Arrange
    mockAuthState = {
      isAuthenticated: true,
      user: { id: '1', email: 'admin@test.com', role: UserRole.ADMIN },
    };

    // Act
    render(
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <RoleProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <div>Admin Content</div>
              </RoleProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    );

    // Assert
    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('should redirect to dashboard when user does not have allowed role', () => {
    // Arrange
    mockAuthState = {
      isAuthenticated: true,
      user: { id: '2', email: 'client@test.com', role: UserRole.CLIENT },
    };

    // Act
    render(
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <RoleProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <div>Admin Content</div>
              </RoleProtectedRoute>
            }
          />
          <Route path="/dashboard" element={<div>Dashboard Page</div>} />
        </Routes>
      </BrowserRouter>
    );

    // Assert
    expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('should redirect to login when user is not authenticated', () => {
    // Arrange
    mockAuthState = {
      isAuthenticated: false,
      user: null,
    };

    // Act
    render(
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <RoleProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <div>Admin Content</div>
              </RoleProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </BrowserRouter>
    );

    // Assert
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });
});
