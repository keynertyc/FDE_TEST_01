import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../store/auth';
import { UserRole } from '@/types';

describe('useAuthStore', () => {
  beforeEach(() => {
    // Clear store state before each test
    useAuthStore.getState().logout();
    localStorage.clear();
  });

  it('should have initial state with no user', () => {
    // Arrange & Act
    const state = useAuthStore.getState();

    // Assert
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should set authentication state when setAuth is called', () => {
    // Arrange
    const mockUser = {
      id: '123',
      email: 'test@test.com',
      name: 'Test User',
      role: UserRole.CLIENT,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const mockToken = 'jwt-token-123';

    // Act
    useAuthStore.getState().setAuth(mockUser, mockToken);
    const state = useAuthStore.getState();

    // Assert
    expect(state.user).toEqual(mockUser);
    expect(state.token).toBe(mockToken);
    expect(state.isAuthenticated).toBe(true);
    expect(localStorage.getItem('token')).toBe(mockToken);
    expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser));
  });

  it('should clear authentication state when logout is called', () => {
    // Arrange
    const mockUser = {
      id: '123',
      email: 'test@test.com',
      name: 'Test User',
      role: UserRole.ADMIN,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const mockToken = 'jwt-token-123';
    
    useAuthStore.getState().setAuth(mockUser, mockToken);

    // Act
    useAuthStore.getState().logout();
    const state = useAuthStore.getState();

    // Assert
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('should persist token in localStorage', () => {
    // Arrange
    const mockUser = {
      id: '456',
      email: 'admin@test.com',
      name: 'Admin User',
      role: UserRole.ADMIN,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const mockToken = 'admin-token-456';

    // Act
    useAuthStore.getState().setAuth(mockUser, mockToken);

    // Assert
    expect(localStorage.getItem('token')).toBe(mockToken);
    expect(JSON.parse(localStorage.getItem('user') || '{}')).toEqual(mockUser);
  });
});
