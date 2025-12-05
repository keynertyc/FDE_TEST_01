import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage';

describe('LoginPage', () => {
  it('should render login form', () => {
    // Arrange & Act
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    // Assert
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('should have a link to register page', () => {
    // Arrange & Act
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    // Assert
    const registerLink = screen.getByRole('link', { name: /register/i });
    expect(registerLink).toBeInTheDocument();
    expect(registerLink).toHaveAttribute('href', '/register');
  });
});
