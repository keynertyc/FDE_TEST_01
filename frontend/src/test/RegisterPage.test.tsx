import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { RegisterPage } from '../pages/RegisterPage';

describe('RegisterPage', () => {
  it('should render register form', () => {
    // Arrange & Act
    render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    );

    // Assert
    expect(screen.getByRole('heading', { name: /register/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByText(/role/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  it('should have a link to login page', () => {
    // Arrange & Act
    render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    );

    // Assert
    const loginLink = screen.getByRole('link', { name: /login/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  it('should have role selector with Client and Admin options', () => {
    // Arrange & Act
    render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    );

    // Assert
    expect(screen.getByText(/role/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});
