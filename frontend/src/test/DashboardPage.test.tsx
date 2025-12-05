import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { DashboardPage } from '../pages/DashboardPage';
import { dashboardApi } from '@/services/api';
import { ProjectStatus } from '@/types';

vi.mock('@/services/api', () => ({
  dashboardApi: {
    getStats: vi.fn(),
  },
}));

vi.mock('@/store/auth', () => ({
  useAuthStore: vi.fn(() => ({
    user: { id: '1', email: 'test@test.com', name: 'Test User', role: 'ADMIN' },
    isAuthenticated: true,
  })),
}));

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    // Arrange
    vi.mocked(dashboardApi.getStats).mockImplementation(() => new Promise(() => {}));

    // Act
    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    // Assert
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should render dashboard stats after loading', async () => {
    // Arrange
    const mockStats = {
      totalProjects: 10,
      activeProjects: 5,
      completedProjects: 3,
      onHoldProjects: 2,
      recentProjects: [],
    };

    vi.mocked(dashboardApi.getStats).mockResolvedValue(mockStats);

    // Act
    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    // Assert
    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument(); // Total projects
      expect(screen.getByText('5')).toBeInTheDocument(); // Active
      expect(screen.getByText('3')).toBeInTheDocument(); // Completed
      expect(screen.getByText('2')).toBeInTheDocument(); // On Hold
    });
  });

  it('should display recent projects when available', async () => {
    // Arrange
    const mockStats = {
      totalProjects: 2,
      activeProjects: 1,
      completedProjects: 1,
      onHoldProjects: 0,
      recentProjects: [
        {
          id: '1',
          name: 'Project 1',
          description: 'Description 1',
          status: ProjectStatus.ACTIVE,
          clientId: null,
          createdById: '1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Project 2',
          description: 'Description 2',
          status: ProjectStatus.COMPLETED,
          clientId: null,
          createdById: '1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    };

    vi.mocked(dashboardApi.getStats).mockResolvedValue(mockStats);

    // Act
    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Project 1')).toBeInTheDocument();
      expect(screen.getByText('Project 2')).toBeInTheDocument();
    });
  });

  it('should display "No projects yet" when no recent projects', async () => {
    // Arrange
    const mockStats = {
      totalProjects: 0,
      activeProjects: 0,
      completedProjects: 0,
      onHoldProjects: 0,
      recentProjects: [],
    };

    vi.mocked(dashboardApi.getStats).mockResolvedValue(mockStats);

    // Act
    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/no projects yet/i)).toBeInTheDocument();
    });
  });
});
